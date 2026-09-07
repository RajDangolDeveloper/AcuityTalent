import { CandidateApplication, CandidateProfile } from "./candidate";

export interface ApplicationsResponse {
  statusCode: number;
  data: CandidateApplication[];
  pagination: { total: number; page: number; limit: number };
}

export enum ApplicationStatus {
  INTERVIEW,
  OFFERED,
  REJECTED,
  SHORTLIST,
}

export interface ApplicationDetail {
  id: number;
  jobId: number;
  candidateId: number;
  resumeId: number;
  status: ApplicationStatus;
  appliedAt: string;
  matchScore?: number;
  riskScore?: number;
  coverLetter?: string;
  candidate: CandidateProfile;
  job: {
    id: number;
    title: string;
    companyName: string;
  };
  resumeFileName?: string;
}

export const endpoints: Record<string, (id: number) => string> = {
  INTERVIEW: (id) => `/applications/${id}/interview`,
  OFFERED: (id) => `/applications/${id}/offer`,
  REJECTED: (id) => `/applications/${id}/reject`,
  SHORTLIST: (id) => `/applications/${id}/shortlist`,
};

export const interviewOptions: Record<string, string[]> = {
  INTERVIEW: [],
  OFFERED: [],
  REJECTED: [],
  SHORTLIST: [],
};
