import { ApplicationStatus } from '@prisma/client';
import { CandidateWorkExperienceResponseDto } from '../../workExperience/entity';

export class ApplicationResponseDto {
  id!: number;
  candidateId!: number;
  candidateSkills!: string[];
  candidatePhone?: number;
  candidateExperience?: CandidateWorkExperienceResponseDto[];
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
