export class JobRecommendation {
  job_id: number = 0;
  title: string = '';
  location: string = '';
  employment_type: string = '';
  match_score: number = 0;
}

export class JobRecommendationsResponse {
  recommendations: JobRecommendation[] = [];
  total_count: number = 0;
  status: string = '';
}
