import { IsBoolean, IsString } from 'class-validator';

export class GenerateUploadUrlDto {
  @IsString()
  fileName!: string;

  @IsBoolean()
  isPrivate!: boolean;
}
