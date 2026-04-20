export class RewriteResponse {
  improved_text: string;
  status: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  raw_response?: string;
}
