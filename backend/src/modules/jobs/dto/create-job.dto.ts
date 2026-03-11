import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { EmploymentType, ExperienceLevel } from '@prisma/client';

/**
 * DTO for creating a new job
 * Maps to: Step 6 in sequence diagram - Recruiter creates job
 */
export class CreateJobDto {
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsString()
  salaryRange?: string;

  @IsString()
  @MinLength(3)
  location: string;

  @IsOptional()
  remoteAvailable?: boolean;
}
