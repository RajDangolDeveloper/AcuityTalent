export class WorkHistoryRiskItem {
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
}

export class InterviewRiskItem {
  status: string;
}

export class RiskAssessmentRequest {
  work_history: WorkHistoryRiskItem[];
  candidate_skills: string[];
  job_requirements: string;
  expected_salary?: number | null;
  offered_salary?: number | null;
  interviews: InterviewRiskItem[];
}
