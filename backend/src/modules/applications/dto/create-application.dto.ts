import {
  IsInt,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO for creating a new job application
 * Maps to: Step 11 in sequence diagram - Submits application
 */
export class CreateApplicationDto {
  @IsInt()
  jobId: number;

  @IsInt()
  resumeId: number;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  coverLetter?: string;
}
