import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobResponseDto } from './dto/job-response.dto';
import { GetJobsQueryDto } from './dto/get-jobs-query.dto';
import { JobStatus } from '@prisma/client';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

/**
 * JobService - Handles all job-related business logic
 * Covers: Job creation, management, search, listings
 * Maps to sequence diagram steps: 5-7, 8-9
 */
@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  /**
   * Step 6: Recruiter creates job
   * Creates a new job posting (initially in DRAFT status)
   */
  async createJob(
    createJobDto: CreateJobDto,
    userId: number,
  ): Promise<JobResponseDto> {
    // Verify user is a recruiter
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { company: true, user: true },
    });

    if (!recruiter) {
      throw new ForbiddenException('Only recruiters can create jobs');
    }

    // Create job in DRAFT status
    const job = await this.prisma.job.create({
      data: {
        ...createJobDto,
        recruiterId: recruiter.id,
        status: JobStatus.DRAFT,
      },
      include: {
        recruiter: {
          include: { company: true, user: true },
        },
      },
    });

    return this.formatJobResponse(job, recruiter.company?.name);
  }

  /**
   * Update job details
   * Recruiter can edit their own jobs
   */
  async updateJob(
    jobId: number,
    updateJobDto: UpdateJobDto,
    userId: number,
  ): Promise<JobResponseDto> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        recruiter: {
          include: { company: true, user: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { company: true, user: true },
    });

    if (!recruiter || job.recruiterId !== recruiter.id) {
      throw new ForbiddenException('You can only update your own job postings');
    }

    const data: any = { ...updateJobDto };

    // If changing to ACTIVE, set posted date
    if (updateJobDto.status === JobStatus.ACTIVE && !job.postedDate) {
      data.postedDate = new Date();
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data,
      include: {
        recruiter: {
          include: { company: true, user: true },
        },
      },
    });

    return this.formatJobResponse(updatedJob, recruiter.company?.name);
  }

  /**
   * Delete a job posting
   * Can only delete if no applications exist
   */
  async deleteJob(jobId: number, userId: number): Promise<void> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiter || job.recruiterId !== recruiter.id) {
      throw new ForbiddenException('You can only delete your own job postings');
    }

    // Check for existing applications
    const applicationCount = await this.prisma.application.count({
      where: { jobId },
    });

    if (applicationCount > 0) {
      throw new BadRequestException(
        'Cannot delete job with existing applications',
      );
    }

    await this.prisma.job.delete({
      where: { id: jobId },
    });
  }

  /**
   * Get single job by ID
   */
  async getJobById(jobId: number): Promise<JobResponseDto> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        recruiter: {
          include: { company: true, user: true },
        },
        applications: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Increment view count
    await this.prisma.job.update({
      where: { id: jobId },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });

    return this.formatJobResponse(job, job.recruiter.company?.name);
  }

  /**
   * Steps 8-9: Candidate goes to "Job search page" and selects a job
   * Get all active jobs with filters and search
   */
  async getAllJobs(query: GetJobsQueryDto): Promise<{
    data: JobResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      location,
      employmentType,
      experienceLevel,
      remoteAvailable,
    } = query;
    const pageNum = (page - 1) * limit;

    const where: any = {
      status: JobStatus.ACTIVE,
    };

    // Search in title and description
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (remoteAvailable !== undefined) {
      where.remoteAvailable = remoteAvailable;
    }

    // Sorting
    let orderBy: any = { postedDate: 'desc' };
    if (sortBy === 'views') {
      orderBy = { viewsCount: 'desc' };
    } else if (sortBy === 'salary') {
      orderBy = { salaryRange: 'desc' };
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          recruiter: {
            include: { company: true, user: true },
          },
        },
        skip: pageNum,
        take: limit,
        orderBy,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs.map((job) =>
        this.formatJobResponse(job, job.recruiter.company?.name),
      ),
      total,
      page,
      pageSize: limit,
    };
  }

  /**
   * Step 7: Recruiter sees job in list
   * Get recruiter's own jobs with status filtering
   * Can edit, delete, or update status to ACTIVE
   */
  async getRecruiterJobs(
    userId: number,
    query: GetJobsQueryDto,
  ): Promise<{
    data: JobResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { company: true, user: true },
    });

    if (!recruiter) {
      throw new ForbiddenException('Only recruiters can view their jobs');
    }

    const { page = 1, limit = 10, status } = query;
    const pageNum = (page - 1) * limit;

    const where: any = {
      recruiterId: recruiter.id,
    };

    if (status) {
      where.status = status;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          recruiter: {
            include: { company: true, user: true },
          },
          applications: true,
        },
        skip: pageNum,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs.map((job) => {
        const jobResponse = this.formatJobResponse(
          job,
          recruiter.company?.name,
        );
        jobResponse.applicationCount = job.applications.length;
        return jobResponse;
      }),
      total,
      page,
      pageSize: limit,
    };
  }

  // ==================== STATISTICS ====================

  /**
   * Get statistics for a job
   * Recruiter only (must own the job)
   */
  async getJobStats(
    jobId: number,
    userId: number,
  ): Promise<{
    viewsCount: number;
    totalApplications: number;
    applicationsByStatus: any;
    postedDate: Date | null;
    applicationDeadline: Date | null;
  }> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        recruiter: true,
        applications: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiter || job.recruiterId !== recruiter.id) {
      throw new ForbiddenException(
        'You can only view statistics for your own job postings',
      );
    }

    // Count applications by status
    const applicationsByStatus = await this.prisma.application.groupBy({
      by: ['status'],
      where: { jobId },
      _count: {
        id: true,
      },
    });

    const statusCount: any = {};
    applicationsByStatus.forEach((item) => {
      statusCount[item.status] = item._count.id;
    });

    return {
      viewsCount: job.viewsCount,
      totalApplications: job.applications.length,
      applicationsByStatus: statusCount,
      postedDate: job.postedDate,
      applicationDeadline: job.applicationDeadline,
    };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Format job response
   */
  private formatJobResponse(job: any, companyName?: string): JobResponseDto {
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      salaryRange: job.salaryRange,
      location: job.location,
      remoteAvailable: job.remoteAvailable,
      status: job.status,
      postedDate: job.postedDate,
      applicationDeadline: job.applicationDeadline,
      viewsCount: job.viewsCount,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      recruiterName: `${job.recruiter.user.firstName} ${job.recruiter.user.lastName}`,
      recruiterEmail: job.recruiter.user.email,
      companyName,
    };
  }
}
