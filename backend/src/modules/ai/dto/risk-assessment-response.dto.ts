export class RiskAssessmentResponse {
  risk_score: number;
  risk_label: 'LOW' | 'MEDIUM' | 'HIGH';
  stability_score: number;
  skill_gap_score: number;
  salary_alignment_score: number;
  reliability_score: number;
  status: string;
}
