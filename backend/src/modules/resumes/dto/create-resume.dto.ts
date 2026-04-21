import {
  IsString,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { FileType } from '@prisma/client';





export class CreateResumeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  fileName!: string;

  @IsString()
  filePath!: string; 

  @IsString()
  fileType!: FileType; 

  @IsInt()
  fileSize!: number; 

  @IsInt()
  aiScore!: number; 

  @IsOptional()
  @IsString()
  textContent?: string; 
}
