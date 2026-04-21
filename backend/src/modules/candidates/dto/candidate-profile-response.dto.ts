import { EmploymentType, EducationLevel } from '@prisma/client';




export class CandidateProfileResponseDto {
  id: number;
  userId: number;
  headline?: string | null;
  currentPosition?: string | null;
  currentCompanyId?: number | null;
  experienceYears?: number | null;
  highestDegree?: EducationLevel | null;
  skills: string[];
  preferredLocation?: string | null;
  preferredJobType?: EmploymentType | null;
  expectedSalary?: number | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  phone?: string | null;
  location?: string | null;
  summary?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
