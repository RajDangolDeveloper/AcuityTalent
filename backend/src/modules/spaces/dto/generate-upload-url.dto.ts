import { IsString } from 'class-validator';

export class GenerateUploadUrlDto {
  @IsString()
  fileName: string;

  @IsString()
  contentType: string;
}
