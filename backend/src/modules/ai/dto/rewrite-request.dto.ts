import { IsOptional, IsString, MinLength } from 'class-validator';

export class RewriteRequest {
  @IsString()
  @MinLength(5)
  text: string;

  @IsOptional()
  @IsString()
  topic?: string;
}
