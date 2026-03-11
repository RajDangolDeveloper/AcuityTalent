import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { EmploymentType, EducationLevel } from '@prisma/client';

/**
 * DTO for updating a candidate profile
 */
export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  currentPosition?: string;

  @IsOptional()
  @IsNumber()
  currentCompanyId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  experienceYears?: number;

  @IsOptional()
  @IsEnum(EducationLevel)
  highestDegree?: EducationLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  preferredLocation?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  preferredJobType?: EmploymentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedSalary?: number;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl()
  githubUrl?: string;
}