import { ApplicationStatus } from '@prisma/client';
import { WorkExperienceResponseDto } from '../../candidates/dto/work-experience-response.dto';

export class ApplicationResponseDto {
  id!: number;
  candidateId!: number;
  candidateSkills!: string[];
  candidatePhone?: number;
  candidateExperience?: WorkExperienceResponseDto[];
  jobId!: number;
  resumeId!: number;
  status!: ApplicationStatus;
  coverLetter?: string;
  matchScore?: number;
  riskScore?: number;
  appliedAt!: Date;
  reviewedAt?: Date;
  updatedAt!: Date;

  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  companyName?: string;
  resumeFileName?: string;
}
