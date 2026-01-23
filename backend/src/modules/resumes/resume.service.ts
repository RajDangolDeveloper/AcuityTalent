import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeResponseDto } from './dto/resume-response.dto';

/**
 * ResumeService - Handles all resume-related business logic
 * Covers: Resume upload, management, retrieval
 * Maps to sequence diagram steps: 1-4
 */
@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Step 2: Candidate creates resume & fills up details
   * Uploads resume file and stores metadata
   */
  async createResume(
    createResumeDto: CreateResumeDto,
    userId: number,
  ): Promise<ResumeResponseDto> {
    // Verify user is a candidate
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new ForbiddenException('Only candidates can create resumes');
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (createResumeDto.fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException('Resume file size exceeds 5MB limit');
    }

    // Create resume record
    const resume = await this.prisma.resume.create({
      data: {
        candidateId: candidate.id,
        ...createResumeDto,
        uploadedAt: new Date(),
      },
    });

    return this.formatResumeResponse(resume);
  }

  /**
   * Step 3: Candidate sees resume list and preview
   * Retrieves all resumes for a candidate
   */
  async getResumesByCandidate(userId: number): Promise<ResumeResponseDto[]> {
    // Verify user is a candidate
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
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

  /**
   * Get a single resume by ID
   * Verifies ownership before returning
   */
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

    // Verify ownership - candidate can only view their own resumes
    if (resume.candidate.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this resume',
      );
    }

    return this.formatResumeResponse(resume);
  }

  /**
   * Step 4: Candidate selects options (export pdf, etc)
   * Updates resume metadata (e.g., adding extracted text)
   */
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

    // Verify ownership
    if (resume.candidate.userId !== userId) {
      throw new ForbiddenException('You can only update your own resumes');
    }

    const updatedResume = await this.prisma.resume.update({
      where: { id: resumeId },
      data: updateResumeDto,
    });

    return this.formatResumeResponse(updatedResume);
  }

  /**
   * Delete a resume
   * Cascades to all applications using this resume
   */
  async deleteResume(resumeId: number, userId: number): Promise<void> {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: { candidate: true },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Verify ownership
    if (resume.candidate.userId !== userId) {
      throw new ForbiddenException('You can only delete your own resumes');
    }

    // Check if resume is used in active applications
    const activeApplications = await this.prisma.application.count({
      where: {
        resumeId: resumeId,
        status: {
          notIn: ['REJECTED', 'WITHDRAWN'],
        },
      },
    });

    if (activeApplications > 0) {
      throw new BadRequestException(
        'Cannot delete resume that has active applications',
      );
    }

    await this.prisma.resume.delete({
      where: { id: resumeId },
    });
  }

  /**
   * Get resume file for download/preview
   * Returns resume details including file path for frontend to fetch
   */
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

    // Verify ownership
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

  /**
   * Get resume count for candidate
   */
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

  /**
   * Format resume for API response
   */
  private formatResumeResponse(resume: any): ResumeResponseDto {
    return {
      id: resume.id,
      candidateId: resume.candidateId,
      fileName: resume.fileName,
      filePath: resume.filePath,
      fileType: resume.fileType,
      fileSize: resume.fileSize,
      uploadedAt: resume.uploadedAt,
      createdAt: resume.createdAt,
      textContent: resume.textContent,
    };
  }
}
