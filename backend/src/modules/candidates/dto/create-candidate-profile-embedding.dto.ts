import { IsNumber, IsArray } from 'class-validator';

export class CreateCandidateEmbeddingDto {
  @IsNumber()
  id!: number;

  @IsNumber()
  candidateProfileId!: number;

  @IsArray()
  embedding!: number[];
}
