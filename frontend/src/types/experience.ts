export interface CandidateWorkExperience {
  id: number;
  candidateId: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string | undefined;
  isCurrent: boolean;
  description?: string | null;
  createdAt: string;
}

export interface RecruiterWorkExperience {
  id: number;
  recruiterId: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string | undefined;
  isCurrent: boolean;
  description?: string | null;
  createdAt: string;
}
