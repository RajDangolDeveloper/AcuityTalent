import { PartialType } from '@nestjs/mapped-types';
import { createInterviewRequestDto } from './createInterviewRequest.dto';
import { IsEnum, IsNumber } from 'class-validator';
import { InterviewRequestStatus, InterviewType } from '@prisma/client';

export class updateInterviewRequestDto extends PartialType(
  createInterviewRequestDto,
) {
  @IsNumber()
  id!: number;

  @IsEnum(InterviewRequestStatus)
  status!: InterviewRequestStatus;
}
