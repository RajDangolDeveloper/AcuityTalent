import React, { useEffect, useState } from "react";
import apiClient from "@/src/app/api/api-client";
import Notification from "@/src/element/Notification";
import { Sparkles, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { ResumeData } from "./InputResumeDetails";
import AiUsageBlock from "@/src/components/ai/AiUsageBlock";

interface AiReviewProps {
  resumeData?: ResumeData;
  candidateId?: string;
  onClose?: () => void;
  isPremiumUser?: boolean;
}

interface ReviewResponse {
  summary?: string;
  strength?: string;
  changes?: string;
  tips?: string;
  status?: string;
  raw_response?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  response?: {
    response?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
}

const AiReview: React.FC<AiReviewProps> = ({
  resumeData,
  candidateId,
  onClose,
  isPremiumUser = false,
}) => {
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseReviewSections = (content: string): ReviewResponse => {
    const sections: Required<
      Pick<ReviewResponse, "summary" | "strength" | "changes" | "tips">
    > = {
      summary: "",
      strength: "",
      changes: "",
      tips: "",
    };

    let current: keyof typeof sections | null = null;
    for (const line of content.split(/\r?\n/)) {
      const upper = line.trim().toUpperCase();
      if (upper.startsWith("SUMMARY:")) {
        current = "summary";
        continue;
      }
      if (upper.startsWith("STRENGTHS:")) {
        current = "strength";
        continue;
      }
      if (upper.startsWith("CHANGES:")) {
        current = "changes";
        continue;
      }
      if (upper.startsWith("TIPS:")) {
        current = "tips";
        continue;
      }

      if (current) {
        sections[current] += `${line}\n`;
      }
    }

    const parsed = {
      summary: sections.summary.trim(),
      strength: sections.strength.trim(),
      changes: sections.changes.trim(),
      tips: sections.tips.trim(),
    };

    if (
      !parsed.summary &&
      !parsed.strength &&
      !parsed.changes &&
      !parsed.tips
    ) {
      parsed.summary = content.trim();
    }

    return parsed;
  };

  const normalizeReviewResponse = (data: ReviewResponse): ReviewResponse => {
    const rawText =
      data.raw_response?.trim() || data.response?.response?.trim() || "";

    const hasStructured =
      !!data.summary?.trim() ||
      !!data.strength?.trim() ||
      !!data.changes?.trim() ||
      !!data.tips?.trim();

    const parsed = rawText ? parseReviewSections(rawText) : {};

    return {
      ...data,
      summary: hasStructured ? data.summary : parsed.summary,
      strength: hasStructured ? data.strength : parsed.strength,
      changes: hasStructured ? data.changes : parsed.changes,
      tips: hasStructured ? data.tips : parsed.tips,
      raw_response: rawText || data.raw_response,
      usage: data.usage || data.response?.usage,
    };
  };

  const formatResumeAsText = (data?: ResumeData): string => {
    if (!data) return "";

    const sections: string[] = [];

    if (data.fullName || data.email || data.phone) {
      sections.push("PERSONAL INFORMATION");
      if (data.fullName) sections.push(`Name: ${data.fullName}`);
      if (data.email) sections.push(`Email: ${data.email}`);
      if (data.phone) sections.push(`Phone: ${data.phone}`);
      if (data.city) sections.push(`City: ${data.city}`);
      if (data.country) sections.push(`Country: ${data.country}`);
      sections.push("");
    }

    if (data.summary) {
      sections.push("PROFESSIONAL SUMMARY");
      sections.push(data.summary);
      sections.push("");
    }

    if (data.experience && data.experience.length > 0) {
      sections.push("WORK EXPERIENCE");
      data.experience.forEach((exp) => {
        sections.push(`${exp.title} at ${exp.employer}`);
        sections.push(`${exp.start} - ${exp.end}`);
        if (exp.city) sections.push(`Location: ${exp.city}`);
        if (exp.description) sections.push(`${exp.description}`);
        sections.push("");
      });
    }

    if (data.education && data.education.length > 0) {
      sections.push("EDUCATION");
      data.education.forEach((edu) => {
        sections.push(`${edu.degree} from ${edu.school}`);
        sections.push(`${edu.start} - ${edu.end}`);
        if (edu.city) sections.push(`Location: ${edu.city}`);
        if (edu.description) sections.push(`${edu.description}`);
        sections.push("");
      });
    }

    if (data.skills && data.skills.length > 0) {
      sections.push("SKILLS");
      data.skills.forEach((skill) => {
        const levelStr = skill.level ? ` (Level: ${skill.level}/5)` : "";
        sections.push(`${skill.skill}${levelStr}`);
      });
    }

    return sections.join("\n");
  };

  const generateReview = async () => {
    if (!isPremiumUser) {
      setError(
        "AI Resume Review is a premium feature. Upgrade to generate a review.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const resumeText = formatResumeAsText(resumeData);

      if (!resumeText.trim()) {
        setError(
          "Please fill in some resume details before requesting an AI review.",
        );
        return;
      }

      const response = await apiClient.post<ReviewResponse>(
        "/ai/review-resume",
        { resume_text: resumeText },
      );

      if (response.data) {
        setReview(normalizeReviewResponse(response.data));
        Notification({
          toastMessage: "Resume review generated successfully!",
          toastStatus: "success",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate AI review";
      setError(errorMessage);
      Notification({
        toastMessage: "Failed to generate resume review",
        toastStatus: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPremiumUser && resumeData && !review && !loading) {
      generateReview();
    }
  }, [isPremiumUser, loading, review, resumeData]);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold">AI Resume Review</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Ã—
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!review && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No review generated yet.</p>
            <button
              onClick={generateReview}
              disabled={loading || !resumeData || !isPremiumUser}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <Sparkles className="h-4 w-4" />
              {isPremiumUser ? "Generate AI Review" : "Premium Feature"}
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="animate-spin">
                <Sparkles className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-gray-600 font-medium">
                Analyzing your resume...
              </p>
              <p className="text-gray-400 text-sm">This may take a moment</p>
            </div>
          </div>
        )}

        {review && (
          <div className="space-y-6">
            <AiUsageBlock usage={review.usage} />

            {}
            {review.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Summary
                    </h3>
                    <p className="text-blue-800 text-sm whitespace-pre-wrap">
                      {review.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {}
            {review.strength && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Strengths
                    </h3>
                    <p className="text-green-800 text-sm whitespace-pre-wrap">
                      {review.strength}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {}
            {review.changes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      Areas for Improvement
                    </h3>
                    <p className="text-yellow-800 text-sm whitespace-pre-wrap">
                      {review.changes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {}
            {review.tips && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900 mb-2">Tips</h3>
                    <p className="text-purple-800 text-sm whitespace-pre-wrap">
                      {review.tips}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {}
            <button
              onClick={generateReview}
              disabled={loading || !isPremiumUser}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {loading
                ? "Regenerating..."
                : isPremiumUser
                  ? "Regenerate Review"
                  : "Premium Feature"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiReview;
