import { IsOptional, IsString } from 'class-validator';
import { FileType } from '@prisma/client';




export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  textContent?: string;
}
