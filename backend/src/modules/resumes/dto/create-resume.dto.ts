import {
  IsString,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { FileType } from '@prisma/client';

/**
 * DTO for creating a new resume
 * Maps to: Step 2 in sequence diagram - Creates resume & fills up details
 */
export class CreateResumeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  fileName: string;

  @IsString()
  filePath: string; // S3 URL or local path

  @IsString()
  fileType: FileType; // PDF, DOCX, DOC, TXT

  @IsInt()
  fileSize: number; // in bytes

  @IsOptional()
  @IsString()
  textContent?: string; // Extracted text for search
}
