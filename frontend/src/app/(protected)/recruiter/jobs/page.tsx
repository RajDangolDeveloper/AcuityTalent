"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import CandidateCard from "@/src/components/recruiter/CandidateCard";
import JobCard from "@/src/components/recruiter/JobCard";
import {
  useRecruiterJobs,
  useJobApplications,
} from "@/src/hooks/useRecruiterApi";

export default function JobsPage() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [showGridModal, setShowGridModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(
    null,
  );
  const [page, setPage] = useState(1);

  const { data: jobsData, isLoading: jobsLoading } = useRecruiterJobs(1, 50);
  const { data: candidatesData, isLoading: candidatesLoading } =
    useJobApplications(selectedJobId || 0, page);

  const jobs = jobsData?.data || [];
  const candidates = candidatesData?.data || [];
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const handleSelectCandidateFromModal = (candidateId: number) => {
    setSelectedCandidateId(candidateId);
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
        {/* Jobs List Panel */}
        <div className="w-96 border-r border-gray-300 flex flex-col">
          <div className="p-6 border-b border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {jobs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No jobs found</p>
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSelected={selectedJobId === job.id}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setPage(1);
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Candidates Panel */}
        {selectedJob ? (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-300 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedJob.title}
              </h2>
              <p className="text-gray-600 mt-1">
                Status:{" "}
                <span className="font-semibold capitalize">
                  {selectedJob.status}
                </span>
              </p>
              {selectedJob.salaryMin && selectedJob.salaryMax && (
                <p className="text-gray-600 mt-1">
                  Salary: ${selectedJob.salaryMin}k - ${selectedJob.salaryMax}k
                </p>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {/* View Toggle */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex gap-2">
                <button
                  onClick={() => setShowGridModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  List View
                </button>
                <button
                  onClick={() => setShowGridModal(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-300 text-gray-900 hover:bg-gray-400"
                >
                  Grid View
                </button>
              </div>

              {/* Content */}
              {candidatesLoading ? (
                <div className="flex-1 w-full flex items-center justify-center">
                  <p className="text-gray-500">Loading candidates...</p>
                </div>
              ) : candidates.length === 0 ? (
                <div className="flex-1 w-full flex items-center justify-center">
                  <p className="text-gray-500">No applications yet</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {!showGridModal ? (
                    // List View
                    candidates.map((candidate) => (
                      <Link
                        key={candidate.id}
                        href={`/recruiter/candidates/${candidate.candidateId}`}
                      >
                        <div className="hover:bg-gray-50 transition-colors">
                          <CandidateCard
                            candidate={candidate}
                            job={selectedJob}
                          />
                        </div>
                      </Link>
                    ))
                  ) : (
                    // Grid View
                    <div className="p-4 grid grid-cols-2 gap-4">
                      {candidates.map((candidate) => (
                        <Link
                          key={candidate.id}
                          href={`/recruiter/candidates/${candidate.candidateId}`}
                        >
                          <div className="hover:shadow-lg transition-shadow">
                            <CandidateCard
                              candidate={candidate}
                              job={selectedJob}
                              showModal={true}
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full flex items-center justify-center">
            <p className="text-gray-400 text-lg">
              Select a job to view candidates
            </p>
          </div>
        )}
      </div>
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
