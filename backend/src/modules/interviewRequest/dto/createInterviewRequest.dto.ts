import { InterviewRequestStatus, LocationType } from '@prisma/client';
import { IsArray, IsDate, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class createInterviewRequestDto {
  @IsNumber()
  jobId!: number;

  @IsNumber()
  candidateId!: number;

  @IsNumber()
  recruiterId!: number;

  @IsArray()
  availableDateRange!: Date[];

  @IsDate()
  @Type(() => Date)
  selectedDateTime!: Date;

  @IsEnum(InterviewRequestStatus)
  status!: InterviewRequestStatus;

  @IsEnum(LocationType)
  locationType!: LocationType;
}
