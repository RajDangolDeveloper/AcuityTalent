"use client";

import {
  useGetCandidateApplicationInterviewRate,
  useGetCandidateApplicationResponseRate,
  useGetCandidateRecentApplication,
  useGetCandidateTotalApplication,
  useGetCandidateTotalOffers,
} from "@/src/hooks/useDashboardApi";
import {
  useCandidateRecommendedJobs,
  useCandidateSavedJobs,
} from "@/src/hooks/useCandidateApi";
import {
  ArrowDownLeft,
  Target,
  Briefcase,
  Clock3,
  Computer,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function CandidateDashboard() {
  const { data: recommendedJobs = [], isLoading: isRecommendedJobsLoading } =
    useCandidateRecommendedJobs(10);
  const { data: responseRateData } = useGetCandidateApplicationResponseRate();
  const { data: interviewRateData } = useGetCandidateApplicationInterviewRate();
  const { data: totalApplicationData } = useGetCandidateTotalApplication();
  const { data: totalOffersData } = useGetCandidateTotalOffers();
  const { data: recentApplications, isLoading: isRecentApplicationLoading } =
    useGetCandidateRecentApplication();
  const { data: savedJobsData, isLoading: isSavedJobsLoading } =
    useCandidateSavedJobs(1, 50);

  const responseRate = responseRateData ?? 0;
  const interviewRate = interviewRateData ?? 0;
  const totalApplications = totalApplicationData ?? 0;
  const totalOffers = totalOffersData ?? 0;

  const sortedRecentApplications = useMemo(
    () =>
      [...(recentApplications ?? [])].sort(
        (a: any, b: any) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
      ),
    [recentApplications],
  );

  const latestApplication = sortedRecentApplications[0];
  const savedJobsCount =
    savedJobsData?.pagination?.total ?? savedJobsData?.data?.length ?? 0;
  const loadingRecommendations = isRecommendedJobsLoading || isSavedJobsLoading;

  const formatDate = (dateValue: string) =>
    new Date(dateValue).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Recommended Jobs</h2>
              <p className="text-sm text-gray-500">
                Live roles matched from your saved and applied activity.
              </p>
            </div>
            <Link href="/candidate/jobs" className="text-sm font-bold">
              Browse all
            </Link>
          </div>

          {loadingRecommendations ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={`job-skeleton-${index}`}
                    className="rounded-lg border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="mb-4 h-14 w-14 rounded-md bg-gray-100" />
                    <div className="mb-3 h-4 w-2/3 rounded bg-gray-200" />
                    <div className="mb-2 h-3 w-1/2 rounded bg-gray-100" />
                    <div className="mb-4 h-3 w-3/4 rounded bg-gray-100" />
                    <div className="h-8 w-full rounded bg-gray-100" />
                  </div>
                ))}
            </div>
          ) : recommendedJobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <Sparkles className="mx-auto mb-3 text-gray-400" size={28} />
              <p className="font-semibold text-gray-800">
                No new recommendations
              </p>
              <p className="mt-1 text-sm text-gray-500">
                You have already saved or applied to the jobs currently visible.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {recommendedJobs.map((job) => (
                <Link
                  key={job.id}
                  href="/candidate/jobs"
                  className="group rounded-lg border border-gray-200 p-4 transition hover:border-indigo-300 hover:shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-gray-700">
                      {job.companyName?.slice(0, 2).toUpperCase() || "JB"}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <Target className="h-3.5 w-3.5" />
                      {Math.round(job.matchScore ?? 0)}% match
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-indigo-900 group-hover:text-indigo-700">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {job.companyName}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="rounded-full border border-gray-200 px-2 py-1">
                      {job.employmentType.replace(/_/g, " ")}
                    </span>
                    {job.salaryRange && (
                      <span className="rounded-full border border-gray-200 px-2 py-1">
                        {job.salaryRange}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      Posted {formatDate(job.createdAt)}
                    </span>
                    <span>{job.viewsCount} views</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="text-primary-500 text-3xl mb-2">
              <ArrowDownLeft size={50} />
            </div>
            <div>
              <div className="text-3xl font-bold">{responseRate}%</div>
              <div className="text-xs text-gray-500">Response Rate</div>
            </div>
          </div>
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="text-primary-500 text-3xl mb-2">
              <Briefcase size={50} />
            </div>
            <div>
              <div className="text-3xl font-bold">{interviewRate}%</div>
              <div className="text-xs text-gray-500">Interview Rate</div>
            </div>
          </div>
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="text-primary-500 text-3xl mb-2">
              <Computer size={50} />
            </div>
            <div>
              {/* Replaced hardcoded 137 with dynamic data */}
              <div className="text-3xl font-bold">{totalApplications}</div>
              <div className="text-xs text-gray-500">Total Applications</div>
            </div>
          </div>
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="text-primary-500 text-3xl mb-2">
              <Mail size={50} />
            </div>
            <div>
              <div className="text-3xl font-bold">{totalOffers}</div>
              <div className="text-xs text-gray-500">Offers</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Jobs Applications</h2>
            <Link href="/candidate/applications" className="text-sm font-bold">
              See All
            </Link>
          </div>

          <table className="w-full text-left">
            {recentApplications && recentApplications?.length > 0 && (
              <thead>
                <tr className="text-gray-600 border-b border-gray-200">
                  <th className="pb-4 font-semibold">Job Title</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Location Type</th>
                  <th className="pb-4 font-semibold">Location</th>
                </tr>
              </thead>
            )}
            <tbody className="text-sm">
              {isRecentApplicationLoading &&
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="border-b border-gray-50 last:border-0 animate-pulse"
                    >
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="py-4">
                        <div className="h-4 bg-gray-100 rounded w-20"></div>
                      </td>
                      <td className="py-4">
                        <div className="h-4 bg-gray-100 rounded w-16"></div>
                      </td>
                      <td className="py-4">
                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                      </td>
                    </tr>
                  ))}
              {recentApplications &&
                recentApplications.map((app: any) => (
                  <tr
                    key={app.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {app.job.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 leading-tight">
                          {app.job.title}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          app.status === "REVIEWED"
                            ? "bg-amber-50 text-amber-600"
                            : app.status === "APPLIED"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {app.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-600 capitalize">
                      {app.job.locationType.toLowerCase()}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700">
                          {app.job.location}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              {(!recentApplications && !isRecentApplicationLoading) ||
                (recentApplications?.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center font-semibold text-xl py-40"
                    >
                      No Applications Found
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Activity</h2>
            <span className="text-xs text-gray-500">
              Saved jobs: {savedJobsCount}
            </span>
          </div>

          {latestApplication ? (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Latest application
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">
                    {latestApplication.job?.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {latestApplication.job?.companyName}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    latestApplication.status === "REVIEWED"
                      ? "bg-amber-50 text-amber-600"
                      : latestApplication.status === "APPLIED"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {latestApplication.status.toLowerCase()}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Applied {formatDate(latestApplication.appliedAt)}</span>
                <Link
                  href="/candidate/applications"
                  className="font-semibold text-indigo-600"
                >
                  View all
                </Link>
              </div>
            </div>
          ) : isRecentApplicationLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-24 rounded bg-gray-100" />
              <div className="h-6 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-100" />
              <div className="h-10 w-full rounded bg-gray-100" />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="font-semibold text-gray-800">No recent activity</p>
              <p className="mt-1 text-sm text-gray-500">
                Apply to jobs or save roles to see updates here.
              </p>
              <Link
                href="/candidate/jobs"
                className="mt-4 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Explore jobs
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
