import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CreateCandidateProfileDto } from './dto/create-candidate-profile.dto';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';
import { CandidateProfileResponseDto } from './dto/candidate-profile-response.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  @Post('profile')
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @Body() createDto: CreateCandidateProfileDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: CandidateProfileResponseDto }> {
    const profile = await this.candidateService.createCandidateProfile(
      req.user.id,
      createDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      data: profile,
    };
  }

  @Get('profile')
  async getProfile(
    @Req() req: any,
  ): Promise<{ statusCode: number; data: CandidateProfileResponseDto }> {
    const profile = await this.candidateService.getCandidateProfile(
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: profile,
    };
  }

  @Get('profile/current')
  async GetCurrentCandidateProfile(@Req() req) {
    const userId = req.user.id;
    return this.candidateService.getCandidateProfile(userId);
  }

  @Get('profile/user')
  async getCandidateByUserId(
    @Req() req: any,
  ): Promise<{ statusCode: number; data: CandidateProfileResponseDto }> {
    const profile = await this.candidateService.getCandidateProfileById(
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: profile,
    };
  }

  @Get('recommendations/jobs')
  async getRecommendedJobs(
    @Req() req: any,
    @Query('topK') topK?: string,
  ): Promise<{ statusCode: number; data: any[] }> {
    const parsedTopK = Number(topK);
    const safeTopK = Number.isFinite(parsedTopK)
      ? Math.max(1, Math.min(50, parsedTopK))
      : 10;

    const jobs = await this.candidateService.getRecommendedJobs(
      req.user.id,
      safeTopK,
    );

    return {
      statusCode: HttpStatus.OK,
      data: jobs,
    };
  }

  @Patch('profile')
  async updateProfile(
    @Body() updateDto: UpdateCandidateProfileDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: CandidateProfileResponseDto }> {
    const profile = await this.candidateService.updateCandidateProfile(
      req.user.id,
      updateDto,
    );

    return {
      statusCode: HttpStatus.OK,
      data: profile,
    };
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Req() req: any): Promise<void> {
    await this.candidateService.deleteCandidateProfile(req.user.id);
  }

  @Get(':id')
  async getCandidateById(
    @Param('id') id: string,
  ): Promise<{ statusCode: number; data: CandidateProfileResponseDto }> {
    const profile = await this.candidateService.getCandidateProfileById(
      parseInt(id),
    );

    return {
      statusCode: HttpStatus.OK,
      data: profile,
    };
  }
}
