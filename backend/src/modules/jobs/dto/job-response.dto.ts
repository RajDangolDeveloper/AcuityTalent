import { JobStatus, EmploymentType, ExperienceLevel } from '@prisma/client';

/**
 * DTO for job response
 * Standardizes data returned to client
 */
export class JobResponseDto {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  employmentType: EmploymentType;
  experienceLevel?: ExperienceLevel;
  salaryRange?: string;
  location: string;
  remoteAvailable: boolean;
  status: JobStatus;
  postedDate?: Date;
  applicationDeadline?: Date;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;

  // Populated relationships
  recruiterName?: string;
  recruiterEmail?: string;
  companyName?: string;
  applicationCount?: number;
}
