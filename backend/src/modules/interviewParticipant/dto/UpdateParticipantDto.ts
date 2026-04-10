import { ParticipantRole, ParticipantStatus } from '@prisma/client';
import { IsDate, IsDateString, IsEnum, IsNumber } from 'class-validator';

export class UpdateParticipantDto {
  @IsNumber()
  id!: number;

  @IsEnum(ParticipantStatus)
  status!: ParticipantStatus;

  @IsDateString()
  joinedAt!: Date;
}
