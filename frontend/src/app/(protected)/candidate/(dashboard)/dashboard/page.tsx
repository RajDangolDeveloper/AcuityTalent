"use client";

import {
  useGetCandidateApplicationInterviewRate,
  useGetCandidateApplicationResponseRate,
  useGetCandidateRecentApplication,
  useGetCandidateTotalApplication,
  useGetCandidateTotalOffers,
} from "@/src/hooks/useDashboardApi";
import { ArrowDownLeft, Briefcase, Computer, Mail } from "lucide-react";
import Link from "next/link";

export default function CandidateDashboard() {
  const { data: responseRateData } = useGetCandidateApplicationResponseRate();
  const { data: interviewRateData } = useGetCandidateApplicationInterviewRate();
  const { data: totalApplicationData } = useGetCandidateTotalApplication();
  const { data: totalOffersData } = useGetCandidateTotalOffers();
  const { data: recentApplications, isLoading: isRecentApplicationLoading } =
    useGetCandidateRecentApplication();

  const responseRate = responseRateData?.data ?? 0;
  const interviewRate = interviewRateData?.data ?? 0;
  const totalApplications = totalApplicationData?.data ?? 0;
  const totalOffers = totalOffersData?.data ?? 0;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Recommended Jobs</h2>

          <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-md"></div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-indigo-900">
                    IT Support
                  </h3>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
                    70%
                  </span>
                </div>
                <p className="text-sm text-gray-500">TechCorp Solutions</p>
                <p className="text-xs text-gray-400 mb-2">📍 Kathmandu</p>
                <div className="flex gap-2">
                  <span className="text-[10px] border border-gray-300 px-2 py-0.5 rounded text-gray-500">
                    Full-Time
                  </span>
                  <span className="text-[10px] border border-gray-300 px-2 py-0.5 rounded text-gray-500">
                    $15,000 - 20,000 USD/Year
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              Posted 4 days ago
            </span>
          </div>
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
          <h2 className="text-xl font-bold mb-6">Activity</h2>
          <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <span className="text-xs font-semibold">
                Junior Frontend Developer
              </span>
            </div>
            <span className="text-[10px] border border-indigo-400 text-indigo-600 px-2 py-0.5 rounded">
              2:30
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
