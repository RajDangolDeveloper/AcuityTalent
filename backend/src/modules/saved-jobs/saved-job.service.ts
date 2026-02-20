import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSavedJobDto } from './dto/create-saved-job.dto';
import { SavedJobResponseDto } from './dto/saved-job-response.dto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class SavedJobService {
  constructor(private prisma: PrismaService) {}

  async saveJob(
    userId: number,
    createDto: CreateSavedJobDto,
  ): Promise<SavedJobResponseDto> {
    // Check if candidate profile exists
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    // Check if job exists
    const job = await this.prisma.job.findUnique({
      where: { id: createDto.jobId },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if already saved
    const existing = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId: createDto.jobId,
        },
      },
    });
    if (existing) {
      throw new BadRequestException('Job already saved');
    }

    const savedJob = await this.prisma.savedJob.create({
      data: {
        candidateId: candidate.id,
        jobId: createDto.jobId,
      },
    });
    return savedJob;
  }

  async getSavedJobs(userId: number): Promise<SavedJobResponseDto[]> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return await this.prisma.savedJob.findMany({
      where: { candidateId: candidate.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async unsaveJob(userId: number, jobId: number): Promise<void> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const savedJob = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId,
        },
      },
    });
    if (!savedJob) {
      throw new NotFoundException('Saved job not found');
    }

    await this.prisma.savedJob.delete({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId,
        },
      },
    });
  }

  async isJobSaved(userId: number, jobId: number): Promise<boolean> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      return false;
    }

    const savedJob = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId,
        },
      },
    });
    return !!savedJob;
  }
}
