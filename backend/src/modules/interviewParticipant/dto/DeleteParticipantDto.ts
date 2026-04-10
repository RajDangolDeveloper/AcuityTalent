import { ParticipantRole } from '@prisma/client';
import { IsEnum, IsNumber } from 'class-validator';

export class DeleteParticipantDto {
  @IsNumber()
  id!: number;
}
