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
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { WorkExperienceResponseDto } from './dto/work-experience-response.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { EducationResponseDto } from './dto/education-response.dto';
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

  @Post('work-experience')
  @HttpCode(HttpStatus.CREATED)
  async createWorkExperience(
    @Body() createDto: CreateWorkExperienceDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: WorkExperienceResponseDto }> {
    const workExp = await this.candidateService.createWorkExperience(
      req.user.id,
      createDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      data: workExp,
    };
  }

  @Get('work-experience')
  async getWorkExperiences(
    @Req() req: any,
  ): Promise<{ statusCode: number; data: WorkExperienceResponseDto[] }> {
    const experiences = await this.candidateService.getWorkExperiences(
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: experiences,
    };
  }

  @Patch('work-experience/:id')
  async updateWorkExperience(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkExperienceDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: WorkExperienceResponseDto }> {
    const experience = await this.candidateService.updateWorkExperience(
      req.user.id,
      parseInt(id),
      updateDto,
    );

    return {
      statusCode: HttpStatus.OK,
      data: experience,
    };
  }

  @Delete('work-experience/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWorkExperience(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    await this.candidateService.deleteWorkExperience(req.user.id, parseInt(id));
  }

  @Post('education')
  @HttpCode(HttpStatus.CREATED)
  async createEducation(
    @Body() createDto: CreateEducationDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: EducationResponseDto }> {
    const education = await this.candidateService.createEducation(
      req.user.id,
      createDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      data: education,
    };
  }

  @Get('education')
  async getEducations(
    @Req() req: any,
  ): Promise<{ statusCode: number; data: EducationResponseDto[] }> {
    const educations = await this.candidateService.getEducations(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      data: educations,
    };
  }

  @Patch('education/:id')
  async updateEducation(
    @Param('id') id: string,
    @Body() updateDto: UpdateEducationDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: EducationResponseDto }> {
    const education = await this.candidateService.updateEducation(
      req.user.id,
      parseInt(id),
      updateDto,
    );

    return {
      statusCode: HttpStatus.OK,
      data: education,
    };
  }

  @Delete('education/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEducation(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    await this.candidateService.deleteEducation(req.user.id, parseInt(id));
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
