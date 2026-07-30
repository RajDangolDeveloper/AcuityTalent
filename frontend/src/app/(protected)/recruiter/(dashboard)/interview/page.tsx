"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviews } from "@/src/hooks/useInterviewApi";
import { useGetCurrentRecruiterProfile } from "@/src/hooks/useRecruiterApi";
import { InterviewType } from "@/src/types/interview";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  PlayCircle,
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  Video,
  Calendar,
  User,
  Briefcase,
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

const TABLE_PAGE_SIZE = 8;
const SIDEBAR_PAGE_SIZE = 3;
const CLOSED_STATUSES = new Set(["COMPLETED", "CANCELLED", "NO_SHOW"]);
const ACTIVE_STATUSES = new Set([
  "SCHEDULED",
  "IN_PROGRESS",
  "RESCHEDULED",
  "PENDING",
]);

export default function RecruiterInterviewPage() {
  const router = useRouter();
  const { data: recruiterProfile } = useGetCurrentRecruiterProfile();
  const { data: interviews = [], isLoading, error } = useInterviews();
  const [activeFilter, setActiveFilter] = useState<
    "scheduled" | "completed" | "all"
  >("scheduled");
  const [searchQuery, setSearchQuery] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [actionsPage, setActionsPage] = useState(1);
  const [closedPage, setClosedPage] = useState(1);

  const recruiterInterviews = useMemo(() => {
    if (!recruiterProfile?.id) return [];
    return interviews
      .filter((interview) => interview.interviewerId === recruiterProfile.id)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
  }, [interviews, recruiterProfile?.id]);

  const filteredInterviews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return recruiterInterviews.filter((interview) => {
      const isActive = ACTIVE_STATUSES.has(interview.status);
      const isClosed = CLOSED_STATUSES.has(interview.status);
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "scheduled" && isActive) ||
        (activeFilter === "completed" && isClosed);

      const haystack = [
        interview.application?.candidate?.user?.firstName,
        interview.application?.candidate?.user?.lastName,
        interview.application?.job?.title,
        interview.interviewType,
        interview.status,
        interview.interviewer?.firstName,
        interview.interviewer?.lastName,
        interview.interviewer?.user?.firstName,
        interview.interviewer?.user?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && haystack.includes(query);
    });
  }, [activeFilter, recruiterInterviews, searchQuery]);

  const sortedByNewest = useMemo(
    () =>
      [...recruiterInterviews].sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      ),
    [recruiterInterviews],
  );

  const recentActions = sortedByNewest;
  const recentCompleted = sortedByNewest.filter((interview) =>
    CLOSED_STATUSES.has(interview.status),
  );

  const tableTotalPages = Math.max(
    1,
    Math.ceil(filteredInterviews.length / TABLE_PAGE_SIZE),
  );
  const actionsTotalPages = Math.max(
    1,
    Math.ceil(recentActions.length / SIDEBAR_PAGE_SIZE),
  );
  const closedTotalPages = Math.max(
    1,
    Math.ceil(recentCompleted.length / SIDEBAR_PAGE_SIZE),
  );

  const paginatedTable = useMemo(
    () =>
      filteredInterviews.slice(
        (tablePage - 1) * TABLE_PAGE_SIZE,
        tablePage * TABLE_PAGE_SIZE,
      ),
    [filteredInterviews, tablePage],
  );

  const paginatedActions = useMemo(
    () =>
      recentActions.slice(
        (actionsPage - 1) * SIDEBAR_PAGE_SIZE,
        actionsPage * SIDEBAR_PAGE_SIZE,
      ),
    [actionsPage, recentActions],
  );

  const paginatedClosed = useMemo(
    () =>
      recentCompleted.slice(
        (closedPage - 1) * SIDEBAR_PAGE_SIZE,
        closedPage * SIDEBAR_PAGE_SIZE,
      ),
    [closedPage, recentCompleted],
  );

  useEffect(() => {
    setTablePage(1);
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    if (tablePage > tableTotalPages) setTablePage(tableTotalPages);
  }, [tablePage, tableTotalPages]);

  useEffect(() => {
    if (actionsPage > actionsTotalPages) setActionsPage(actionsTotalPages);
  }, [actionsPage, actionsTotalPages]);

  useEffect(() => {
    if (closedPage > closedTotalPages) setClosedPage(closedTotalPages);
  }, [closedPage, closedTotalPages]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const getCandidateName = (interview: any) =>
    `${interview.application?.candidate?.user?.firstName || "Candidate"} ${
      interview.application?.candidate?.user?.lastName || ""
    }`.trim();

  const getStatusPill = (status: string) => {
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-6">
        <div className="animate-pulse text-gray-600">Loading interviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-6">
        <div className="text-red-600">Failed to load interviews.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#fafafa] p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
            <p className="mt-1 text-sm text-gray-500">
              {recruiterInterviews.length} total interviews •{" "}
              {
                recruiterInterviews.filter((i) => i.status === "SCHEDULED")
                  .length
              }{" "}
              scheduled •{" "}
              {
                recruiterInterviews.filter((i) => i.status === "COMPLETED")
                  .length
              }{" "}
              completed
            </p>
          </div>

          <div className="w-full max-w-md">
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search interviews"
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-3 grid-rows-[200px_minmax(520px,1fr)_100px]">
          <div className="col-span-2 row-span-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex rounded-xl bg-gray-100 p-1">
                {[
                  { key: "scheduled", label: "Scheduled" },
                  { key: "completed", label: "Completed" },
                  { key: "all", label: "All" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() =>
                      setActiveFilter(item.key as typeof activeFilter)
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      activeFilter === item.key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                  <List className="h-4 w-4 text-gray-700" />
                </button>
                <button className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                  <LayoutGrid className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-left">
                <thead className="bg-white">
                  <tr className="text-sm text-gray-500">
                    <th className="px-6 py-4 font-medium">Candidate</th>
                    <th className="px-6 py-4 font-medium">Position</th>
                    <th className="px-6 py-4 font-medium">Interview</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredInterviews.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-16 text-center text-sm text-gray-500"
                      >
                        No interviews found for the current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedTable.map((interview) => (
                      <tr
                        key={interview.id}
                        className="cursor-pointer transition-colors hover:bg-gray-50"
                        onClick={() =>
                          router.push(
                            `/recruiter/interview/${interview.roomId}`,
                          )
                        }
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                              {getCandidateName(interview)
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {getCandidateName(interview)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {interview.interviewer?.firstName ||
                                  interview.interviewer?.user?.firstName ||
                                  "Recruiter"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            {interview.application?.job?.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(interview.scheduledAt)}
                            <span className="text-gray-400">•</span>
                            {formatTime(interview.scheduledAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusPill(interview.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredInterviews.length > 0 && (
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 p-4 text-sm">
                <button
                  type="button"
                  onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
                  disabled={tablePage === 1}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-gray-500">
                  Page {tablePage} of {tableTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setTablePage((prev) => Math.min(tableTotalPages, prev + 1))
                  }
                  disabled={tablePage === tableTotalPages}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="row-span-full flex flex-col gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex-1">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Actions
                </h2>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                {recentActions.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                    No recent interview activity.
                  </div>
                ) : (
                  paginatedActions.map((interview) => (
                    <button
                      key={interview.id}
                      onClick={() =>
                        router.push(`/recruiter/interview/${interview.roomId}`)
                      }
                      className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {interview.status === "SCHEDULED"
                            ? "Scheduled Interview"
                            : interview.status === "COMPLETED"
                              ? "Completed Interview"
                              : interview.status === "IN_PROGRESS"
                                ? "Interview In Progress"
                                : interview.status}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {getCandidateName(interview)} •{" "}
                          {formatDate(interview.scheduledAt)}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  ))
                )}
              </div>
              {recentActions.length > 0 && (
                <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setActionsPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={actionsPage === 1}
                    className="rounded border border-gray-200 px-2 py-1 text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-gray-500">
                    {actionsPage}/{actionsTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActionsPage((prev) =>
                        Math.min(actionsTotalPages, prev + 1),
                      )
                    }
                    disabled={actionsPage === actionsTotalPages}
                    className="rounded border border-gray-200 px-2 py-1 text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex-1">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recently Closed Interviews
                </h2>
                <Video className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                {recentCompleted.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                    No completed interviews yet.
                  </div>
                ) : (
                  paginatedClosed.map((interview) => (
                    <button
                      key={interview.id}
                      onClick={() =>
                        router.push(`/recruiter/interview/${interview.roomId}`)
                      }
                      className="flex w-full items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {interview.application?.job?.title}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {getCandidateName(interview)}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {recentCompleted.length > 0 && (
                <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setClosedPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={closedPage === 1}
                    className="rounded border border-gray-200 px-2 py-1 text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-gray-500">
                    {closedPage}/{closedTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setClosedPage((prev) =>
                        Math.min(closedTotalPages, prev + 1),
                      )
                    }
                    disabled={closedPage === closedTotalPages}
                    className="rounded border border-gray-200 px-2 py-1 text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
