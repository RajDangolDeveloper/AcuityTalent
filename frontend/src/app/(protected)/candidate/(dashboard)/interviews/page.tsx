"use client";

import InterviewCard from "@/src/components/interview/InterviewCard";
import InterviewDetailModal from "@/src/components/interview/InterviewDetailModel";
import { useUpcomingInterviews } from "@/src/hooks/useInterviewApi";
import { InterviewType, Interview } from "@/src/types/interview";
import router from "next/router";
import { useState } from "react";

const typeLabels: Record<InterviewType, string> = {
  [InterviewType.SCREENING]: "Screening",
  [InterviewType.TECHNICAL]: "Technical",
  [InterviewType.FINAL]: "Final Round",
  [InterviewType.HR]: "HR Round",
  [InterviewType.SYSTEM_DESIGN]: "System Design",
};

export default function InterviewsPage() {
  const [filter, setFilter] = useState<
    "all" | "today" | "this-week" | InterviewType
  >("all");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const {
    data: interviews = [],
    isLoading,
    error,
  } = useUpcomingInterviews(month, {
    staleTime: 1000 * 60 * 5,
  });

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    return d >= today && d <= endOfWeek;
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (filter === "all") return true;
    if (filter === "today") return isToday(interview.scheduledAt);
    if (filter === "this-week") return isThisWeek(interview.scheduledAt);
    return interview.interviewType === filter;
  });

  const groupedByDate = filteredInterviews.reduce<Record<string, Interview[]>>(
    (acc, interview) => {
      const dateKey = new Date(interview.scheduledAt)
        .toISOString()
        .split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(interview);
      return acc;
    },
    {},
  );

  const stats = {
    total: interviews.length,
    today: interviews.filter((i) => isToday(i.scheduledAt)).length,
    week: interviews.filter((i) => isThisWeek(i.scheduledAt)).length,
    month: interviews.length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Failed to load interviews
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Interviews",
            value: stats.total,
            color: "text-gray-800",
          },
          { label: "Today", value: stats.today, color: "text-green-600" },
          { label: "This Week", value: stats.week, color: "text-yellow-600" },
          { label: "This Month", value: stats.month, color: "text-purple-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/85 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-sm"
          >
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          "all",
          "today",
          "this-week",
          InterviewType.SCREENING,
          InterviewType.TECHNICAL,
          InterviewType.FINAL,
        ].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? "bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {typeLabels[f as InterviewType] || f.replace("-", " ")}
          </button>
        ))}
      </div>

      {Object.keys(groupedByDate).length === 0 ? (
        <div className="text-center py-20 bg-white/85 backdrop-blur-md border border-white/50 rounded-xl shadow-sm">
          <div className="text-gray-500 text-lg font-medium">
            No upcoming interviews
          </div>
          <p className="text-gray-400 mt-2">
            Check back later or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([dateStr, dateInterviews]) => {
            const date = new Date(dateStr);
            const isTodayDate = isToday(dateStr);
            const dayName = date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const dayNum = date.getDate();
            const monthName = date.toLocaleDateString("en-US", {
              month: "short",
            });

            return (
              <div key={dateStr} className="relative">
                <div
                  className={`flex items-center gap-3 mb-4 p-4 rounded-xl ${isTodayDate ? "bg-indigo-50 border border-indigo-200" : "bg-white/85 border border-white/50 shadow-sm"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${isTodayDate ? "bg-linear-to-br from-indigo-500 to-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}
                  >
                    <div className="text-center leading-none">
                      <div className="text-sm font-bold">{dayNum}</div>
                      <div className="text-xs opacity-75">{monthName}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">
                        {date.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                      {isTodayDate && (
                        <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-medium rounded-full animate-pulse">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {dayName} · {dateInterviews.length} interview
                      {dateInterviews.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {dateInterviews.map((interview, index) => (
                    <InterviewCard
                      key={interview.id}
                      interview={interview}
                      typeLabel={typeLabels[interview.interviewType]}
                      onClick={() => setSelectedInterview(interview)}
                      animationDelay={index * 0.08}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <InterviewDetailModal
        interview={selectedInterview}
        isOpen={!!selectedInterview}
        onClose={() => setSelectedInterview(null)}
        onJoin={(roomId) => router.push(`/interviews/room/${roomId}`)}
      />
    </div>
  );
}
