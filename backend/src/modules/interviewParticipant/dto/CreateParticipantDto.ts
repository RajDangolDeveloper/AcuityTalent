import { ParticipantRole } from '@prisma/client';
import { IsEnum, IsNumber } from 'class-validator';

export class CreateParticipantDto {
  @IsNumber()
  interviewId!: number;

  @IsNumber()
  userId!: number;

  @IsEnum(ParticipantRole)
  role!: ParticipantRole;
}
