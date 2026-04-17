import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
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
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly userService: UserService,
  ) {}

  /**
   * Calculate similarity score between resume and job description
   */
  @Post('getscore')
  async getScore(@Body() data: MatchRequest): Promise<MatchResponse> {
    return firstValueFrom(this.aiService.getScore(data));
  }

  /**
   * Get matching score between resume and job description
   */
  @Post('matching-score')
  async getMatchingScore(@Body() data: MatchRequest): Promise<MatchResponse> {
    return firstValueFrom(this.aiService.getMatchingScore(data));
  }

  /**
   * Score a resume based on job description
   */
  @Post('resume-score')
  async getResumeScore(@Body() data: ScoreRequest): Promise<ScoreResponse> {
    return firstValueFrom(this.aiService.getResumeScore(data));
  }

  /**
   * Generate a professional cover letter
   */
  @Post('generate-cover-letter')
  @UseGuards(JwtAuthGuard)
  async generateCoverLetter(
    @Req() req: any,
    @Body() data: CoverLetterRequest,
  ): Promise<CoverLetterResponse> {
    const limit = await this.userService.canGenerateAiCoverLetter(req.user.id);

    if (!limit.allowed) {
      throw new ForbiddenException(
        'Cover letter generation limit reached for non-premium users',
      );
    }

    const result = await firstValueFrom(
      this.aiService.generateCoverLetter(data),
    );
    await this.userService.incrementCoverLetterGeneration(req.user.id);
    return result;
  }

  /**
   * Improve text (rewrite professionally)
   */
  @Post('improve-text')
  async improveText(@Body() data: RewriteRequest): Promise<RewriteResponse> {
    return firstValueFrom(this.aiService.improveText(data));
  }

  /**
   * Review and provide feedback on a resume
   */
  @Post('review-resume')
  async reviewResume(@Body() data: ReviewRequest): Promise<ReviewResponse> {
    return firstValueFrom(this.aiService.reviewResume(data));
  }

  @Post('risk-assessment')
  async getRiskAssessment(
    @Body() data: RiskAssessmentRequest,
  ): Promise<RiskAssessmentResponse> {
    return firstValueFrom(this.aiService.getRiskAssessment(data));
  }

  @Post('embeddings')
  async generateEmbedding(
    @Body() data: EmbeddingRequest,
  ): Promise<EmbeddingResponse> {
    console.log(data);
    return this.aiService.generateEmbedding(data);
  }

  @Get('candidates/:candidateId/recommendations')
  async getJobRecommendations(
    @Param('candidateId') candidateId: number,
    @Query('top_k') topK: number = 10,
  ): Promise<JobRecommendationsResponse> {
    return firstValueFrom(
      this.aiService.getJobRecommendations(candidateId, topK),
    );
  }

  /**
   * Test database connection
   */
  @Get('testdatabase')
  async testDatabase(): Promise<any> {
    return firstValueFrom(this.aiService.testDatabase());
  }
}
