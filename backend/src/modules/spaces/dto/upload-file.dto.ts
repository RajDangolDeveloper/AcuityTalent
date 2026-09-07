import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UploadType } from '../types/types';

export class UploadFileDto {
  @IsNumber()
  @Type(() => Number)
  id!: number;

  @IsString()
  fileName!: string;

  @IsString()
  fileType!: string;

  @IsEnum(UploadType)
  uploadType!: UploadType;
}
