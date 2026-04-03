import { PartialType } from '@nestjs/mapped-types';

import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { CreateInterviewDto, InterviewStatus } from './createInterview.dto';

export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {
  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;

  @IsDate()
  @IsOptional()
  actualStartAt?: Date;

  @IsDate()
  @IsOptional()
  actualEndAt?: Date;

  @IsString()
  @IsOptional()
  recordingUrl?: string;
}
