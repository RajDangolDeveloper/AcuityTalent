import { InterviewType } from '@prisma/client';
import {
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  IsDate,
  IsDateString,
} from 'class-validator';

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class CreateInterviewDto {
  @IsInt()
  applicationId!: number;

  @IsInt()
  interviewerId!: number;

  @IsEnum(InterviewType)
  interviewType!: InterviewType;

  @IsDateString()
  scheduledAt!: Date;

  @IsOptional()
  @IsString()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsUrl()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
