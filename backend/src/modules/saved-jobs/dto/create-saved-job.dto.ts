import { IsNumber } from 'class-validator';




export class CreateSavedJobDto {
  @IsNumber()
  jobId: number;
}
