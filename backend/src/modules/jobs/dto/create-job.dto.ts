import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { EmploymentType, ExperienceLevel, LocationType } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(20)
  description!: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsString()
  salaryRange?: string;

  @IsString()
  @MinLength(3)
  location!: string;

  @IsEnum(LocationType)
  locationType;

  @IsOptional()
  remoteAvailable?: boolean;
}
