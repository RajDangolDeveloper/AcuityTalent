export class ReviewResponse {
  summary: string;
  strength: string;
  changes: string;
  tips: string;
  status: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  raw_response?: string;
}
