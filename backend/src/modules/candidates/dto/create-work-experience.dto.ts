import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';




export class CreateWorkExperienceDto {
  @IsString()
  company!: string;

  @IsString()
  position!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
