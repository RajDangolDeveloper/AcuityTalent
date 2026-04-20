import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, map, Observable, of, retry } from 'rxjs';
import { MatchRequest } from './dto/match-request.dto';
import { MatchResponse } from './dto/match-response.dto';
import { ScoreRequest } from './dto/score-request.dto';
import { ScoreResponse } from './dto/score-response.dto';
import { CoverLetterRequest } from './dto/cover-letter-request.dto';
import { CoverLetterResponse } from './dto/cover-letter-response.dto';
import { RewriteRequest } from './dto/rewrite-request.dto';
import { RewriteResponse } from './dto/rewrite-response.dto';
import { ReviewRequest } from './dto/review-request.dto';
import { ReviewResponse } from './dto/review-response.dto';
import { EmbeddingRequest } from './dto/embedding-request.dto';
import { EmbeddingResponse } from './dto/embedding-response.dto';
import { JobRecommendationsResponse } from './dto/job-recommendations-response.dto';
import { RiskAssessmentRequest } from './dto/risk-assessment-request.dto';
import { RiskAssessmentResponse } from './dto/risk-assessment-response.dto';

@Injectable()
export class AiService {
  constructor(private readonly httpService: HttpService) {}

  private readonly baseUrl =
    process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/api';

  private getTextFromPayload(payload: unknown): string {
    if (typeof payload === 'string') {
      return payload.trim();
    }

    if (!payload || typeof payload !== 'object') {
      return '';
    }

    const node = payload as Record<string, unknown>;

    for (const key of ['improved_text', 'cover_letter', 'summary', 'text']) {
      const value = node[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    const response = node.response;
    if (typeof response === 'string' && response.trim()) {
      return response.trim();
    }
    if (response && typeof response === 'object') {
      const nested = this.getTextFromPayload(response);
      if (nested) {
        return nested;
      }
    }

    const result = node.result;
    if (result && typeof result === 'object') {
      const nested = this.getTextFromPayload(result);
      if (nested) {
        return nested;
      }
    }

    return '';
  }

  private getUsageFromPayload(payload: unknown): RewriteResponse['usage'] {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const node = payload as Record<string, unknown>;
    const usage = node.usage;
    if (usage && typeof usage === 'object') {
      const usageNode = usage as Record<string, unknown>;
      return {
        prompt_tokens:
          typeof usageNode.prompt_tokens === 'number'
            ? usageNode.prompt_tokens
            : undefined,
        completion_tokens:
          typeof usageNode.completion_tokens === 'number'
            ? usageNode.completion_tokens
            : undefined,
        total_tokens:
          typeof usageNode.total_tokens === 'number'
            ? usageNode.total_tokens
            : undefined,
      };
    }

    const response = node.response;
    if (response && typeof response === 'object') {
      return this.getUsageFromPayload(response);
    }

    const result = node.result;
    if (result && typeof result === 'object') {
      return this.getUsageFromPayload(result);
    }

    return undefined;
  }

  private parseReviewSections(
    text: string,
  ): Pick<ReviewResponse, 'summary' | 'strength' | 'changes' | 'tips'> {
    const sections = { summary: '', strength: '', changes: '', tips: '' };
    let current: keyof typeof sections | null = null;

    for (const line of text.split(/\r?\n/)) {
      const upper = line.trim().toUpperCase();
      if (upper.startsWith('SUMMARY:')) {
        current = 'summary';
        continue;
      }
      if (upper.startsWith('STRENGTHS:')) {
        current = 'strength';
        continue;
      }
      if (upper.startsWith('CHANGES:')) {
        current = 'changes';
        continue;
      }
      if (upper.startsWith('TIPS:')) {
        current = 'tips';
        continue;
      }

      if (current) {
        sections[current] += `${line}\n`;
      }
    }

    const parsed = {
      summary: sections.summary.trim(),
      strength: sections.strength.trim(),
      changes: sections.changes.trim(),
      tips: sections.tips.trim(),
    };

    if (
      !parsed.summary &&
      !parsed.strength &&
      !parsed.changes &&
      !parsed.tips
    ) {
      parsed.summary = text.trim();
    }

    return parsed;
  }

  private normalizeRewriteResponse(payload: unknown): RewriteResponse {
    if (payload && typeof payload === 'object') {
      const node = payload as Record<string, unknown>;
      const improvedText =
        typeof node.improved_text === 'string' && node.improved_text.trim()
          ? node.improved_text.trim()
          : this.getTextFromPayload(payload);

      return {
        improved_text: improvedText,
        status:
          typeof node.status === 'string' && node.status.trim()
            ? node.status
            : improvedText
              ? 'success'
              : 'error',
        usage: this.getUsageFromPayload(payload),
        raw_response: improvedText || undefined,
      };
    }

    const improvedText = this.getTextFromPayload(payload);
    return {
      improved_text: improvedText,
      status: improvedText ? 'success' : 'error',
      raw_response: improvedText || undefined,
    };
  }

  private normalizeReviewResponse(payload: unknown): ReviewResponse {
    if (payload && typeof payload === 'object') {
      const node = payload as Record<string, unknown>;
      const hasStructuredFields =
        typeof node.summary === 'string' ||
        typeof node.strength === 'string' ||
        typeof node.changes === 'string' ||
        typeof node.tips === 'string';

      const rawText = this.getTextFromPayload(payload);
      const parsed = this.parseReviewSections(rawText);

      return {
        summary:
          typeof node.summary === 'string'
            ? node.summary
            : hasStructuredFields
              ? ''
              : parsed.summary,
        strength:
          typeof node.strength === 'string'
            ? node.strength
            : hasStructuredFields
              ? ''
              : parsed.strength,
        changes:
          typeof node.changes === 'string'
            ? node.changes
            : hasStructuredFields
              ? ''
              : parsed.changes,
        tips:
          typeof node.tips === 'string'
            ? node.tips
            : hasStructuredFields
              ? ''
              : parsed.tips,
        status:
          typeof node.status === 'string' && node.status.trim()
            ? node.status
            : 'success',
        usage: this.getUsageFromPayload(payload),
        raw_response: rawText || undefined,
      };
    }

    const rawText = this.getTextFromPayload(payload);
    const parsed = this.parseReviewSections(rawText);
    return {
      ...parsed,
      status: rawText ? 'success' : 'error',
      raw_response: rawText || undefined,
    };
  }

  getScore(data: MatchRequest): Observable<MatchResponse> {
    const url = `${this.baseUrl}/getscore`;
    return this.httpService.post<MatchResponse>(url, data).pipe(
      map((res) => res.data),
      retry(3),
      catchError((err) => {
        return of({ similarity_score: 0, status: 'error' });
      }),
    );
  }

  getMatchingScore(data: MatchRequest): Observable<MatchResponse> {
    const url = `${this.baseUrl}/matching-score`;
    return this.httpService.post<MatchResponse>(url, data).pipe(
      map((res) => res.data),
      retry(3),
      catchError((err) => {
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail;
        return of({ similarity_score: 0, status: 'error' });
      }),
    );
  }

  getResumeScore(data: ScoreRequest): Observable<ScoreResponse> {
    const url = `${this.baseUrl}/resume-score`;
    return this.httpService.post<ScoreResponse>(url, data).pipe(
      map((res) => res.data),
      retry(3),
      catchError((err) => {
        return of({ resume_score: 0, status: 'error' });
      }),
    );
  }

  generateCoverLetter(
    data: CoverLetterRequest,
  ): Observable<CoverLetterResponse> {
    const url = `${this.baseUrl}/generate-cover-letter`;
    return this.httpService.post<CoverLetterResponse>(url, data).pipe(
      map((res) => res.data),
      retry(3),
      catchError((err) => {
        return of({ cover_letter: '', status: 'error' });
      }),
    );
  }

  /**
   * Improve text (rewrite professionally)
   */
  improveText(data: RewriteRequest): Observable<RewriteResponse> {
    const url = `${this.baseUrl}/improve-text`;
    return this.httpService.post(url, data).pipe(
      map((res) => this.normalizeRewriteResponse(res.data)),
      retry(3),
      catchError((err) => {
        return of({ improved_text: '', status: 'error' });
      }),
    );
  }

  /**
   * Review and provide feedback on a resume
   */
  reviewResume(data: ReviewRequest): Observable<ReviewResponse> {
    const url = `${this.baseUrl}/review-resume`;
    return this.httpService.post(url, data).pipe(
      map((res) => this.normalizeReviewResponse(res.data)),
      retry(3),
      catchError((err) => {
        return of({
          summary: '',
          strength: '',
          changes: '',
          tips: '',
          status: 'error',
        });
      }),
    );
  }

  getRiskAssessment(
    data: RiskAssessmentRequest,
  ): Observable<RiskAssessmentResponse> {
    const url = `${this.baseUrl}/risk-assessment`;
    return this.httpService.post<RiskAssessmentResponse>(url, data).pipe(
      map((res) => res.data),
      retry(3),
      catchError((err) => {
        const fallback: RiskAssessmentResponse = {
          risk_score: 0,
          risk_label: 'LOW',
          stability_score: 0,
          skill_gap_score: 0,
          salary_alignment_score: 0,
          reliability_score: 0,
          status: 'error',
        };
        return of(fallback);
      }),
    );
  }

  async generateEmbedding(data: EmbeddingRequest): Promise<EmbeddingResponse> {
    const url = `${this.baseUrl}/embeddings`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      return { embedding: [], status: 'error' };
    }
  }

  /**
   * Get job recommendations for a candidate
   */
  getJobRecommendations(
    candidateId: number,
    topK: number = 10,
  ): Observable<JobRecommendationsResponse> {
    const url = `${this.baseUrl}/candidates/${candidateId}/recommendations?top_k=${topK}`;
    return this.httpService.get<JobRecommendationsResponse>(url).pipe(
      map((res) => res.data),
      retry(3),
      catchError((err) => {
        return of({
          recommendations: [],
          total_count: 0,
          status: 'error',
        });
      }),
    );
  }

  /**
   * Test database connection
   */
  testDatabase(): Observable<any> {
    const url = `${this.baseUrl}/testdatabase`;
    return this.httpService.get(url).pipe(
      map((res) => res.data),
      catchError((err) => {
        return of({ users: 0, status: 'error' });
      }),
    );
  }
}
