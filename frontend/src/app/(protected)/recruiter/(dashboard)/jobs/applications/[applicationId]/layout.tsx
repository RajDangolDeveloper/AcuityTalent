"use client";

import { useEffect, useState } from "react";
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useGetRecruiterJobs } from "@/src/hooks/useRecruiterApi";
import JobCard from "@/src/components/recruiter/JobCard";

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.title = "Applications - AcuityTalent";
  }, []);

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const statusOrder = ["ACTIVE", "DRAFT", "CLOSED", "ARCHIVED"];

  const { data: jobsData, isLoading: jobsLoading } = useGetRecruiterJobs(1, 50);

  const jobs = jobsData?.data || [];

  const groupedJobs = jobs.reduce(
    (acc, job) => {
      const status = job.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(job);
      return acc;
    },
    {} as Record<string, typeof jobs>,
  );

  const statusLabels: Record<string, string> = {
    ACTIVE: "Active Jobs",
    DRAFT: "Draft Jobs",
    CLOSED: "Closed Jobs",
    ARCHIVED: "Archived Jobs",
  };

  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-cyan-600 hover:bg-cyan-500",
    DRAFT: "bg-gray-600 hover:bg-gray-500",
    CLOSED: "bg-red-600 hover:bg-red-500",
    ARCHIVED: "bg-yellow-600 hover:bg-yellow-500",
  };

  const [expandedStatuses, setExpandedStatuses] = useState<
    Record<string, boolean>
  >(() => ({
    ACTIVE: true,
  }));

  const toggleStatus = (status: string) => {
    setExpandedStatuses((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  if (jobsLoading) {
    return (
      <div className="flex min-h-dvh bg-white">
        <div className="flex-1 w-full flex items-center justify-center">
          <p className="text-gray-500">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-white">
      <div className="flex-1 flex">
        <div className="w-96 border-r border-gray-300 flex flex-col">
          <div className="p-6 border-b border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {jobs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No jobs found</div>
            ) : (
              statusOrder.map((status) => {
                const statusJobs = groupedJobs[status];
                if (!statusJobs || statusJobs.length === 0) return null;

                const isExpanded = expandedStatuses[status] || false;
                const label = statusLabels[status] || status;

                return (
                  <div key={status} className="mb-4 rounded">
                    <div
                      className={`flex items-center justify-between px-6 py-3 cursor-pointer text-gray-200 ${
                        statusStyles[status]
                      }`}
                      onClick={() => toggleStatus(status)}
                    >
                      <span className="font-medium">
                        {label} ({statusJobs.length})
                      </span>
                      <span className="text-xl">
                        {isExpanded ? <ChevronRight /> : <ChevronDown />}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="p-2 space-y-2">
                        {statusJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            isSelected={selectedJobId === job.id}
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setPage(1);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
