import { JobStatus } from '@prisma/client';
import { IsEnum, IsNumber } from 'class-validator';

export class updateJobStatusDto {
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'id must be a valid number' },
  )
  id!: number;

  @IsEnum(JobStatus)
  status!: JobStatus;
}
