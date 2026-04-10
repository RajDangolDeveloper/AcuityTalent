import { IsNumber } from 'class-validator';

export class FindAllParticipantDto {
  @IsNumber()
  id!: number;
}
