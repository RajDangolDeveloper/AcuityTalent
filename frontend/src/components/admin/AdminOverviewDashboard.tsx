"use client";

import Link from "next/link";
import { useAdminOverview } from "@/src/hooks/useAdminApi";
import {
  ADMIN_FEATURES,
  ADMIN_STATIC_NAV,
} from "@/src/components/admin/adminFeatureConfig";

export default function AdminOverviewDashboard() {
  const { data, isLoading, isError } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-red-600 font-semibold">
        Could not load admin dashboard overview.
      </div>
    );
  }

  const cards = [
    { label: "Users", value: data.users },
    { label: "Candidates", value: data.candidates },
    { label: "Recruiters", value: data.recruiters },
    { label: "Companies", value: data.companies },
    { label: "Jobs", value: data.jobs },
    { label: "Applications", value: data.applications },
    { label: "Interviews", value: data.interviews },
    { label: "Resumes", value: data.resumes },
    { label: "Saved Jobs", value: data.savedJobs },
    { label: "Candidate Embeddings", value: data.candidateEmbeddings },
    { label: "Job Embeddings", value: data.jobEmbeddings },
  ];

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Complete platform visibility by feature.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
          >
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {ADMIN_FEATURES.map((feature) => (
            <Link
              key={feature.key}
              href={feature.href}
              className="border border-slate-200 rounded-lg p-4 hover:border-slate-400 transition-colors"
            >
              <div className="font-semibold text-slate-900">
                {feature.label}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {feature.description}
              </div>
            </Link>
          ))}

          {ADMIN_STATIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-slate-200 rounded-lg p-4 hover:border-slate-400 transition-colors"
            >
              <div className="font-semibold text-slate-900">{item.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
