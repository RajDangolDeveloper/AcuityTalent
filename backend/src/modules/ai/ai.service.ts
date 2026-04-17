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

  getScore(data: MatchRequest): Observable<MatchResponse> {
    const url = `${this.baseUrl}/getscore`;
    return this.httpService.post<MatchResponse>(url, data).pipe(
      map((res) => res.data),
      retry(3),
      catchError((err) => {
        console.error('Error in getScore:', err);
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
        console.error('Error in getMatchingScore:', {
          status,
          detail,
          message: err?.message,
        });
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
        console.error('Error in getResumeScore:', err);
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
        console.error('Error in generateCoverLetter:', err);
        return of({ cover_letter: '', status: 'error' });
      }),
    );
  }

  /**
   * Improve text (rewrite professionally)
   */
  improveText(data: RewriteRequest): Observable<RewriteResponse> {
    const url = `${this.baseUrl}/improve-text`;
    return this.httpService.post<RewriteResponse>(url, data).pipe(
      map((res) => res.data),
      retry(3),
      catchError((err) => {
        console.error('Error in improveText:', err);
        return of({ improved_text: '', status: 'error' });
      }),
    );
  }

  /**
   * Review and provide feedback on a resume
   */
  reviewResume(data: ReviewRequest): Observable<ReviewResponse> {
    const url = `${this.baseUrl}/review-resume`;
    return this.httpService.post<ReviewResponse>(url, data).pipe(
      map((res) => res.data),
      retry(3),
      catchError((err) => {
        console.error('Error in reviewResume:', err);
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
        console.error('Error in getRiskAssessment:', err);
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
      console.error('Error in generateEmbedding:', err);
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
        console.error('Error in getJobRecommendations:', err);
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
        console.error('Error in testDatabase:', err);
        return of({ users: 0, status: 'error' });
      }),
    );
  }
}
