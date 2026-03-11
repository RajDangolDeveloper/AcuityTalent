"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import CandidateCard from "@/src/components/recruiter/CandidateCard";
import JobCard from "@/src/components/recruiter/JobCard";
import { Mail, MapPin, Briefcase, Calendar, X } from "lucide-react";
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedJob.title}
                </h2>
                <span className="text-sm text-gray-600">
                  {selectedJob.applicationCount} applicants
                </span>
              </div>

              {/* Job Details Tags */}
              <div className="flex flex-wrap gap-3 mt-3">
                {/* jobType: show Remote or On-site */}
                <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                  <MapPin size={16} />
                  {String(selectedJob.location).toLowerCase().includes("remote")
                    ? "Remote"
                    : "On-site"}
                </span>

                {/* employmentType */}
                {selectedJob.employmentType && (
                  <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                    <Briefcase size={16} />
                    {selectedJob.employmentType === "FULL_TIME"
                      ? "Full-time"
                      : selectedJob.employmentType}
                  </span>
                )}

                {/* salaryRange */}
                {selectedJob.salaryMin !== undefined &&
                  selectedJob.salaryMax !== undefined && (
                    <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                      ${selectedJob.salaryMin}k - ${selectedJob.salaryMax}k
                    </span>
                  )}

                {/* experience level placeholder */}
                <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                  3-5 Years
                </span>

                {/* postedDate */}
                {selectedJob.createdAt && (
                  <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                    <Calendar size={16} />
                    {new Date(selectedJob.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
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
                <div
                  className="flex-1 gap-4 overflow-y-auto"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {!showGridModal ? (
                    // List View as wide horizontal cards
                    <div className="flex flex-col px-4 py-4 gap-4 overflow-y-auto">
                      {candidates.map((candidate) => (
                        <Link
                          key={candidate.id}
                          href={`/recruiter/jobs/applications/${candidate.id}`}
                        >
                          <div className="bg-white border border-gray-300 rounded-lg p-5 flex items-start gap-6 hover:shadow-md transition-colors relative">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-light shrink-0">
                              {(candidate.candidateName || "").charAt(0) || "A"}
                            </div>

                            {/* Main content */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">
                                  {candidate.candidateName}
                                </h3>
                                {candidate.matchScore !== undefined && (
                                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
                                    {Math.round(candidate.matchScore)}%
                                    Compatible
                                  </span>
                                )}
                              </div>

                              <div className="text-sm text-gray-600 mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span>{candidate.candidateEmail}</span>
                                </div>
                                {candidate.phone && (
                                  <div className="flex items-center gap-2">
                                    <span className="mx-2">|</span>
                                    <span>{candidate.phone}</span>
                                  </div>
                                )}
                              </div>

                              {candidate.location && (
                                <div className="text-sm text-gray-600 mt-2">
                                  {candidate.location}
                                </div>
                              )}

                              <div className="mt-4 flex items-center gap-8 text-sm text-gray-900 font-medium">
                                <div>
                                  Experience :{" "}
                                  <span className="font-bold">
                                    {candidate.yearsOfExperience} Years
                                  </span>
                                </div>
                                <div>
                                  Applied :{" "}
                                  <span className="font-bold">
                                    {new Date(
                                      candidate.appliedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right preview box */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(`Remove candidate ${candidate.id}`);
                              }}
                              className="p-1.5 bg-white rounded-lg  transition-colors"
                              aria-label="Remove candidate"
                            >
                              <X className="w-5 h-5 text-black" />
                            </button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    // Grid View
                    <div className="p-4 grid grid-cols-2 gap-4">
                      {candidates.map((candidate) => (
                        <Link
                          key={candidate.id}
                          href={`/recruiter/jobs/applications/${candidate.id}`}
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
    router.push(`/recruiter/jobs/applications/${candidateId}`);
  }, [candidateId, router]);

  return null;
}
