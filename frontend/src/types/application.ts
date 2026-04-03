import { CandidateApplication } from "./candidate";

export interface ApplicationsResponse {
  statusCode: number;
  data: CandidateApplication[];
  pagination: { total: number; page: number; limit: number };
}