import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobResponseDto } from './dto/job-response.dto';
import { GetJobsQueryDto } from './dto/get-jobs-query.dto';
import { JobStatus, LocationType } from '@prisma/client';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EmbeddingRequest } from '../ai/dto/embedding-request.dto';
import { EntitlementsService } from '../subscriptions/entitlements.service';

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private entitlements: EntitlementsService,
  ) {}

  async createJob(
    createJobDto: CreateJobDto,
    recruiterId: number,
  ): Promise<JobResponseDto> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId: recruiterId },
    });
    if (!recruiter) {
      throw new BadRequestException('Recruiter profile not found');
    }

    const company = await this.prisma.company.findUnique({
      where: {
        id: recruiter.companyId,
      },
    });

    if (!company) {
      throw new NotFoundException('Company does not exist');
    }

    const entitlementCheck =
      await this.entitlements.canRecruiterCreateJob(recruiterId);
    if (!entitlementCheck.allowed) {
      throw new ForbiddenException(entitlementCheck.message);
    }

    const job = await this.prisma.job.create({
      data: {
        ...createJobDto,
        locationType: createJobDto.remoteAvailable
          ? LocationType.REMOTE
          : LocationType.ONSITE,
        companyId: company.id,
        recruiterId: recruiter.id,
        status: JobStatus.ACTIVE,
        postedDate: new Date(),
      },
    });

    await this.recomputeJobEmbedding(job.id);

    return job;
  }

  private async createJobEmbedding(jobId: number, embedding: number[]) {
    const vectorValue = `[${embedding.join(',')}]`;

    await this.prisma.jobEmbedding.upsert({
      where: { jobId },
      create: {
        jobId,
        model: 'all-mpnet-base-v2',
      },
      update: {
        model: 'all-mpnet-base-v2',
      },
    });

    await this.prisma.$executeRaw`
      UPDATE "JobEmbedding"
      SET
        "embedding" = ${vectorValue}::vector(768),
        "updatedAt" = NOW()
      WHERE "jobId" = ${jobId}
    `;
  }

  async getAllJobs(query: GetJobsQueryDto): Promise<{
    data: JobResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const {
      search,
      location,
      employmentType,
      experienceLevel,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: JobStatus.ACTIVE,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { requirements: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          company: true,
          _count: {
            select: {
              applications: true,
            },
          },
          recruiter: {
            include: {
              user: {
                select: { firstName: true, lastName: true, contactEmail: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { postedDate: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    const mappedJobs = jobs.map((job) => ({
      ...job,
      companyName: job.company?.name,
      recruiterName: [
        job.recruiter?.user?.firstName,
        job.recruiter?.user?.lastName,
      ]
        .filter(Boolean)
        .join(' '),
      recruiterEmail: job.recruiter?.user.contactEmail,
      applicationCount: job._count?.applications ?? 0,
    }));

    return {
      data: mappedJobs,
      total,
      page,
      pageSize: limit,
    };
  }

  async getRecruiterJobs(
    recruiterId: number,
    query: GetJobsQueryDto,
  ): Promise<{
    data: JobResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId: recruiterId },
    });
    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

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
          company: true,
          applications: true,
          _count: {
            select: {
              applications: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    const mappedJobs = jobs.map((job) => ({
      ...job,
      companyName: job.company?.name,
      applicationCount: job._count?.applications ?? 0,
      latestAppliedDate: job.applications[0].appliedAt,
    }));

    return {
      data: mappedJobs,
      total,
      page,
      pageSize: limit,
    };
  }

  async getJobById(id: number): Promise<JobResponseDto> {
    const job = await this.findJobWithRelations(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.prisma.job.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return job;
  }

  async getPublicJobById(id: number): Promise<JobResponseDto> {
    const job = await this.findJobWithRelations(id);

    if (!job || job.status !== JobStatus.ACTIVE) {
      throw new NotFoundException('Job not found');
    }

    await this.prisma.job.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return job;
  }

  async updateJob(
    id: number,
    updateJobDto: UpdateJobDto,
    recruiterId: number,
  ): Promise<JobResponseDto> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId: recruiterId },
    });
    if (!recruiter) {
      throw new ForbiddenException('Recruiter profile not found');
    }

    const job = await this.prisma.job.findFirst({
      where: { id, recruiterId: recruiter.id },
    });
    if (!job) {
      throw new NotFoundException('Job not found or access denied');
    }

    const activatesJob =
      updateJobDto.status === JobStatus.ACTIVE &&
      job.status !== JobStatus.ACTIVE;

    if (activatesJob) {
      const entitlementCheck =
        await this.entitlements.canRecruiterCreateJob(recruiterId);

      if (!entitlementCheck.allowed) {
        throw new ForbiddenException(entitlementCheck.message);
      }
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: updateJobDto,
      include: {
        company: true,
        recruiter: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    await this.recomputeJobEmbedding(id);

    return updatedJob;
  }

  async deleteJob(id: number, recruiterId: number): Promise<void> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId: recruiterId },
    });
    if (!recruiter) {
      throw new ForbiddenException('Recruiter profile not found');
    }

    const job = await this.prisma.job.findFirst({
      where: { id, recruiterId: recruiter.id },
    });
    if (!job) {
      throw new NotFoundException('Job not found or access denied');
    }

    await this.prisma.job.delete({
      where: { id },
    });
  }

  async updateJobStatus(id: number, status: JobStatus) {
    return this.prisma.job.update({
      where: { id: id },
      data: { status: status },
    });
  }

  async getJobStats(
    id: number,
    recruiterId: number,
  ): Promise<{
    viewsCount: number;
    totalApplications: number;
    applicationsByStatus: any;
    postedDate: Date | null;
    applicationDeadline: Date | null;
  }> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId: recruiterId },
    });
    if (!recruiter) {
      throw new ForbiddenException('Recruiter profile not found');
    }

    const job = await this.prisma.job.findFirst({
      where: { id, recruiterId: recruiter.id },
    });
    if (!job) {
      throw new NotFoundException('Job not found or access denied');
    }

    const [applicationsByStatus, totalApplications] = await Promise.all([
      this.prisma.application.groupBy({
        by: ['status'],
        where: { jobId: id },
        _count: { status: true },
      }),
      this.prisma.application.count({ where: { jobId: id } }),
    ]);

    const statusCounts = {};
    applicationsByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.status;
    });

    return {
      viewsCount: job.viewsCount,
      totalApplications,
      applicationsByStatus: statusCounts,
      postedDate: job.postedDate,
      applicationDeadline: job.applicationDeadline,
    };
  }

  async getManyJobsById(jobIds: number[]) {
    return this.prisma.job.findMany({
      where: {
        id: { in: jobIds },
      },
    });
  }

  private async findJobWithRelations(id: number) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        recruiter: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  private async recomputeJobEmbedding(jobId: number) {
    try {
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        include: { company: true },
      });

      if (!job) {
        return;
      }

      const embeddingRequest = new EmbeddingRequest();
      embeddingRequest.text = [
        job.title,
        job.description,
        job.requirements,
        job.employmentType,
        job.experienceLevel,
        job.location,
        job.salaryRange,
        job.company?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      if (!embeddingRequest.text) {
        return;
      }

      const embeddingResult = await this.ai.generateEmbedding(embeddingRequest);

      if (!embeddingResult.embedding?.length) {
        return;
      }

      await this.createJobEmbedding(job.id, embeddingResult.embedding);
    } catch (error) {}
  }
}
