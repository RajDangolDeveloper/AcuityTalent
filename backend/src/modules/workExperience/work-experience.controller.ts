import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkExperienceService } from './work-experience.service';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import {
  CandidateWorkExperienceResponseDto,
  RecruiterWorkExperienceResponseDto,
} from './entity';

@Controller('work-experience')
@UseGuards(JwtAuthGuard)
export class WorkExperienceController {
  constructor(private readonly workExperienceService: WorkExperienceService) {}

  @Post('candidate')
  @HttpCode(HttpStatus.CREATED)
  async createCandidateWorkExperience(
    @Body() createDto: CreateWorkExperienceDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: CandidateWorkExperienceResponseDto }> {
    const workExp =
      await this.workExperienceService.createCandidateWorkExperience(
        req.user.id,
        createDto,
      );

    return {
      statusCode: HttpStatus.CREATED,
      data: workExp,
    };
  }

  @Get('candidate')
  async getCandidateWorkExperiences(@Req() req: any): Promise<{
    statusCode: number;
    data: CandidateWorkExperienceResponseDto[];
  }> {
    const experiences =
      await this.workExperienceService.getCandidateWorkExperiences(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      data: experiences,
    };
  }

  @Get('candidate/current')
  async getCandidateCurrentPosition(
    @Req() req: any,
  ): Promise<{ statusCode: number; data: CandidateWorkExperienceResponseDto }> {
    const experience =
      await this.workExperienceService.getCandidateCurrentWorkExperience(
        req.user.id,
      );

    return {
      statusCode: HttpStatus.OK,
      data: experience,
    };
  }

  @Patch('candidate/:id')
  async updateCandidateWorkExperience(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkExperienceDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: CandidateWorkExperienceResponseDto }> {
    const experience =
      await this.workExperienceService.updateCandidateWorkExperience(
        req.user.id,
        parseInt(id),
        updateDto,
      );

    return {
      statusCode: HttpStatus.OK,
      data: experience,
    };
  }

  @Delete('candidate/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCandidateWorkExperience(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    await this.workExperienceService.deleteCandidateWorkExperience(
      req.user.id,
      parseInt(id),
    );
  }

  @Post('recruiter')
  @HttpCode(HttpStatus.CREATED)
  async createRecruiterWorkExperience(
    @Body() createDto: CreateWorkExperienceDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: RecruiterWorkExperienceResponseDto }> {
    const workExp =
      await this.workExperienceService.createRecruiterWorkExperience(
        req.user.id,
        createDto,
      );

    return {
      statusCode: HttpStatus.CREATED,
      data: workExp,
    };
  }

  @Get('recruiter/current')
  async getRecruiterCurrentPosition(
    @Req() req: any,
  ): Promise<{ statusCode: number; data: RecruiterWorkExperienceResponseDto }> {
    const experience =
      await this.workExperienceService.getRecruiterCurrentWorkExperience(
        req.user.id,
      );

    return {
      statusCode: HttpStatus.OK,
      data: experience,
    };
  }

  @Get('recruiter')
  async getRecruiterWorkExperiences(@Req() req: any): Promise<{
    statusCode: number;
    data: RecruiterWorkExperienceResponseDto[];
  }> {
    const experiences =
      await this.workExperienceService.getRecruiterWorkExperiences(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      data: experiences,
    };
  }

  @Patch('recruiter/:id')
  async updateRecruiterWorkExperience(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkExperienceDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: RecruiterWorkExperienceResponseDto }> {
    const experience =
      await this.workExperienceService.updateRecruiterWorkExperience(
        req.user.id,
        parseInt(id),
        updateDto,
      );

    return {
      statusCode: HttpStatus.OK,
      data: experience,
    };
  }

  @Delete('recruiter/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRecruiterWorkExperience(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    return await this.workExperienceService.deleteRecruiterWorkExperience(
      req.user.id,
      parseInt(id),
    );
  }
}
