import { templates } from "../components/templates";

export enum FileType {
  PDF,
  DOCX,
  DOC,
  TXT,
}

export interface Resume {
  id: number;
  candidateId: number;
  filePath: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  aiScore: number;
  textContent?: string | null;
  uploadedAt?: string | null; // ISO date string
  createdAt: string;
}

export interface CreateResumeDto {
  candidateId: number;
}

export interface UpdateResumeDto {
  aiScore?: number;
  textContent?: string;
}

export interface UploadResumeParams {
  file: File;
  userId: number;
  textContent?: string; // optional if not always needed
}

export type TemplateKey = keyof typeof templates;
