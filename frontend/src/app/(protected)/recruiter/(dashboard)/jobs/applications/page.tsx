"use client";

import { useState } from "react";
import Link from "next/link";
import CandidateCard from "@/src/components/recruiter/CandidateCard";
import JobCard from "@/src/components/recruiter/JobCard";
import {
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  useGetRecruiterJobs,
  useJobApplications,
} from "@/src/hooks/useRecruiterApi";
import { SearchBar } from "@/src/components/SearchBar";

export default function JobsPage() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(0);
  const [showGridModal, setShowGridModal] = useState(false);
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState("all");
  const [compatibilityFilter, setCompatibilityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const statusOrder = ["ACTIVE", "DRAFT", "CLOSED", "ARCHIVED"];

  const { data: jobsData, isLoading: jobsLoading } = useGetRecruiterJobs(1, 50);
  const { data: candidatesData, isLoading: candidatesLoading } =
    useJobApplications(selectedJobId || 0, page);

  const jobs = jobsData?.data || [];
  const candidates = candidatesData?.data || [];

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const getRiskCategory = (
    matchScore?: number,
    riskScore?: number,
  ): "uncategorised" | "potential" | "balanced" | "highrisk" => {
    if (matchScore == null || riskScore == null) return "uncategorised";
    if (matchScore >= 75 && riskScore <= 33) return "potential";
    if (matchScore >= 55 && riskScore <= 66) return "balanced";
    return "highrisk";
  };

  const getCompatibilityCategory = (
    matchScore?: number,
  ): "uncategorised" | "low" | "medium" | "high" | "perfect" => {
    if (matchScore == null) return "uncategorised";
    if (matchScore >= 90) return "perfect";
    if (matchScore >= 70) return "high";
    if (matchScore >= 40) return "medium";
    return "low";
  };

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

  const getCandidateCategory = (
    matchScore?: number,
    riskScore?: number,
  ): string => {
    const riskCategory = getRiskCategory(matchScore, riskScore);

    if (riskCategory === "potential") return "High Potential";
    if (riskCategory === "balanced") return "Balanced";
    if (riskCategory === "highrisk") return "High Risk";
    return "Uncategorized";
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const riskCategory = getRiskCategory(
      candidate.matchScore,
      candidate.riskScore,
    );
    const compatibilityCategory = getCompatibilityCategory(
      candidate.matchScore,
    );
    const query = searchQuery.trim().toLowerCase();

    const matchesRisk = riskFilter === "all" || riskFilter === riskCategory;
    const matchesCompatibility =
      compatibilityFilter === "all" ||
      compatibilityFilter === compatibilityCategory;
    const matchesSearch =
      query.length === 0 ||
      [candidate.candidateName, candidate.candidateEmail, candidate.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

    return matchesRisk && matchesCompatibility && matchesSearch;
  });

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

        {selectedJob ? (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-300 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedJob.title}
                  </h2>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                      <MapPin size={16} />
                      {String(selectedJob.location)
                        .toLowerCase()
                        .includes("remote")
                        ? "Remote"
                        : "On-site"}
                    </span>

                    {selectedJob.employmentType && (
                      <span className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                        <Briefcase size={16} />
                        {selectedJob.employmentType === "FULL_TIME"
                          ? "Full-time"
                          : selectedJob.employmentType}
                      </span>
                    )}

                    {selectedJob.salaryRange !== undefined && (
                      <span className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium">
                        ${selectedJob.salaryRange}
                      </span>
                    )}

                    <span className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
                      3-5 Years
                    </span>

                    {selectedJob.createdAt && (
                      <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                        <Calendar size={16} />
                        {new Date(selectedJob.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <a
                    className="mb-4 self-center px-2 py-1 border-2 rounded-sm text-gray-200 bg-gray-800 border-gray-600"
                    href={`/recruiter/jobs/edit/${selectedJob.id}`}
                  >
                    Edit Job
                  </a>
                  <span className="text-sm text-gray-600">
                    {selectedJob.applicationCount} applicants
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
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
                  className="flex-1 gap-4 overflow-y-auto bg-gray-100"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <div className="filter px-4 pt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="category flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <select
                        name="risk"
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="all">All risk levels</option>
                        <option value="uncategorised">Uncategorised</option>
                        <option value="potential">High Potential</option>
                        <option value="balanced">Balanced</option>
                        <option value="highrisk">High Risk</option>
                      </select>
                      <select
                        name="compatibility"
                        value={compatibilityFilter}
                        onChange={(e) => setCompatibilityFilter(e.target.value)}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="all">All compatibility levels</option>
                        <option value="low">Low Compatibility</option>
                        <option value="medium">Medium Compatibility</option>
                        <option value="high">High Compatibility</option>
                        <option value="perfect">Perfect Compatibility</option>
                      </select>
                    </div>
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      className="lg:max-w-sm"
                    />
                  </div>
                  {!showGridModal ? (
                    <div className="flex flex-col px-4 py-4 gap-4 overflow-y-auto">
                      {filteredCandidates.map((candidate) => (
                        <Link
                          key={candidate.id}
                          href={`/recruiter/jobs/applications/${candidate.id}`}
                        >
                          <div className="bg-white border border-gray-300 rounded-lg p-5 flex items-start gap-6 hover:shadow-md transition-colors relative">
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-light shrink-0">
                              {(candidate.candidateName || "").charAt(0) || "A"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">
                                  {candidate.candidateName}
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {candidate.matchScore !== undefined && (
                                    <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
                                      {Math.round(candidate.matchScore)}%
                                      Compatible
                                    </span>
                                  )}
                                  {candidate.riskScore !== undefined && (
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        candidate.riskScore >= 67
                                          ? "bg-red-100 text-red-800"
                                          : candidate.riskScore >= 34
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-emerald-100 text-emerald-800"
                                      }`}
                                    >
                                      {Math.round(candidate.riskScore)}% Risk
                                    </span>
                                  )}
                                  {
                                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                                      {getCandidateCategory(
                                        candidate.matchScore,
                                        candidate.riskScore,
                                      )}
                                    </span>
                                  }
                                </div>
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

                              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                                {candidate.candidateSkills.map(
                                  (skill, index) => (
                                    <div
                                      key={index}
                                      className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-md"
                                    >
                                      {skill}
                                    </div>
                                  ),
                                )}
                              </div>

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

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
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
                    <div className="p-4 grid grid-cols-2 gap-4">
                      {filteredCandidates.map((candidate) => (
                        <Link
                          key={candidate.id}
                          href={`/recruiter/jobs/applications/${candidate.id}`}
                        >
                          <div className="hover:shadow-lg transition-shadow">
                            <CandidateCard
                              candidate={candidate}
                              job={selectedJob}
                              showModal={true}
                              showPremiumAnalytics={true}
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
