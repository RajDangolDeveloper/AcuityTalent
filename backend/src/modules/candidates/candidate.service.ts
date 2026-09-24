import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EmbeddingRequest } from '../ai/dto/embedding-request.dto';
import { CreateEducationDto } from '../education/dto/create-education.dto';
import { UpdateEducationDto } from '../education/dto/update-education.dto';
import { CandidateProfileResponseDto } from './dto/candidate-profile-response.dto';
import { CreateCandidateEmbeddingDto } from './dto/create-candidate-profile-embedding.dto';
import { CreateCandidateProfileDto } from './dto/create-candidate-profile.dto';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';
import { CandidateEducationResponseDto } from '../education/entity';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async createCandidateProfile(
    userId: number,
    createDto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileResponseDto> {
    const existing = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException(
        'Candidate profile already exists for this user',
      );
    }

    const profile = await this.prisma.candidateProfile.create({
      data: {
        userId,
        ...createDto,
      },
    });

    await this.recomputeCandidateEmbedding(profile.id);

    return profile;
  }

  async createCandidateEmbedding(
    createCandidateEmbedding: CreateCandidateEmbeddingDto,
  ) {
    const vectorValue = `[${createCandidateEmbedding.embedding.join(',')}]`;

    const [created] = await this.prisma.$queryRaw<
      Array<{
        id: number;
        candidateProfileId: number;
        embedding: unknown;
        model: string;
        createdAt: Date;
        updatedAt: Date;
      }>
    >`
    WITH upsert AS (
      INSERT INTO "CandidateProfileEmbedding" (
        "candidateProfileId",
        "embedding",
        "model",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${createCandidateEmbedding.candidateProfileId},
        ${vectorValue}::vector(768),
        ${'all-mpnet-base-v2'},
        NOW(),
        NOW()
      )
      ON CONFLICT ("candidateProfileId")
      DO UPDATE SET
        "embedding" = EXCLUDED."embedding",
        "model" = EXCLUDED."model",
        "updatedAt" = NOW()
      RETURNING *
    )
    SELECT * FROM upsert
  `;

    return created;
  }

  async getCandidateProfile(
    userId: number,
  ): Promise<CandidateProfileResponseDto> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        education: true,
        workHistory: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    return profile;
  }

  async getCandidateProfileById(
    candidateId: number,
  ): Promise<CandidateProfileResponseDto> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { id: candidateId },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    return profile;
  }

  async getCandidateProfileByUserId(
    candidateId: number,
  ): Promise<CandidateProfileResponseDto> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    return profile;
  }

  async updateCandidateProfile(
    userId: number,
    updateDto: UpdateCandidateProfileDto,
  ): Promise<CandidateProfileResponseDto> {
    const profile = await this.prisma.candidateProfile.update({
      where: { userId },
      data: updateDto,
    });

    await this.recomputeCandidateEmbedding(profile.id);

    return profile;
  }

  async deleteCandidateProfile(userId: number): Promise<void> {
    await this.prisma.candidateProfile.delete({
      where: { userId },
    });
  }

  public async recomputeCandidateEmbedding(candidateProfileId: number) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { id: candidateProfileId },
      include: {
        workHistory: true,
        education: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const workHistoryText = candidate.workHistory
      .map((item) =>
        [item.company, item.position, item.description]
          .filter(Boolean)
          .join(' '),
      )
      .join(' ');

    const educationText = candidate.education
      .map((item) =>
        [item.institution, item.degree, item.fieldOfStudy, item.description]
          .filter(Boolean)
          .join(' '),
      )
      .join(' ');

    const embeddingText = [
      candidate.headline,
      candidate.currentPosition,
      candidate.highestDegree,
      candidate.skills?.join(' '),
      candidate.preferredLocation,
      candidate.summary,
      candidate.linkedinUrl,
      candidate.githubUrl,
      workHistoryText,
      educationText,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!embeddingText) {
      return;
    }

    const request = new EmbeddingRequest();
    request.text = embeddingText;

    const embeddingResult = await this.ai.generateEmbedding(request);

    if (!embeddingResult.embedding?.length) {
      return;
    }

    const dto = new CreateCandidateEmbeddingDto();
    dto.candidateProfileId = candidateProfileId;
    dto.embedding = embeddingResult.embedding;

    await this.createCandidateEmbedding(dto);
  }

  private async getFallbackRecommendedJobs(candidateId: number, topK: number) {
    const jobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.ACTIVE,
        applications: {
          none: {
            candidateId,
          },
        },
        savedBy: {
          none: {
            candidateId,
          },
        },
      },
      include: {
        company: true,
        recruiter: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                contactEmail: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: [{ postedDate: 'desc' }, { createdAt: 'desc' }],
      take: topK,
    });

    return jobs.map((job) => ({
      ...job,
      companyName: job.company?.name,
      recruiterName: [
        job.recruiter?.user?.firstName,
        job.recruiter?.user?.lastName,
      ]
        .filter(Boolean)
        .join(' '),
      recruiterEmail: job.recruiter?.user?.contactEmail,
      applicationCount: job._count?.applications ?? 0,
      matchScore: 0,
    }));
  }

  async getRecommendedJobs(userId: number, topK: number = 10) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const existingEmbedding =
      await this.prisma.candidateProfileEmbedding.findUnique({
        where: { candidateProfileId: candidate.id },
        select: { id: true },
      });

    if (!existingEmbedding) {
      try {
        await this.recomputeCandidateEmbedding(candidate.id);
      } catch {}
    }

    const recommendationResult = await firstValueFrom(
      this.ai.getJobRecommendations(candidate.id, topK),
    );

    if (!recommendationResult.recommendations?.length) {
      return this.getFallbackRecommendedJobs(candidate.id, topK);
    }

    const recommendedIds = recommendationResult.recommendations.map(
      (item) => item.job_id,
    );
    const scoreByJobId = new Map(
      recommendationResult.recommendations.map((item) => [
        item.job_id,
        item.match_score,
      ]),
    );

    const jobs = await this.prisma.job.findMany({
      where: {
        id: { in: recommendedIds },
      },
      include: {
        company: true,
        recruiter: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                contactEmail: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    const jobById = new Map(jobs.map((job) => [job.id, job]));

    const recommendedJobs = recommendedIds
      .map((id) => jobById.get(id))
      .filter(Boolean)
      .map((job) => ({
        ...job,
        companyName: job!.company?.name,
        recruiterName: [
          job!.recruiter?.user?.firstName,
          job!.recruiter?.user?.lastName,
        ]
          .filter(Boolean)
          .join(' '),
        recruiterEmail: job!.recruiter?.user?.contactEmail,
        applicationCount: job!._count?.applications ?? 0,
        matchScore: scoreByJobId.get(job!.id) ?? 0,
      }));

    if (!recommendedJobs.length) {
      return this.getFallbackRecommendedJobs(candidate.id, topK);
    }

    return recommendedJobs;
  }
}
