export interface AdminOverviewResponse {
  users: number;
  candidates: number;
  recruiters: number;
  companies: number;
  jobs: number;
  applications: number;
  interviews: number;
  resumes: number;
  savedJobs: number;
  candidateEmbeddings: number;
  jobEmbeddings: number;
}

export interface AdminListResponse<T = Record<string, unknown>> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminEmbeddingResponse {
  candidateEmbeddings: Record<string, unknown>[];
  jobEmbeddings: Record<string, unknown>[];
  totalCandidate: number;
  totalJobs: number;
  page: number;
  limit: number;
}
