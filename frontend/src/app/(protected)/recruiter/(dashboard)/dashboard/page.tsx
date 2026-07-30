"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  File,
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Plus,
  FileSearch,
  Handshake,
  XCircle,
} from "lucide-react";
import { useGetRecruiterJobs } from "@/src/hooks/useRecruiterApi";
import { useGetLatestUserActivity } from "@/src/hooks/useActivityApi";
import { ViewDependentTime } from "@/src/utils";

export default function RecruiterDashboard() {
  const { data: jobsData, isLoading: isJobsLoading } = useGetRecruiterJobs(
    1,
    50,
  );
  const { data: activityData, isLoading: isActivityLoading } =
    useGetLatestUserActivity();
  const jobs = jobsData?.data || [];

  const sortedJobs = useMemo(
    () =>
      [...jobs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [jobs],
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);

  const jobsPostedThisMonth = useMemo(
    () =>
      sortedJobs.filter((job) => {
        const createdAt = new Date(job.createdAt);
        return (
          createdAt.getFullYear() === currentYear &&
          createdAt.getMonth() === currentMonth
        );
      }).length,
    [currentMonth, currentYear, sortedJobs],
  );

  const jobsPostedLastMonth = useMemo(
    () =>
      sortedJobs.filter((job) => {
        const createdAt = new Date(job.createdAt);
        return (
          createdAt.getFullYear() === previousMonthDate.getFullYear() &&
          createdAt.getMonth() === previousMonthDate.getMonth()
        );
      }).length,
    [previousMonthDate.getMonth(), previousMonthDate.getFullYear(), sortedJobs],
  );

  const totalApplicants = useMemo(
    () => jobs.reduce((sum, job) => sum + (job.applicationCount ?? 0), 0),
    [jobs],
  );

  const activeJobsCount = useMemo(
    () => jobs.filter((job) => job.status === "ACTIVE").length,
    [jobs],
  );

  const postingGrowthLabel =
    jobsPostedLastMonth === 0
      ? jobsPostedThisMonth > 0
        ? "New"
        : "0%"
      : `${jobsPostedThisMonth >= jobsPostedLastMonth ? "+" : ""}${Math.round(
          ((jobsPostedThisMonth - jobsPostedLastMonth) / jobsPostedLastMonth) *
            100,
        )}%`;

  const stats = [
    {
      label: "Active Jobs",
      value: activeJobsCount,
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Applicants",
      value: totalApplicants,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Jobs This Month",
      value: jobsPostedThisMonth,
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Posting Growth",
      value: postingGrowthLabel,
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const ACTIVITY_CONFIG: Record<
    string,
    {
      bg: string;
      icon?: React.ComponentType<{ className?: string; size?: number }>;
    }
  > = {
    APPLICATION_APPLIED: {
      bg: "bg-blue-500",
    },
    APPLICATION_REVIEWED: {
      bg: "bg-amber-500",
      icon: FileSearch,
    },
    APPLICATION_REJECTED: {
      bg: "bg-rose-500",
      icon: XCircle,
    },
    INTERVIEW: {
      bg: "bg-indigo-500",
      icon: Calendar,
    },
    OFFER: {
      bg: "bg-emerald-500",
      icon: Handshake,
    },
  };

  return (
    <div className="flex min-h-dvh bg-primary-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 w-full gap-4 mb-2">
            <div className="max-w-5xl rounded-sm">
              <div className="grid grid-cols-2 gap-6 mb-8">
                {stats.map((stat) => {
                  const Icon = stat.icon ?? "";
                  return (
                    <div
                      key={stat.label ?? ""}
                      className="bg-gray-50 rounded-lg border border-gray-300 p-6"
                    >
                      <div
                        className={`${stat.color ?? ""} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                      >
                        <Icon size={24} />
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value ?? ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="border border-gray-300 bg-gray-50 rounded-md h-93 w-full px-6 py-5">
                <div className="font-semibold text-2xl">Activity</div>
                {isActivityLoading && (
                  <div className="py-3">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div className="bg-gray-200 h-10 animate-pulse w-full my-4 rounded-sm"></div>
                    ))}
                  </div>
                )}
                {!isActivityLoading && activityData && (
                  <div className="mt-2">
                    {activityData?.map((activity) => {
                      const config = ACTIVITY_CONFIG[activity.actionType] || {
                        bg: "bg-gray-500",
                        icon: File,
                      };
                      const Icon = config.icon ?? File;
                      return (
                        <div
                          key={activity.id}
                          className="h-15 py-3 w-full rounded-sm flex justify-between items-center"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <div
                                className={`rounded-full ${config.bg} h-10 w-10 flex items-center justify-center`}
                              >
                                <Icon className="text-white" size={20} />
                              </div>
                            </div>
                            <div className="text-lg font-medium">
                              {activity.activityTitle}
                            </div>
                          </div>
                          <div className="font-light rounded-sm p-1 text-end ">
                            {ViewDependentTime(activity.createdAt)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-gray-50 rounded-lg border border-gray-300 h-[470px]">
            <div className="p-6 border-b border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900">Recent Jobs</h2>
            </div>

            {isJobsLoading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No jobs found. Create your first job to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sortedJobs.slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    href={`/recruiter/jobs?jobId=${job.id}`}
                    className="px-8 py-6 hover:bg-gray-50 transition-colors flex justify-between items-center "
                  >
                    <div className="h-6 w-md">
                      <h3 className="font-semibold text-gray-900">
                        {job.title}
                      </h3>
                    </div>
                    <div className="h-6 w-md">
                      <p className="text-sm text-gray-600 mt-1">
                        {job.applicationCount} applicants
                      </p>
                    </div>
                    <div className="h-6 w-md">
                      <span>{job.location}</span>
                    </div>
                    <div className="h-6 w-md">
                      <span>{job.salaryRange}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {job.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
