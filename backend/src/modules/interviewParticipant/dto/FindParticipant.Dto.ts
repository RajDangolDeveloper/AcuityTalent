import { IsNumber } from 'class-validator';

export class FindParticipantDto {
  @IsNumber()
  id!: number;
}
