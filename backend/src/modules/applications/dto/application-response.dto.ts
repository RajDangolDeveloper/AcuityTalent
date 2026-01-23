import { ApplicationStatus } from '@prisma/client';

/**
 * DTO for application response
 * Standardizes data returned to client
 */
export class ApplicationResponseDto {
  id: number;
  candidateId: number;
  jobId: number;
  resumeId: number;
  status: ApplicationStatus;
  coverLetter?: string;
  matchScore?: number;
  appliedAt: Date;
  reviewedAt?: Date;
  updatedAt: Date;

  // Populated relationships
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  companyName?: string;
  resumeFileName?: string;
}
