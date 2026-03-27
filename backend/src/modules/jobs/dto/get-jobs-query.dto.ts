import { IsEnum, IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { EmploymentType, ExperienceLevel, JobStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetJobsQueryDto {
  @IsOptional()
  @IsString()
  search?: string; // Search in title and description

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus; // For recruiter's own jobs

  @IsOptional()
  remoteAvailable?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(50)
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  sortBy?: string; // 'recent', 'views', 'salary'
}
