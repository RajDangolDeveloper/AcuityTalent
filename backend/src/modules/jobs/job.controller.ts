import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { GetJobsQueryDto } from './dto/get-jobs-query.dto';
import { JobResponseDto } from './dto/job-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * JobController - RESTful API endpoints for job management
 * Handles all job-related HTTP requests
 * Maps to sequence diagram steps 5-9
 */
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobController {
  constructor(private jobService: JobService) {}

  /**
   * POST /jobs
   * Step 6: Recruiter creates job
   * Creates a new job posting (initially in DRAFT status)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJob(
    @Body() createJobDto: CreateJobDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: JobResponseDto }> {
    const job = await this.jobService.createJob(createJobDto, req.user.id);

    return {
      statusCode: HttpStatus.CREATED,
      data: job,
    };
  }

  /**
   * GET /jobs
   * Steps 8-9: Candidate goes to "Job search page" and selects a job
   * Get all active jobs with filters and search
   * Public endpoint (but requires auth via guard)
   */
  @Get()
  async getAllJobs(@Query() query: GetJobsQueryDto): Promise<{
    statusCode: number;
    data: JobResponseDto[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const { data, total, page, pageSize } =
      await this.jobService.getAllJobs(query);

    return {
      statusCode: HttpStatus.OK,
      data,
      pagination: {
        total,
        page,
        limit: pageSize,
      },
    };
  }

  /**
   * GET /jobs/recruiter/my-jobs
   * Step 7: Recruiter sees job in list
   * Get recruiter's own jobs with status filtering
   * Can edit, delete, or update status to ACTIVE
   */
  @Get('recruiter/my-jobs')
  async getRecruiterJobs(
    @Query() query: GetJobsQueryDto,
    @Req() req: any,
  ): Promise<{
    statusCode: number;
    data: JobResponseDto[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const { data, total, page, pageSize } =
      await this.jobService.getRecruiterJobs(req.user.id, query);

    return {
      statusCode: HttpStatus.OK,
      data,
      pagination: {
        total,
        page,
        limit: pageSize,
      },
    };
  }

  /**
   * GET /jobs/:id
   * Get single job details
   * Increments view count on access
   */
  @Get(':id')
  async getJobById(
    @Param('id') id: string,
  ): Promise<{ statusCode: number; data: JobResponseDto }> {
    const job = await this.jobService.getJobById(parseInt(id));

    return {
      statusCode: HttpStatus.OK,
      data: job,
    };
  }

  /**
   * PATCH /jobs/:id
   * Update job details
   * Recruiter can edit their own jobs
   * Can update status from DRAFT to ACTIVE
   */
  @Patch(':id')
  async updateJob(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: JobResponseDto }> {
    const job = await this.jobService.updateJob(
      parseInt(id),
      updateJobDto,
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: job,
    };
  }

  /**
   * DELETE /jobs/:id
   * Delete a job posting
   * Can only delete if no applications exist
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteJob(@Param('id') id: string, @Req() req: any): Promise<void> {
    await this.jobService.deleteJob(parseInt(id), req.user.id);
  }

  /**
   * GET /jobs/:id/stats
   * Get statistics for a job
   * Recruiter only (must own the job)
   */
  @Get(':id/stats')
  async getJobStats(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{
    statusCode: number;
    data: {
      viewsCount: number;
      totalApplications: number;
      applicationsByStatus: any;
      postedDate: Date | null;
      applicationDeadline: Date | null;
    };
  }> {
    const stats = await this.jobService.getJobStats(parseInt(id), req.user.id);

    return {
      statusCode: HttpStatus.OK,
      data: stats,
    };
  }
}
