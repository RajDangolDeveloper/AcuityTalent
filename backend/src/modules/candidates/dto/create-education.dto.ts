import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { EducationLevel } from '@prisma/client';

export class CreateEducationDto {
  @IsString()
  institution: string;

  @IsEnum(EducationLevel)
  degree: EducationLevel;

  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4.0)
  gpa?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
