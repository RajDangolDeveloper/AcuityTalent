"use client";

import { useEffect } from "react";
import { useGetCandidateApplications } from "@/src/hooks/useCandidateApi";
import { ApplicationStatus, CandidateApplication } from "@/src/types/candidate";

import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Star,
  TrendingUp,
  XCircle,
} from "lucide-react";

type Column = {
  id: string;
  label: string;
  statuses: ApplicationStatus[];
  color: string;
  dotColor: string;
  icon: React.ReactNode;
};

const COLUMNS: Column[] = [
  {
    id: "applied",
    label: "Applied",
    statuses: ["APPLIED"],
    color: "bg-indigo-500",
    dotColor: "bg-indigo-400",
    icon: <FileText size={15} />,
  },
  {
    id: "reviewing",
    label: "Under Review",
    statuses: ["REVIEWED"],
    color: "bg-blue-500",
    dotColor: "bg-blue-400",
    icon: <Clock size={15} />,
  },
  {
    id: "shortlisted",
    label: "Shortlisted",
    statuses: ["SHORTLISTED"],
    color: "bg-violet-500",
    dotColor: "bg-violet-400",
    icon: <Star size={15} />,
  },
  {
    id: "interviewing",
    label: "Interviews",
    statuses: ["INTERVIEWING"],
    color: "bg-amber-500",
    dotColor: "bg-amber-400",
    icon: <TrendingUp size={15} />,
  },
  {
    id: "offers",
    label: "Offers",
    statuses: ["OFFER_EXTENDED", "ACCEPTED"],
    color: "bg-emerald-500",
    dotColor: "bg-emerald-400",
    icon: <CheckCircle2 size={15} />,
  },
  {
    id: "rejected",
    label: "Rejected",
    statuses: ["REJECTED", "WITHDRAWN"],
    color: "bg-red-500",
    dotColor: "bg-red-400",
    icon: <XCircle size={15} />,
  },
];

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  APPLIED: "bg-indigo-100 text-indigo-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-violet-100 text-violet-700",
  INTERVIEWING: "bg-amber-100 text-amber-700",
  OFFER_EXTENDED: "bg-emerald-100 text-emerald-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-600",
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  REVIEWED: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing",
  OFFER_EXTENDED: "Offer Extended",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

function ApplicationCard({ app }: { app: CandidateApplication }) {
  const appliedDate = new Date(app.appliedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-gray-500" />
          </div>
          <p className="text-xs font-semibold text-gray-500 truncate">
            {app.companyName}
          </p>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_STYLES[app.status]}`}
        >
          {STATUS_LABEL[app.status]}
        </span>
      </div>

      <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
        {app.jobTitle}
      </h3>

      {app.resumeFileName && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Briefcase size={11} />
          <span className="truncate max-w-[160px]">{app.resumeFileName}</span>
        </div>
      )}

      {app.matchScore !== undefined && app.matchScore !== null && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-medium">
              Match Score
            </span>
            <span className="text-[10px] font-bold text-gray-700">
              {Math.round(app.matchScore)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                app.matchScore >= 70
                  ? "bg-emerald-400"
                  : app.matchScore >= 40
                    ? "bg-amber-400"
                    : "bg-red-400"
              }`}
              style={{ width: `${Math.min(app.matchScore, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 text-[10px] text-gray-400 pt-1 border-t border-gray-100">
        <Calendar size={10} />
        <span>Applied {appliedDate}</span>
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  apps,
}: {
  column: Column;
  apps: CandidateApplication[];
}) {
  return (
    <div className="flex flex-col gap-3 min-w-[260px] max-w-[260px]">
      {}
      <div
        className={`${column.color} rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm`}
      >
        <div className="flex items-center gap-2 text-white">
          {column.icon}
          <span className="text-sm font-semibold">{column.label}</span>
        </div>
        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {apps.length}
        </span>
      </div>

      {}
      <div className="flex flex-col gap-3">
        {apps.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 min-h-[100px]">
            <div
              className={`w-2 h-2 rounded-full ${column.dotColor} opacity-50`}
            />
            <p className="text-xs text-gray-400 text-center">
              No applications here yet
            </p>
          </div>
        ) : (
          apps.map((app) => <ApplicationCard key={app.id} app={app} />)
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  useEffect(() => {
    document.title = "Applications - AcuityTalent";
  }, []);

  const {
    data: applications,
    isLoading,
    isError,
  } = useGetCandidateApplications();

  const getColumnApps = (column: Column) =>
    (applications ?? []).filter((a) =>
      (column.statuses as string[]).includes(a.status),
    );

  const total = applications?.length ?? 0;
  const activeCount = (applications ?? []).filter(
    (a) => !["REJECTED", "WITHDRAWN"].includes(a.status),
  ).length;

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50/60">
      {}
      <div className="px-8 py-5 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track the progress of your job applications
          </p>
        </div>
        {!isLoading && !isError && (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {activeCount}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {total - activeCount}
              </p>
              <p className="text-xs text-gray-500">Closed</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="px-8 py-6 flex gap-4 h-full items-start">
          {isLoading && (
            <div className="flex-1 flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading applications…</p>
              </div>
            </div>
          )}
          {isError && (
            <div className="flex-1 flex items-center justify-center h-64">
              <p className="text-sm text-red-500">
                Failed to load applications. Please try again.
              </p>
            </div>
          )}
          {!isLoading &&
            !isError &&
            COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                apps={getColumnApps(col)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
