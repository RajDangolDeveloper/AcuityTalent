import { IsNumber } from 'class-validator';

/**
 * DTO for creating a saved job
 */
export class CreateSavedJobDto {
  @IsNumber()
  jobId: number;
}
