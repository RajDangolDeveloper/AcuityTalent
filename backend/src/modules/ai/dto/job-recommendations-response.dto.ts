export class JobRecommendation {
  job_id: number;
  title: string;
  location: string;
  employment_type: string;
  match_score: number;
}

export class JobRecommendationsResponse {
  recommendations: JobRecommendation[];
  total_count: number;
  status: string;
}
