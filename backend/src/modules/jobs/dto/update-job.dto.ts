import { IsOptional, IsString, IsEnum } from 'class-validator';
import {
  JobStatus,
  EmploymentType,
  ExperienceLevel,
  LocationType,
} from '@prisma/client';

/**
 * DTO for updating job information
 */
export class UpdateJobDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsString()
  salaryRange?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsEnum(LocationType)
  @IsString()
  locationType?: LocationType;

  @IsOptional()
  remoteAvailable?: boolean;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus; // DRAFT, ACTIVE, CLOSED, ARCHIVED
}
