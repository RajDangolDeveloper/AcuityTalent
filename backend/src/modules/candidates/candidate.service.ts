import { PrismaService } from 'src/prisma/prisma.service';
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

@Injectable()
export class CandidateService {
  constructor(private prisma: PrismaService) {}

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
    return profile;
  }

  async getCandidateProfile(
    userId: number,
  ): Promise<CandidateProfileResponseDto> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    return profile;
  }

  async getCandidateProfileById(
    candidateId: number,
    requestingUserId: number,
  ): Promise<CandidateProfileResponseDto> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { id: candidateId },
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
    return profile;
  }

  async deleteCandidateProfile(userId: number): Promise<void> {
    await this.prisma.candidateProfile.delete({
      where: { userId },
    });
  }

  // Work Experience CRUD
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

    const workExp = await this.prisma.workExperience.create({
      data: {
        candidateId: candidate.id,
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      },
    });
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
  }

  // Education CRUD
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

    const education = await this.prisma.education.create({
      data: {
        candidateId: candidate.id,
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      },
    });
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
  }
}
