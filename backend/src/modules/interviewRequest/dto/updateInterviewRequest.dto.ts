import { InterviewRequestStatus, LocationType } from '@prisma/client';
import { IsArray, IsDate, IsEnum, IsNumber } from 'class-validator';

export class updateInterviewRequestDto {
  @IsNumber()
  id!: number;

  @IsNumber()
  jobId!: number;

  @IsNumber()
  candidateId!: number;

  @IsNumber()
  recruiterId!: number;

  @IsArray()
  availableDateRange!: Date[];

  @IsDate()
  selectedDateTime!: Date;

  @IsEnum(InterviewRequestStatus)
  status!: InterviewRequestStatus;

  @IsEnum(LocationType)
  locationType!: LocationType;

  @IsDate()
  updatedAt!: Date;
}
