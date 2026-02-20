// Candidate View Types

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

// Job listing for candidates
export interface Job {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel?: ExperienceLevel;
  salaryRange?: string;
  remoteAvailable: boolean;
  companyName: string;
  companyId: number;
  postedDate?: string;
  applicationDeadline?: string;
  viewsCount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

// Job details (expanded view)
export interface JobDetails extends Job {
  recruiterName?: string;
  recruiterEmail?: string;
}

// Candidate's application
export interface CandidateApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  location: string;
  employmentType: EmploymentType;
  status: ApplicationStatus;
  matchScore?: number;
  appliedAt: string;
  resumeFileName?: string;
  coverLetter?: string;
  reviewedAt?: string;
}

// Resume info for application
export interface Resume {
  id: number;
  fileName: string;
  fileType: "PDF" | "DOCX" | "DOC" | "TXT";
  uploadedAt: string;
}

// Saved job
export interface SavedJob {
  id: number;
  jobId: number;
  job: Job;
  createdAt: string;
}

// Candidate's own profile
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

// Pagination
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
