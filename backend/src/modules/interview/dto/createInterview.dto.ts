import {
  IsInt,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';

export enum InterviewType {
  SCREENING = 'SCREENING',
  TECHNICAL = 'TECHNICAL',
  FINAL = 'FINAL',
  HR = 'HR',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
}

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
  scheduledAt!: string;

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


