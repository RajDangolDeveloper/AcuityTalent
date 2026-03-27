import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateRecruiterProfileDto {
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'userId must be a valid number' },
  )
  userId: number;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'companyId must be a valid number' },
  )
  companyId: number;

  @IsString()
  positionTitle: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
