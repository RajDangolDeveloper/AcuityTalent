import { CandidateWorkExperience } from "./experience";

export type ApplicationStatus =
  | "APPLIED"
  | "REVIEWED"
  | "SHORTLISTED"
  | "INTERVIEWING"
  | "REJECTED"
  | "OFFER_EXTENDED"
  | "ACCEPTED"
  | "WITHDRAWN";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "TEMPORARY"
  | "FREELANCE";

export type ExperienceLevel = "ENTRY" | "MID" | "SENIOR" | "EXECUTIVE";

export interface Resume {
  id: number;
  fileName: string;
  fileType: "PDF" | "DOCX" | "DOC" | "TXT";
  textContent: string;
  resumeText: string;
  aiScore?: number;
  uploadedAt: string;
}

export interface CandidateApplication {
  id: number;
  candidateId: number;
  jobId: number;
  resumeId: number;

  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateSkills: string[];
  candidateExperience?: CandidateWorkExperience[];
  location?: string;
  phone?: string;
  profileImage?: string;
  yearsOfExperience?: number;

  jobTitle?: string;
  companyName?: string;
  resumeFileName?: string;

  status: ApplicationStatus;
  coverLetter?: string;
  matchScore?: number;
  riskScore?: number;
  appliedAt: string;
  reviewedAt?: string;
  updatedAt: string;
}

export interface CandidateProfile {
  id: number;
  userId?: number;
  headline?: string;
  currentPosition?: string;
  currentCompanyId?: number;
  experienceYears?: number;
  highestDegree?: string;
  skills: string[];
  preferredLocation?: string;
  preferredJobType?: EmploymentType;
  expectedSalary?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  phone?: string;
  location?: string;
  summary?: string;
  resumes: Resume[];
  createdAt: string;
  updatedAt: string;
}
