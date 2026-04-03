"use client";

import { Interview } from "@/src/types/interview";

interface InterviewCardProps {
  interview: Interview;
  typeLabel: string;
  onClick: () => void;
  animationDelay: number;
}

const typeColors = {
  SCREENING: { bg: "bg-blue-100", text: "text-blue-700" },
  TECHNICAL: { bg: "bg-purple-100", text: "text-purple-700" },
  FINAL: { bg: "bg-green-100", text: "text-green-700" },
  HR: { bg: "bg-yellow-100", text: "text-yellow-700" },
  SYSTEM_DESIGN: { bg: "bg-indigo-100", text: "text-indigo-700" },
};

export default function InterviewCard({
  interview,
  typeLabel,
  onClick,
  animationDelay,
}: InterviewCardProps) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const candidateName = interview.application?.candidate?.user
    ? `${interview.application.candidate.user.firstName} ${interview.application.candidate.user.lastName}`
    : "Candidate";
  const interviewerName = interview.interviewer
    ? `${interview.interviewer.firstName} ${interview.interviewer.lastName}`
    : "Interviewer";
  const colors =
    typeColors[interview.interviewType as keyof typeof typeColors] ||
    typeColors.SCREENING;

  return (
    <div
      className="bg-white/85 backdrop-blur-md border border-white/50 rounded-xl p-4 md:p-5 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300 transition-all duration-300"
      style={{
        animation: "slideIn 0.5s ease-out forwards",
        animationDelay: `${animationDelay}s`,
        opacity: 0,
      }}
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="hidden md:block p-0.5 rounded-full bg-linear-to-br from-indigo-500 to-purple-600">
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-600">
                {candidateName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-gray-800">{candidateName}</h4>
              <span
                className={`px-2 py-0.5 ${colors.bg} ${colors.text} text-xs font-medium rounded-full`}
              >
                {typeLabel}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {interview.application?.job?.title} · with {interviewerName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <svg
              className="w-4 h-4 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">
              {formatTime(interview.scheduledAt)}
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
