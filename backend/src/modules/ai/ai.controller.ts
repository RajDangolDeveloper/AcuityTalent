import {
  Body,
  Controller,
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
import { PremiumGuard } from './guards/premium.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  


  @Post('getscore')
  async getScore(@Body() data: MatchRequest): Promise<MatchResponse> {
    return firstValueFrom(this.aiService.getScore(data));
  }

  


  @Post('matching-score')
  async getMatchingScore(@Body() data: MatchRequest): Promise<MatchResponse> {
    return firstValueFrom(this.aiService.getMatchingScore(data));
  }

  


  @Post('resume-score')
  async getResumeScore(@Body() data: ScoreRequest): Promise<ScoreResponse> {
    return firstValueFrom(this.aiService.getResumeScore(data));
  }

  


  @Post('generate-cover-letter')
  @UseGuards(JwtAuthGuard, PremiumGuard)
  async generateCoverLetter(
    @Req() req: any,
    @Body() data: CoverLetterRequest,
  ): Promise<CoverLetterResponse> {
    return firstValueFrom(this.aiService.generateCoverLetter(data));
  }

  


  @Post('improve-text')
  @UseGuards(JwtAuthGuard, PremiumGuard)
  async improveText(@Body() data: RewriteRequest): Promise<RewriteResponse> {
    return firstValueFrom(this.aiService.improveText(data));
  }

  


  @Post('review-resume')
  @UseGuards(JwtAuthGuard, PremiumGuard)
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

  


  @Get('testdatabase')
  async testDatabase(): Promise<any> {
    return firstValueFrom(this.aiService.testDatabase());
  }
}
