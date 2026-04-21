import { CreateCandidateProfileDto } from './dto/create-candidate-profile.dto';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';
import { CandidateProfileResponseDto } from './dto/candidate-profile-response.dto';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { WorkExperienceResponseDto } from './dto/work-experience-response.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { EducationResponseDto } from './dto/education-response.dto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { EmbeddingRequest } from '../ai/dto/embedding-request.dto';
import { CreateCandidateEmbeddingDto } from './dto/create-candidate-profile-embedding.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

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

  
  async createWorkExperience(
    userId: number,
    createDto: CreateWorkExperienceDto,
  ): Promise<WorkExperienceResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    if (!createDto.startDate) {
      throw new BadRequestException('startDate is required');
    }

    const workExp = await this.prisma.workExperience.create({
      data: {
        candidateId: candidate.id,
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      },
    });

    await this.recomputeCandidateEmbedding(candidate.id);

    return workExp;
  }

  async getWorkExperiences(
    userId: number,
  ): Promise<WorkExperienceResponseDto[]> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return await this.prisma.workExperience.findMany({
      where: { candidateId: candidate.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateWorkExperience(
    userId: number,
    experienceId: number,
    updateDto: UpdateWorkExperienceDto,
  ): Promise<WorkExperienceResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const experience = await this.prisma.workExperience.findFirst({
      where: { id: experienceId, candidateId: candidate.id },
    });
    if (!experience) {
      throw new NotFoundException('Work experience not found');
    }

    const updated = await this.prisma.workExperience.update({
      where: { id: experienceId },
      data: {
        ...updateDto,
        startDate: updateDto.startDate
          ? new Date(updateDto.startDate)
          : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : null,
      },
    });

    await this.recomputeCandidateEmbedding(candidate.id);

    return updated;
  }

  async deleteWorkExperience(
    userId: number,
    experienceId: number,
  ): Promise<void> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const experience = await this.prisma.workExperience.findFirst({
      where: { id: experienceId, candidateId: candidate.id },
    });
    if (!experience) {
      throw new NotFoundException('Work experience not found');
    }

    await this.prisma.workExperience.delete({
      where: { id: experienceId },
    });

    await this.recomputeCandidateEmbedding(candidate.id);
  }

  
  async createEducation(
    userId: number,
    createDto: CreateEducationDto,
  ): Promise<EducationResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    if (!createDto.startDate) {
      throw new BadRequestException('startDate is required');
    }

    const education = await this.prisma.education.create({
      data: {
        candidateId: candidate.id,
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      },
    });

    await this.recomputeCandidateEmbedding(candidate.id);

    return education;
  }

  async getEducations(userId: number): Promise<EducationResponseDto[]> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return await this.prisma.education.findMany({
      where: { candidateId: candidate.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateEducation(
    userId: number,
    educationId: number,
    updateDto: UpdateEducationDto,
  ): Promise<EducationResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const education = await this.prisma.education.findFirst({
      where: { id: educationId, candidateId: candidate.id },
    });
    if (!education) {
      throw new NotFoundException('Education not found');
    }

    const updated = await this.prisma.education.update({
      where: { id: educationId },
      data: {
        ...updateDto,
        startDate: updateDto.startDate
          ? new Date(updateDto.startDate)
          : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : null,
      },
    });

    await this.recomputeCandidateEmbedding(candidate.id);

    return updated;
  }

  async deleteEducation(userId: number, educationId: number): Promise<void> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const education = await this.prisma.education.findFirst({
      where: { id: educationId, candidateId: candidate.id },
    });
    if (!education) {
      throw new NotFoundException('Education not found');
    }

    await this.prisma.education.delete({
      where: { id: educationId },
    });

    await this.recomputeCandidateEmbedding(candidate.id);
  }

  private async recomputeCandidateEmbedding(candidateProfileId: number) {
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
      } catch {
        
      }
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
