import { IsNumber } from 'class-validator';

export class DeleteRecruiterProfileDto {
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'userId must be a valid number' },
  )
  id: number;
}
