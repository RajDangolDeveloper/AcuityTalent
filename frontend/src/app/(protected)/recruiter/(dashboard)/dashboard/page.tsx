"use client";

import Link from "next/link";
import { Briefcase, Users, Calendar, TrendingUp, Plus } from "lucide-react";
import { useGetRecruiterJobs } from "@/src/hooks/useRecruiterApi";

export default function RecruiterDashboard() {
  const { data: jobsData, isLoading } = useGetRecruiterJobs(1, 10);
  const jobs = jobsData?.data || [];

  const stats = [
    {
      label: "Active Jobs",
      value: jobs.length,
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Applicants",
      value: jobs.reduce((sum, job) => sum + (job.applicationCount ?? 0), 0),
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "This Month",
      value: "12",
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Growth",
      value: "24%",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back
              </h1>
              <p className="text-gray-600">
                Here's what happening with your jobs today.
              </p>
            </div>
            <Link
              href="/recruiter/jobs/create"
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-semibold"
            >
              <Plus size={20} />
              Create Job
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon ?? "";
              return (
                <div
                  key={stat.label ?? ""}
                  className="bg-white rounded-lg border border-gray-200 p-6"
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

          {/* Recent Jobs */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Recent Jobs</h2>
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No jobs found. Create your first job to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {jobs.slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    href={`/recruiter/jobs?jobId=${job.id}`}
                    className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.applicationCount} applicants
                      </p>
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
