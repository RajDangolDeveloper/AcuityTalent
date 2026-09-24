import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import {
  CandidateEducationResponseDto,
  RecruiterEducationResponseDto,
} from './entity';
import { PrismaService } from '../../prisma/prisma.service';
import { CandidateService } from '../candidates/candidate.service';

@Injectable()
export class EducationService {
  constructor(
    private prisma: PrismaService,
    private candidateService: CandidateService,
  ) {}

  async createCandidateEducation(
    userId: number,
    createDto: CreateEducationDto,
  ): Promise<CandidateEducationResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    if (!createDto.startDate) {
      throw new BadRequestException('startDate is required');
    }

    const education = await this.prisma.candidateEducation.create({
      data: {
        candidateId: candidate.id,
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      },
    });

    await this.candidateService.recomputeCandidateEmbedding(candidate.id);

    return education;
  }

  async getCandidateEducationList(
    userId: number,
  ): Promise<CandidateEducationResponseDto[]> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return await this.prisma.candidateEducation.findMany({
      where: { candidateId: candidate.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateCandidateEducation(
    userId: number,
    educationId: number,
    updateDto: UpdateEducationDto,
  ): Promise<CandidateEducationResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const education = await this.prisma.candidateEducation.findFirst({
      where: { id: educationId, candidateId: candidate.id },
    });
    if (!education) {
      throw new NotFoundException('Education not found');
    }

    const updated = await this.prisma.candidateEducation.update({
      where: { id: educationId },
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

  async deleteCandidateEducation(
    userId: number,
    educationId: number,
  ): Promise<void> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const education = await this.prisma.candidateEducation.findFirst({
      where: { id: educationId, candidateId: candidate.id },
    });
    if (!education) {
      throw new NotFoundException('Education not found');
    }

    await this.prisma.candidateEducation.delete({
      where: { id: educationId },
    });

    await this.candidateService.recomputeCandidateEmbedding(candidate.id);
  }

  async createRecruiterEducation(
    userId: number,
    createDto: CreateEducationDto,
  ): Promise<RecruiterEducationResponseDto> {
    const recruiter = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    if (!createDto.startDate) {
      throw new BadRequestException('startDate is required');
    }

    const education = await this.prisma.recruiterEducation.create({
      data: {
        recruiterId: recruiter.id,
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      },
    });

    return education;
  }

  async getRecruiterEducationList(
    userId: number,
  ): Promise<RecruiterEducationResponseDto[]> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });
    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    return await this.prisma.recruiterEducation.findMany({
      where: { recruiterId: recruiter.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateRecruiterEducation(
    userId: number,
    educationId: number,
    updateDto: UpdateEducationDto,
  ): Promise<RecruiterEducationResponseDto> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });
    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    const education = await this.prisma.recruiterEducation.findFirst({
      where: { id: educationId, recruiterId: recruiter.id },
    });
    if (!education) {
      throw new NotFoundException('Education not found');
    }

    const updated = await this.prisma.recruiterEducation.update({
      where: { id: educationId },
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

  async deleteRecruiterEducation(
    userId: number,
    educationId: number,
  ): Promise<void> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });
    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    const education = await this.prisma.recruiterEducation.findFirst({
      where: { id: educationId, recruiterId: recruiter.id },
    });
    if (!education) {
      throw new NotFoundException('Education not found');
    }

    await this.prisma.recruiterEducation.delete({
      where: { id: educationId },
    });
  }
}
