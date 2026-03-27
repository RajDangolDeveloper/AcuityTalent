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

// Candidate's application (matches backend ApplicationResponseDto)
export interface CandidateApplication {
  id: number;
  candidateId: number;
  jobId: number;
  resumeId: number;
  status: ApplicationStatus;
  coverLetter?: string;
  matchScore?: number;
  appliedAt: string;
  reviewedAt?: string;
  updatedAt: string;
  // Joined fields
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  companyName?: string;
  resumeFileName?: string;
}

// Resume info for application
export interface Resume {
  id: number;
  fileName: string;
  fileType: "PDF" | "DOCX" | "DOC" | "TXT";
  textContent: string;
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

export interface WorkExperience {
  id: number;
  candidateId: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
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
