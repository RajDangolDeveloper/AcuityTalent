import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeResponseDto } from './dto/resume-response.dto';
import { FileType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async createResume(
    createResumeDto: CreateResumeDto,
    userId: number,
  ): Promise<ResumeResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new ForbiddenException('Only candidates can create resumes');
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; 
    if (createResumeDto.fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException('Resume file size exceeds 10MB limit');
    }

    const resume = await this.prisma.resume.create({
      data: {
        candidateId: candidate.id,
        ...createResumeDto,
        uploadedAt: new Date(),
      },
    });

    return this.formatResumeResponse(resume);
  }

  async getResumesByCandidate(id: number): Promise<ResumeResponseDto[]> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: id },
    });

    if (!candidate) {
      throw new ForbiddenException('Only candidates can view their resumes');
    }

    const resumes = await this.prisma.resume.findMany({
      where: { candidateId: candidate.id },
      orderBy: { createdAt: 'desc' },
    });

    return resumes.map((resume) => this.formatResumeResponse(resume));
  }

  async getResumeById(
    resumeId: number,
    userId: number,
  ): Promise<ResumeResponseDto> {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: { candidate: true },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.candidate.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this resume',
      );
    }

    return this.formatResumeResponse(resume);
  }

  async updateResume(
    resumeId: number,
    updateResumeDto: UpdateResumeDto,
    userId: number,
  ): Promise<ResumeResponseDto> {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: { candidate: true },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    
    if (resume.candidate.userId !== userId) {
      throw new ForbiddenException('You can only update your own resumes');
    }

    const updatedResume = await this.prisma.resume.update({
      where: { id: resumeId },
      data: updateResumeDto,
    });

    return this.formatResumeResponse(updatedResume);
  }

  async deleteResume(resumeId: number, userId: number): Promise<void> {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: { candidate: true },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.candidate.userId !== userId) {
      throw new ForbiddenException('You can only delete your own resumes');
    }

    const activeApplications = await this.prisma.application.count({
      where: {
        resumeId: resumeId,
        status: {
          notIn: ['REJECTED', 'WITHDRAWN'],
        },
      },
    });

    await this.prisma.resume.delete({
      where: { id: resumeId },
    });
  }

  async downloadResume(
    resumeId: number,
    userId: number,
  ): Promise<{ filePath: string; fileName: string; fileType: string }> {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: { candidate: true },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.candidate.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to download this resume',
      );
    }

    return {
      filePath: resume.filePath,
      fileName: resume.fileName,
      fileType: resume.fileType,
    };
  }

  async getResumeCount(userId: number): Promise<number> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      return 0;
    }

    return this.prisma.resume.count({
      where: { candidateId: candidate.id },
    });
  }

  async createFromLocalFile(
    file: Express.Multer.File,
    userId: number,
    textContent: string,
    resumeText: string,
  ) {
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidateProfile) {
      throw new NotFoundException('Candidate profile not found for this user');
    }
    const fileType = this.mapMimeToFileType(file.mimetype);
    const filePath = file.path;

    const resume = await this.prisma.resume.create({
      data: {
        candidateId: candidateProfile.id,
        filePath,
        fileName: file.originalname,
        fileType,
        fileSize: file.size,
        aiScore: 0,
        resumeText: resumeText,
        textContent: textContent,
        uploadedAt: new Date(),
      },
    });
    return resume;
  }

  private mapMimeToFileType(mime: string): FileType {
    if (mime === 'application/pdf') return 'PDF';
    if (mime === 'application/msword') return 'DOC';
    if (
      mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
      return 'DOCX';
    return 'PDF'; 
  }

  private formatResumeResponse(resume: any): ResumeResponseDto {
    return {
      id: resume.id,
      candidateId: resume.candidateId,
      fileName: resume.fileName,
      filePath: resume.filePath,
      fileType: resume.fileType,
      fileSize: resume.fileSize,
      textContent: resume.textContent,
      resumeText: resume.resumeText,
      uploadedAt: resume.uploadedAt,
      createdAt: resume.createdAt,
    };
  }
}
