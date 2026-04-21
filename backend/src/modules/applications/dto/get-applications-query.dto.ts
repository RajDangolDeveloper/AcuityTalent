import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApplicationStatus, JobStatus } from '@prisma/client';
import { Type } from 'class-transformer';





export class GetApplicationsQueryDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  jobId?: number;

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
}
