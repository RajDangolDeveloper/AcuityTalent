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

export type ExperienceLevel = "ENTRY" | "MID" | "SENIOR" | "EXECUTIVE";

export type JobStatus = "ACTIVE" | "CLOSED" | "DRAFT";

export type LocationType = "HYBRID" | "REMOTE" | "ONSITE";

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements?: string | null;
  employmentType: EmploymentType;
  experienceLevel?: ExperienceLevel | null;
  salaryRange?: string | null;
  location: string;
  remoteAvailable: boolean;
  status: JobStatus;
  postedDate?: Date | null;
  applicationDeadline?: Date | null;
  viewsCount: number;
  latestAppliedDate: Date;
  createdAt: Date;
  updatedAt: Date;

  recruiterName?: string;
  recruiterEmail?: string;
  companyId: number;
  companyName?: string;
  applicationCount?: number;
}

export interface CandidateProfile {
  id: number;
  userId?: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profileImage?: string;
  yearsOfExperience?: number;
  summary?: string;
  skills: string[];
  workExperience: WorkExperience[];
  education: Education[];
  resumeId?: number;
  resumeFileName?: string;
  appliedDate?: string;
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
