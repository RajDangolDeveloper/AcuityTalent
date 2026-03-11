import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

/**
 * DTO for updating application status
 * Maps to: Steps 16, 22, 25, 28 in sequence diagram
 * - Step 16: Shortlist candidate
 * - Step 22: Accept candidate
 * - Step 25: Reject after interview
 * - Step 28: Recruiter rejects candidate
 */
export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  comments?: string;
}
