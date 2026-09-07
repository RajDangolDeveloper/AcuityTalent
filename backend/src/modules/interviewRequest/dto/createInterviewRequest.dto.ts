import { InterviewType } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsNumber } from 'class-validator';

export class createInterviewRequestDto {
  @IsNumber()
  jobId!: number;

  @IsNumber()
  candidateId!: number;

  @IsNumber()
  applicationId!: number;

  @IsEnum(InterviewType)
  interviewType!: InterviewType;

  @IsArray()
  availableDateRange!: string[];

  @IsDateString()
  selectedDateTime!: string;
}
