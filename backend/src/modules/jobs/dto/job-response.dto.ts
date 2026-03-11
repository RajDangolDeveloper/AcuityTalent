import { JobStatus, EmploymentType, ExperienceLevel } from '@prisma/client';

/**
 * DTO for job response
 * Standardizes data returned to client
 */
export class JobResponseDto {
  id: number;
  title: string;
  description: string;
  requirements?: string | null;
  employmentType: EmploymentType;
  experienceLevel?: ExperienceLevel | null;
  salaryRange?: string | null;
  location: string;
  remoteAvailable: boolean;
  status: JobStatus;
  postedDate?: Date | null;
  applicationDeadline?: Date | null;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;

  // Populated relationships
  recruiterName?: string;
  recruiterEmail?: string;
  companyName?: string;
  applicationCount?: number;
}
