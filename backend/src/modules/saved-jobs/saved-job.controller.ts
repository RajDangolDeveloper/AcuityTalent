import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SavedJobService } from './saved-job.service';
import { CreateSavedJobDto } from './dto/create-saved-job.dto';
import { SavedJobResponseDto } from './dto/saved-job-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('saved-jobs')
@UseGuards(JwtAuthGuard)
export class SavedJobController {
  constructor(private savedJobService: SavedJobService) {}

  /**
   * POST /saved-jobs
   * Save a job
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async saveJob(
    @Body() createDto: CreateSavedJobDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: SavedJobResponseDto }> {
    const savedJob = await this.savedJobService.saveJob(req.user.id, createDto);

    return {
      statusCode: HttpStatus.CREATED,
      data: savedJob,
    };
  }

  /**
   * GET /saved-jobs
   * Get all saved jobs
   */
  @Get()
  async getSavedJobs(
    @Req() req: any,
  ): Promise<{ statusCode: number; data: SavedJobResponseDto[] }> {
    const savedJobs = await this.savedJobService.getSavedJobs(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      data: savedJobs,
    };
  }

  /**
   * DELETE /saved-jobs/:jobId
   * Unsave a job
   */
  @Delete(':jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsaveJob(
    @Param('jobId') jobId: string,
    @Req() req: any,
  ): Promise<void> {
    await this.savedJobService.unsaveJob(req.user.id, parseInt(jobId));
  }

  /**
   * GET /saved-jobs/check/:jobId
   * Check if job is saved
   */
  @Get('check/:jobId')
  async isJobSaved(
    @Param('jobId') jobId: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: { isSaved: boolean } }> {
    const isSaved = await this.savedJobService.isJobSaved(
      req.user.id,
      parseInt(jobId),
    );

    return {
      statusCode: HttpStatus.OK,
      data: { isSaved },
    };
  }
}
