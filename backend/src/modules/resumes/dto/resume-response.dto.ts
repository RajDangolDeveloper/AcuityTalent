import { FileType } from '@prisma/client';

export class ResumeResponseDto {
  id!: number;
  candidateId!: number;
  fileName!: string;
  filePath!: string;
  fileType!: FileType;
  fileSize!: number;
  textContent?: string;
  resumeText?: string;
  uploadedAt!: Date;
  createdAt!: Date;
}
