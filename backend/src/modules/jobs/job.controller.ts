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

@Controller('jobs')
export class JobController {
  constructor(private jobService: JobService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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

  @Get('recruiter/my-jobs')
  @UseGuards(JwtAuthGuard)
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

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteJob(@Param('id') id: string, @Req() req: any): Promise<void> {
    await this.jobService.deleteJob(parseInt(id), req.user.id);
  }
}
