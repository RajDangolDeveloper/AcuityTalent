import { PartialType } from '@nestjs/mapped-types';
import { createInterviewRequestDto } from './createInterviewRequest.dto';
import { IsNumber } from 'class-validator';

export class updateInterviewRequestDto extends PartialType(
  createInterviewRequestDto,
) {
  @IsNumber()
  id!: number;
}
