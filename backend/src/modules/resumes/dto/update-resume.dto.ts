import { IsOptional, IsString } from 'class-validator';
import { FileType } from '@prisma/client';

/**
 * DTO for updating resume information
 */
export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  textContent?: string;
}
