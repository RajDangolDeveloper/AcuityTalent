// Recruiter View Types

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
  | "INTERNSHIP";

export type JobStatus = "ACTIVE" | "CLOSED" | "DRAFT";

// Job listing (Group 69)
export interface Job {
  id: number;
  title: string;
  companyName: string;
  location: string;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements?: string[];
  applicationCount: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

// Candidate application (Group 69 - candidate card in list)
export interface CandidateApplication {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  location: string;
  phone?: string;
  profileImage?: string;
  yearsOfExperience?: number;
  status: ApplicationStatus;
  matchScore?: number;
  appliedAt: string;
}

export interface CandidateProfile {
  id: number;
  userId?: number;
  name: string; // Display name (derived from User table on backend)
  email: string; // From User table
  phone?: string;
  location?: string;
  profileImage?: string;
  yearsOfExperience?: number; // Maps to experienceYears in schema
  summary?: string;
  skills: string[];
  workExperience: WorkExperience[];
  education: Education[];
  resumeId?: number;
  resumeFileName?: string;
  appliedDate?: string; // From Application table
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: number;
  position: string;
  companyName: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  description: string;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  currentlyStudying: boolean;
  description?: string;
}

// Application details with candidate info
export interface ApplicationDetail {
  id: number;
  jobId: number;
  candidateId: number;
  status: ApplicationStatus;
  appliedAt: string; // When candidate applied
  matchScore?: number;
  coverLetter?: string;
  candidate: CandidateProfile;
  job: {
    id: number;
    title: string;
    companyName: string;
  };
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
