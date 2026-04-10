"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useInterviews } from "@/src/hooks/useInterviewApi";
import { useGetCurrentRecruiterProfile } from "@/src/hooks/useRecruiterApi";
import { InterviewType } from "@/src/types/interview";
import RecruiterInterviewCard from "@/src/components/recruiter/RecruiterInterviewCard";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  PlayCircle,
} from "lucide-react";

const typeLabelMap: Record<InterviewType, string> = {
  SCREENING: "Screening",
  TECHNICAL: "Technical",
  FINAL: "Final",
  HR: "HR",
  SYSTEM_DESIGN: "System Design",
};

const statusConfig = {
  SCHEDULED: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-green-100 text-green-700",
    icon: PlayCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-gray-200 text-gray-700",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: AlertCircle,
  },
  RESCHEDULED: {
    label: "Rescheduled",
    color: "bg-purple-100 text-purple-700",
    icon: AlertCircle,
  },
  NO_SHOW: {
    label: "No Show",
    color: "bg-orange-100 text-orange-700",
    icon: AlertCircle,
  },
};

export default function RecruiterInterviewPage() {
  const router = useRouter();
  const { data: recruiterProfile } = useGetCurrentRecruiterProfile();
  const { data: interviews = [], isLoading, error } = useInterviews();

  const recruiterInterviews = useMemo(() => {
    if (!recruiterProfile?.id) return [];
    return interviews
      .filter((interview) => interview.interviewerId === recruiterProfile.id)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
  }, [interviews, recruiterProfile?.id]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-gray-600">Loading interviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Failed to load interviews.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <p className="text-sm text-gray-500">
          {recruiterInterviews.length} scheduled interviews
        </p>
      </div>

      {recruiterInterviews.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
          No interviews found. Schedule one from a candidate application.
        </div>
      ) : (
        <div className="space-y-3">
          {recruiterInterviews.map((interview) => (
            <RecruiterInterviewCard
              key={interview.id}
              interview={interview}
              typeLabel={typeLabelMap[interview.interviewType]}
              statusConfig={statusConfig as any}
              onView={() =>
                router.push(`/recruiter/interview/${interview.roomId}`)
              }
              onJoin={() =>
                router.push(`/recruiter/interview/${interview.roomId}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
