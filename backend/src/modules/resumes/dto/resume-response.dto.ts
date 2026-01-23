import { FileType } from '@prisma/client';

/**
 * DTO for resume response
 * Standardizes data returned to client
 */
export class ResumeResponseDto {
  id: number;
  candidateId: number;
  fileName: string;
  filePath: string;
  fileType: FileType;
  fileSize: number;
  uploadedAt: Date;
  createdAt: Date;
  textContent?: string;
}
