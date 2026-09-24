import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkExperienceDto } from '../candidates/dto/create-work-experience.dto';

import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { CandidateService } from '../candidates/candidate.service';
import {
  CandidateWorkExperienceResponseDto,
  RecruiterWorkExperienceResponseDto,
} from './entity';
import { RecruiterService } from '../recruiters/recruiter.service';

@Injectable()
export class WorkExperienceService {
  constructor(
    private prisma: PrismaService,
    private candidateService: CandidateService,
    private recruiterService: RecruiterService,
  ) {}

  async createCandidateWorkExperience(
    userId: number,
    createDto: CreateWorkExperienceDto,
  ): Promise<CandidateWorkExperienceResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    if (!createDto.startDate) {
      throw new BadRequestException('startDate is required');
    }

    const workExp = await this.prisma.candidateWorkExperience.create({
      data: {
        candidateId: candidate.id,
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      },
    });

    await this.candidateService.recomputeCandidateEmbedding(candidate.id);

    return workExp;
  }

  async getCandidateWorkExperiences(
    userId: number,
  ): Promise<CandidateWorkExperienceResponseDto[]> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return await this.prisma.candidateWorkExperience.findMany({
      where: { candidateId: candidate.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateCandidateWorkExperience(
    userId: number,
    experienceId: number,
    updateDto: UpdateWorkExperienceDto,
  ): Promise<CandidateWorkExperienceResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const experience = await this.prisma.candidateWorkExperience.findFirst({
      where: { id: experienceId, candidateId: candidate.id },
    });
    if (!experience) {
      throw new NotFoundException('Work experience not found');
    }

    const updated = await this.prisma.candidateWorkExperience.update({
      where: { id: experienceId },
      data: {
        ...updateDto,
        startDate: updateDto.startDate
          ? new Date(updateDto.startDate)
          : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : null,
      },
    });

    await this.candidateService.recomputeCandidateEmbedding(candidate.id);

    return updated;
  }

  async deleteCandidateWorkExperience(
    userId: number,
    experienceId: number,
  ): Promise<void> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const experience = await this.prisma.candidateWorkExperience.findFirst({
      where: { id: experienceId, candidateId: candidate.id },
    });
    if (!experience) {
      throw new NotFoundException('Work experience not found');
    }

    await this.prisma.candidateWorkExperience.delete({
      where: { id: experienceId },
    });

    await this.candidateService.recomputeCandidateEmbedding(candidate.id);
  }

  async createRecruiterWorkExperience(
    userId: number,
    createDto: CreateWorkExperienceDto,
  ): Promise<RecruiterWorkExperienceResponseDto> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });
    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    if (!createDto.startDate) {
      throw new BadRequestException('startDate is required');
    }

    const workExp = await this.prisma.recruiterWorkExperience.create({
      data: {
        recruiterId: recruiter.id,
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      },
    });

    return workExp;
  }

  async getRecruiterWorkExperiences(
    userId: number,
  ): Promise<RecruiterWorkExperienceResponseDto[]> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });
    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    return await this.prisma.recruiterWorkExperience.findMany({
      where: { recruiterId: recruiter.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateRecruiterWorkExperience(
    userId: number,
    experienceId: number,
    updateDto: UpdateWorkExperienceDto,
  ): Promise<RecruiterWorkExperienceResponseDto> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });
    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    const experience = await this.prisma.recruiterWorkExperience.findFirst({
      where: { id: experienceId, recruiterId: recruiter.id },
    });
    if (!experience) {
      throw new NotFoundException('Work experience not found');
    }

    const updated = await this.prisma.recruiterWorkExperience.update({
      where: { id: experienceId },
      data: {
        ...updateDto,
        startDate: updateDto.startDate
          ? new Date(updateDto.startDate)
          : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : null,
      },
    });

    return updated;
  }

  async deleteRecruiterWorkExperience(
    userId: number,
    experienceId: number,
  ): Promise<void> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });
    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    const experience = await this.prisma.recruiterWorkExperience.findFirst({
      where: { id: experienceId, recruiterId: recruiter.id },
    });
    if (!experience) {
      throw new NotFoundException('Work experience not found');
    }

    await this.prisma.recruiterWorkExperience.delete({
      where: { id: experienceId },
    });
  }

  async getRecruiterCurrentWorkExperience(
    userId: number,
  ): Promise<RecruiterWorkExperienceResponseDto> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });
    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    const ExperiencesExist = await this.prisma.recruiterWorkExperience.count();

    if (ExperiencesExist < 1) {
      throw new InternalServerErrorException(
        'Not enough work-experience entries',
      );
    }

    const workExperience =
      await this.prisma.recruiterWorkExperience.findFirstOrThrow({
        where: { recruiterId: recruiter.id, isCurrent: true },
        orderBy: { startDate: 'desc' },
      });

    return workExperience;
  }

  async getCandidateCurrentWorkExperience(
    userId: number,
  ): Promise<CandidateWorkExperienceResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const ExperiencesExist = await this.prisma.candidateWorkExperience.count();

    if (ExperiencesExist < 1) {
      throw new InternalServerErrorException(
        'Not enough work-experience entries',
      );
    }

    const workExperience =
      await this.prisma.candidateWorkExperience.findFirstOrThrow({
        where: { candidateId: candidate.id, isCurrent: true },
        orderBy: { startDate: 'desc' },
      });

    return workExperience;
  }
}
