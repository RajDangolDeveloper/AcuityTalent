export interface Education {
  id: number;
  candidateId: number;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startDate: string;
  endDate?: string | null;
  gpa?: number | null;
  description?: string | null;
  createdAt: string;
}
