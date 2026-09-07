import { EmploymentType, ExperienceLevel } from "./candidate";

export type LocationType = "HYBRID" | "REMOTE" | "ON_SITE";

export type JobStatus = "ACTIVE" | "CLOSED" | "DRAFT";

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
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
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobDetails extends Job {
  recruiterName?: string;
  recruiterEmail?: string;
}

export interface SavedJob {
  id: number;
  jobId: number;
  job: Job;
  createdAt: string;
}
