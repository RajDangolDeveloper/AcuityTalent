import { EducationLevel } from '@prisma/client';

export class CandidateEducationResponseDto {
  id!: number;
  candidateId!: number;
  institution!: string;
  degree!: EducationLevel;
  fieldOfStudy?: string | null;
  startDate!: Date;
  endDate?: Date | null;
  gpa?: number | null;
  description?: string | null;
  createdAt!: Date;
}
export class RecruiterEducationResponseDto {
  id!: number;
  recruiterId!: number;
  institution!: string;
  degree!: EducationLevel;
  fieldOfStudy?: string | null;
  startDate!: Date;
  endDate?: Date | null;
  gpa?: number | null;
  description?: string | null;
  createdAt!: Date;
}
