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
  candidateExperience?: WorkExperience[];
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

export interface WorkExperience {
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  data: T[];
  pagination: PaginationMeta;
}

export interface SingleResponse<T> {
  statusCode: number;
  data: T;
}
