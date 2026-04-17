import { IsString } from 'class-validator';

export class EmbeddingRequest {
  @IsString()
  text!: string;
}
