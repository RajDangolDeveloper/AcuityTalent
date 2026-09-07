import {
  IsInt,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateApplicationDto {
  @IsInt()
  jobId!: number;

  @IsInt()
  resumeId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverLetter?: string;
}
