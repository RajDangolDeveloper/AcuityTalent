import { IsString, IsNotEmpty } from 'class-validator';

export class ReviewRequest {
  @IsString()
  @IsNotEmpty()
  resume_text: string;
}
