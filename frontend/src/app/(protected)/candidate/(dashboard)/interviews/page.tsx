"use client";

import InterviewDetailModal from "@/src/components/interview/InterviewDetailModel";
import { useUpcomingInterviews } from "@/src/hooks/useInterviewApi";
import { Interview } from "@/src/types/interview";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutGrid, List, ChevronRight, Clock } from "lucide-react";

const TABLE_PAGE_SIZE = 8;
const SIDEBAR_PAGE_SIZE = 3;
const CLOSED_STATUSES = new Set(["COMPLETED", "CANCELLED", "NO_SHOW"]);
const UPCOMING_STATUSES = new Set([
  "SCHEDULED",
  "IN_PROGRESS",
  "RESCHEDULED",
  "PENDING",
]);

export default function InterviewsPage() {
  const [filter, setFilter] = useState<"upcoming" | "completed" | "all">(
    "upcoming",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );
  const router = useRouter();

  const {
    data: interviews = [],
    isLoading,
    error,
  } = useUpcomingInterviews(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const sortedInterviews = useMemo(
    () =>
      [...interviews].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    [interviews],
  );

  const filteredInterviews = useMemo(() => {
    const now = Date.now();
    const query = searchQuery.trim().toLowerCase();

    return sortedInterviews.filter((interview) => {
      const scheduledTs = new Date(interview.scheduledAt).getTime();
      const isClosed = CLOSED_STATUSES.has(interview.status);
      const isUpcoming =
        UPCOMING_STATUSES.has(interview.status) &&
        (interview.status === "IN_PROGRESS" || scheduledTs >= now);

      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && isClosed) ||
        (filter === "upcoming" && isUpcoming);

      const interviewerName =
        `${interview.interviewer?.firstName || interview.interviewer?.user?.firstName || ""} ${
          interview.interviewer?.lastName ||
          interview.interviewer?.user?.lastName ||
          ""
        }`.trim();

      const haystack = [
        interview.application?.job?.title,
        interview.application?.candidate?.user?.firstName,
        interview.application?.candidate?.user?.lastName,
        interviewerName,
        interview.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && haystack.includes(query);
    });
  }, [filter, searchQuery, sortedInterviews]);

  const upcomingInterviews = useMemo(
    () =>
      sortedInterviews.filter((interview) => {
        const scheduledTs = new Date(interview.scheduledAt).getTime();
        return (
          UPCOMING_STATUSES.has(interview.status) &&
          (interview.status === "IN_PROGRESS" || scheduledTs >= Date.now())
        );
      }),
    [sortedInterviews],
  );

  const recentInterviews = useMemo(
    () =>
      [...sortedInterviews]
        .filter((interview) => {
          const scheduledTs = new Date(interview.scheduledAt).getTime();
          return (
            CLOSED_STATUSES.has(interview.status) || scheduledTs < Date.now()
          );
        })
        .reverse(),
    [sortedInterviews],
  );

  const tableTotalPages = Math.max(
    1,
    Math.ceil(filteredInterviews.length / TABLE_PAGE_SIZE),
  );
  const upcomingTotalPages = Math.max(
    1,
    Math.ceil(upcomingInterviews.length / SIDEBAR_PAGE_SIZE),
  );
  const recentTotalPages = Math.max(
    1,
    Math.ceil(recentInterviews.length / SIDEBAR_PAGE_SIZE),
  );

  const paginatedTable = useMemo(
    () =>
      filteredInterviews.slice(
        (tablePage - 1) * TABLE_PAGE_SIZE,
        tablePage * TABLE_PAGE_SIZE,
      ),
    [filteredInterviews, tablePage],
  );

  const paginatedUpcoming = useMemo(
    () =>
      upcomingInterviews.slice(
        (upcomingPage - 1) * SIDEBAR_PAGE_SIZE,
        upcomingPage * SIDEBAR_PAGE_SIZE,
      ),
    [upcomingInterviews, upcomingPage],
  );

  const paginatedRecent = useMemo(
    () =>
      recentInterviews.slice(
        (recentPage - 1) * SIDEBAR_PAGE_SIZE,
        recentPage * SIDEBAR_PAGE_SIZE,
      ),
    [recentInterviews, recentPage],
  );

  useEffect(() => {
    setTablePage(1);
  }, [filter, searchQuery]);

  useEffect(() => {
    if (tablePage > tableTotalPages) setTablePage(tableTotalPages);
  }, [tablePage, tableTotalPages]);

  useEffect(() => {
    if (upcomingPage > upcomingTotalPages) setUpcomingPage(upcomingTotalPages);
  }, [upcomingPage, upcomingTotalPages]);

  useEffect(() => {
    if (recentPage > recentTotalPages) setRecentPage(recentTotalPages);
  }, [recentPage, recentTotalPages]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const getCandidateName = (interview: Interview) =>
    `${interview.application?.candidate?.user?.firstName || "Candidate"} ${
      interview.application?.candidate?.user?.lastName || ""
    }`.trim();

  const getInterviewerName = (interview: Interview) =>
    `${interview.interviewer?.firstName || interview.interviewer?.user?.firstName || "Recruiter"} ${
      interview.interviewer?.lastName ||
      interview.interviewer?.user?.lastName ||
      ""
    }`.trim();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
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
    <div className="min-h-screen w-full bg-[#f5f5f5] p-4 sm:p-6 lg:p-8">
      <div className="w-full h-full ">
        <div className="min-h-[800px] grid gap-4 lg:grid-cols-3">
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex rounded-lg bg-gray-100 p-1">
                {[
                  { key: "upcoming", label: "Upcoming" },
                  { key: "completed", label: "Completed" },
                  { key: "all", label: "All" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key as typeof filter)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      filter === item.key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                  <List className="h-4 w-4" />
                </button>
                <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                Job Applications
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-left ">
                  <thead className="bg-white">
                    <tr className="text-sm text-gray-500">
                      <th className="px-5 py-3.5 font-medium">Company</th>
                      <th className="px-5 py-3.5 font-medium">Position</th>
                      <th className="px-5 py-3.5 font-medium">Recruiter</th>
                      <th className="px-5 py-3.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredInterviews.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-16 text-center text-sm text-gray-500"
                        >
                          No interviews found.
                        </td>
                      </tr>
                    ) : (
                      paginatedTable.map((interview) => (
                        <tr
                          key={interview.id}
                          className="cursor-pointer transition-colors hover:bg-gray-50"
                          onClick={() => setSelectedInterview(interview)}
                        >
                          <td className="px-5 py-4 text-sm text-gray-700">
                            AcuityTalent
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-gray-900">
                            {interview.application?.job?.title ||
                              "Untitled Position"}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-700">
                            {getInterviewerName(interview)}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              {interview.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {filteredInterviews.length > 0 && (
                <div className="mt-4 flex items-center justify-end gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setTablePage((prev) => Math.max(1, prev - 1))
                    }
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
                      setTablePage((prev) =>
                        Math.min(tableTotalPages, prev + 1),
                      )
                    }
                    disabled={tablePage === tableTotalPages}
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </section>

          <aside className="flex min-h-[680px] flex-col gap-4 lg:col-span-1">
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </label>

            <div className="grid min-h-0 flex-1 grid-rows-2 gap-4">
              <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Upcoming Interviews
                </h3>
                <div className="space-y-3 overflow-y-auto pr-1">
                  {upcomingInterviews.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                      No upcoming interviews
                    </div>
                  ) : (
                    paginatedUpcoming.map((interview) => (
                      <button
                        key={interview.id}
                        onClick={() => setSelectedInterview(interview)}
                        className="flex w-full items-center gap-3 rounded-lg bg-gray-50 p-3 text-left transition hover:bg-gray-100"
                      >
                        <div className="h-12 w-12 shrink-0 rounded-full border border-gray-300 bg-white text-center text-[10px] font-semibold leading-tight text-gray-700 flex flex-col items-center justify-center">
                          <span>
                            {new Date(interview.scheduledAt)
                              .toLocaleDateString("en-US", { month: "short" })
                              .toUpperCase()}
                          </span>
                          <span className="text-lg leading-none">
                            {new Date(interview.scheduledAt).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {interview.application?.job?.title}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            {formatTime(interview.scheduledAt)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      </button>
                    ))
                  )}
                </div>
                {upcomingInterviews.length > 0 && (
                  <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setUpcomingPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={upcomingPage === 1}
                      className="rounded border border-gray-200 px-2 py-1 text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-gray-500">
                      {upcomingPage}/{upcomingTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setUpcomingPage((prev) =>
                          Math.min(upcomingTotalPages, prev + 1),
                        )
                      }
                      disabled={upcomingPage === upcomingTotalPages}
                      className="rounded border border-gray-200 px-2 py-1 text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Recent Interviews
                </h3>
                <div className="space-y-3 overflow-y-auto pr-1">
                  {recentInterviews.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                      No recent interviews
                    </div>
                  ) : (
                    paginatedRecent.map((interview) => (
                      <button
                        key={interview.id}
                        onClick={() => setSelectedInterview(interview)}
                        className="flex w-full items-center gap-3 rounded-lg bg-gray-50 p-3 text-left transition hover:bg-gray-100"
                      >
                        <div className="h-12 w-12 shrink-0 rounded-full border border-gray-300 bg-white text-center text-[10px] font-semibold leading-tight text-gray-700 flex flex-col items-center justify-center">
                          <span>
                            {new Date(interview.scheduledAt)
                              .toLocaleDateString("en-US", { month: "short" })
                              .toUpperCase()}
                          </span>
                          <span className="text-lg leading-none">
                            {new Date(interview.scheduledAt).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {interview.application?.job?.title}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            {formatTime(interview.scheduledAt)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                {recentInterviews.length > 0 && (
                  <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setRecentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={recentPage === 1}
                      className="rounded border border-gray-200 px-2 py-1 text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-gray-500">
                      {recentPage}/{recentTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRecentPage((prev) =>
                          Math.min(recentTotalPages, prev + 1),
                        )
                      }
                      disabled={recentPage === recentTotalPages}
                      className="rounded border border-gray-200 px-2 py-1 text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <InterviewDetailModal
        interview={selectedInterview}
        isOpen={!!selectedInterview}
        onClose={() => setSelectedInterview(null)}
        onJoin={(roomId) => router.push(`/candidate/interviews/${roomId}`)}
      />
    </div>
  );
}
