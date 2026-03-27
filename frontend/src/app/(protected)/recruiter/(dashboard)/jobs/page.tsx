"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import CandidateCard from "@/src/components/recruiter/CandidateCard";
import JobCard from "@/src/components/recruiter/JobCard";
import {
  useDeleteJob,
  useGetRecruiterJobs,
  useJobApplications,
  useUpdateJobStatus,
} from "@/src/hooks/useRecruiterApi";
import {
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  DollarSign,
  GraduationCap,
  MapPin,
} from "lucide-react";
import Markdown from "react-markdown";

export default function JobsPage() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [showGridModal, setShowGridModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const statusOrder = ["ACTIVE", "DRAFT", "CLOSED", "ARCHIVED"];

  const { data: jobsData, isLoading: jobsLoading } = useGetRecruiterJobs(1, 50);

  const { data: candidatesData, isLoading: candidatesLoading } =
    useJobApplications(selectedJobId || 0, page);

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
    DRAFT: true,
    CLOSED: true,
  }));

  const toggleStatus = (status: string) => {
    setExpandedStatuses((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const handleSelectCandidateFromModal = (candidateId: number) => {
    setSelectedCandidateId(candidateId);
  };

  const { mutate: deleteJob, isPending } = useDeleteJob();
  const { mutate: updateJobStatus } = useUpdateJobStatus();

  const handleJobStatusUpdate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedJobId) {
      updateJobStatus({ id: selectedJobId, status: e.target.value });
    }
  };

  const handleJobDelete = () => {
    if (selectedJobId) {
      deleteJob(selectedJobId);
    }
  };

  if (selectedCandidateId) {
    return <CandidateDetailRedirect candidateId={selectedCandidateId} />;
  }

  if (jobsLoading) {
    return (
      <div className="flex h-screen bg-white">
        <div className="flex-1 w-full flex items-center justify-center">
          <p className="text-gray-500">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex">
        <div className="w-96 border-r border-gray-300 flex flex-col">
          <div className="p-6 border-b border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
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
                      className={`flex items-center justify-between px-6 py-3 border-b border-gray-300 cursor-pointer hover: text-gray-200 ${statusStyles[status]}`}
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

        {selectedJob ? (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-end gap-8 w-full py-12 h-48 px-16 bg-white border border-gray-200 shadow-sm rounded-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-[#4B4B7C]">
                    {selectedJob.title}
                  </h2>
                  <span
                    className={`text-white text-xs px-3 py-1 rounded-md font-medium ${statusStyles[selectedJob.status]}`}
                  >
                    {selectedJob.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 border border-black rounded-lg px-5 py-3 w-fit">
                  {selectedJob.location && (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedJob.location}</span>
                    </div>
                  )}
                  {selectedJob.employmentType && (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Briefcase className="h-4 w-4" />
                      <span>{selectedJob.employmentType}</span>
                    </div>
                  )}
                  {selectedJob.salaryRange && (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <DollarSign className="h-4 w-4" />
                      <span>{selectedJob.salaryRange}</span>
                    </div>
                  )}
                  {selectedJob.experienceLevel && (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <GraduationCap className="h-4 w-4" />
                      <span>{selectedJob.experienceLevel}</span>
                    </div>
                  )}
                  {selectedJob.applicationDeadline && (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(
                          selectedJob.applicationDeadline,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  className="rounded-md border text-center"
                  defaultValue={selectedJob.status}
                  name="jobStatus"
                  onChange={handleJobStatusUpdate}
                >
                  {statusOrder.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    handleJobDelete();
                  }}
                  className="border border-red-500 text-red-500 font-bold h-16 px-8 py-4 rounded-xl hover:bg-red-50 transition-colors text-lg"
                >
                  Delete Job
                </button>
              </div>
            </div>
            <div className="max-w-7xl px-12 py-8 overflow-clip">
              <div className="pb-12">
                <div className="text-2xl font-semibold">Description</div>
                <Markdown>{selectedJob.description}</Markdown>
              </div>
              <div className="pb-12">
                <div className="text-2xl font-semibold">Requirements</div>
                <Markdown>{selectedJob.requirements}</Markdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full flex items-center justify-center">
            <p className="text-gray-400 text-lg">Select a job to details</p>
          </div>
        )}
      </div>
      <Link href="/recruiter/jobs/create">
        <button className="absolute bottom-2 right-2 p-4 rounded-md bg-primary-500 text-gray-100 font-semibold">
          Create Job
        </button>
      </Link>
    </div>
  );
}

function CandidateDetailRedirect({ candidateId }: { candidateId: number }) {
  const router = useRouter();

  React.useEffect(() => {
    router.push(`/recruiter/candidates/${candidateId}`);
  }, [candidateId, router]);

  return null;
}
