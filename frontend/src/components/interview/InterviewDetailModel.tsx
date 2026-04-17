"use client";

import { Interview, InterviewType } from "@/src/types/interview";

interface InterviewDetailModalProps {
  interview: Interview | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomId: string) => void;
}

const typeLabels: Record<InterviewType, string> = {
  SCREENING: "Screening",
  TECHNICAL: "Technical",
  FINAL: "Final Round",
  HR: "HR Round",
  SYSTEM_DESIGN: "System Design",
};

const typeColors: Record<InterviewType, { bg: string; text: string }> = {
  SCREENING: { bg: "bg-blue-100", text: "text-blue-700" },
  TECHNICAL: { bg: "bg-purple-100", text: "text-purple-700" },
  FINAL: { bg: "bg-green-100", text: "text-green-700" },
  HR: { bg: "bg-yellow-100", text: "text-yellow-700" },
  SYSTEM_DESIGN: { bg: "bg-indigo-100", text: "text-indigo-700" },
};

export default function InterviewDetailModal({
  interview,
  isOpen,
  onClose,
  onJoin,
}: InterviewDetailModalProps) {
  if (!isOpen || !interview) return null;

  const colors = typeColors[interview.interviewType];
  const candidateName = interview.application?.candidate?.user
    ? `${interview.application.candidate.user.firstName} ${interview.application.candidate.user.lastName}`
    : "Candidate";
  const interviewerName = interview.interviewer
    ? `${interview.interviewer.firstName || interview.interviewer.user?.firstName || ""} ${interview.interviewer.lastName || interview.interviewer.user?.lastName || ""}`.trim()
    : "Interviewer";

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const scheduledTime = new Date(interview.scheduledAt).getTime();
  const now = Date.now();
  const earlyWindowMs = 30 * 60 * 1000;
  const lateWindowMs = 60 * 60 * 1000;

  const canAttend =
    now >= scheduledTime - earlyWindowMs && now <= scheduledTime + lateWindowMs;
  const isBeforeWindow = now < scheduledTime - earlyWindowMs;
  const isAfterWindow = now > scheduledTime + lateWindowMs;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Interview Details
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-0.5 rounded-full bg-linear-to-br from-indigo-500 to-purple-600">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-600">
                  {candidateName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {candidateName}
              </h3>
              <p className="text-gray-500">
                {interview.application?.job?.title}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                label: "Date",
                value: formatDateTime(interview.scheduledAt),
              },
              {
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                label: "Time",
                value: formatTime(interview.scheduledAt),
              },
              {
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                label: "Interviewer",
                value: interviewerName,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={item.icon}
                    />
                  </svg>
                  <span className="text-gray-600">{item.label}</span>
                </div>
                {item.label === "Type" ? (
                  <span
                    className={`px-3 py-1 ${colors.bg} ${colors.text} text-sm font-medium rounded-full`}
                  >
                    {typeLabels[interview.interviewType]}
                  </span>
                ) : (
                  <span className="font-medium text-gray-800">
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {canAttend ? (
              <button
                onClick={() => onJoin(interview.roomId)}
                className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-[1.02]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Attend Interview
              </button>
            ) : isAfterWindow ? (
              <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-medium text-center">
                Interview Closed
              </div>
            ) : (
              <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-medium text-center">
                Available {formatTime(interview.scheduledAt)}
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
