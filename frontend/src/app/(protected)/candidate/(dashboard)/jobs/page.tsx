"use client";

import { useState, useMemo } from "react";
import { Search, Briefcase, Bookmark, MoveUpRight } from "lucide-react";
import {
  getAllJobs,
  useJobDetails,
  useCandidateApplications,
  useCandidateSavedJobs,
  useCreateApplication,
  useSaveJob,
  useRemoveSavedJob,
  useCandidateResumes,
} from "@/src/hooks/useCandidateApi";
import { Job, EmploymentType, ExperienceLevel } from "@/src/types/candidate";
import Notification from "@/src/element/Notification";
import Markdown from "react-markdown";

export default function CandidateJobsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    location: "",
    employmentType: "" as EmploymentType | "",
    experienceLevel: "" as ExperienceLevel | "",
    remoteOnly: false,
  });

  // Queries
  const { data: jobsData, isLoading: jobsLoading } = getAllJobs(page, limit, {
    ...filters,
    search: searchTerm,
  });

  const { data: savedJobsData } = useCandidateSavedJobs(1, 50);
  const { data: applicationsData } = useCandidateApplications(1, 50);
  const { data: selectedJob, isLoading: selectedJobLoading } =
    useJobDetails(selectedJobId);
  const { data: resumes = [] } = useCandidateResumes();

  const createApplicationMutation = useCreateApplication();
  const saveJobMutation = useSaveJob();
  const removeSavedJobMutation = useRemoveSavedJob();

  const jobs = jobsData?.data || [];
  const savedJobIds = useMemo(
    () => new Set((savedJobsData?.data || []).map((sj) => sj.jobId)),
    [savedJobsData?.data],
  );
  const appliedJobIds = useMemo(
    () => new Set((applicationsData?.data || []).map((app) => app.jobId)),
    [applicationsData?.data],
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  const handleApply = async () => {
    if (!selectedResumeId) {
      Notification({
        toastMessage: "Please select a resume",
        toastStatus: "error",
      });
      return;
    }

    try {
      await createApplicationMutation.mutateAsync({
        jobId: selectedJobId!,
        resumeId: selectedResumeId,
        coverLetter,
      });

      // Also save the job automatically
      if (!savedJobIds.has(selectedJobId!)) {
        await saveJobMutation.mutateAsync(selectedJobId!);
      }

      Notification({
        toastMessage: "Application submitted successfully!",
        toastStatus: "success",
      });

      // Reset form
      setSelectedResumeId(null);
      setCoverLetter("");
      setShowApplyForm(false);
    } catch (error) {
      Notification({
        toastMessage:
          error instanceof Error ? error.message : "Failed to apply",
        toastStatus: "error",
      });
    }
  };

  const handleSaveToggle = async () => {
    if (!selectedJobId) return;

    try {
      if (savedJobIds.has(selectedJobId)) {
        await removeSavedJobMutation.mutateAsync(selectedJobId);
        Notification({
          toastMessage: "Job removed from saved",
          toastStatus: "success",
        });
      } else {
        await saveJobMutation.mutateAsync(selectedJobId);
        Notification({
          toastMessage: "Job saved successfully!",
          toastStatus: "success",
        });
      }
    } catch (error) {
      Notification({
        toastMessage:
          error instanceof Error ? error.message : "Failed to save job",
        toastStatus: "error",
      });
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 flex-1 items-center">
            <select
              value={filters.experienceLevel}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  experienceLevel: e.target.value as ExperienceLevel | "",
                })
              }
              className="px-3 py-2 border form-select appearance-none pr-8 pl-4 bg-no-repeat border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
              font-medium
            >
              <option value="">Experience</option>
              <option value="ENTRY">Entry Level</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior</option>
              <option value="EXECUTIVE">Executive</option>
            </select>

            {/* Remote Filter */}
            <select
              value={filters.remoteOnly ? "remote" : ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  remoteOnly: e.target.value === "remote",
                })
              }
              className="px-3 py-2 border form-select appearance-none pr-8 pl-4 bg-no-repeat border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
              font-medium
            >
              <option value="">Remote</option>
              <option value="remote">Remote Only</option>
            </select>

            <select
              value={filters.employmentType}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  employmentType: e.target.value as EmploymentType | "",
                })
              }
              className="px-3 py-2 border form-select appearance-none pr-8 pl-4 bg-no-repeat border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
              font-medium
            >
              <option value="">Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="FREELANCE">Freelance</option>
            </select>

            {/* Categories Filter */}
            <select
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
              className="px-3 py-2 border form-select appearance-none pr-8 pl-4 bg-no-repeat border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium "
            >
              <option value="">Categories</option>
              <option value="San Francisco, CA">San Francisco, CA</option>
              <option value="New York, NY">New York, NY</option>
              <option value="Los Angeles, CA">Los Angeles, CA</option>
              <option value="Chicago, IL">Chicago, IL</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Right: Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 w-80">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search for jobs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
              />
              <Search
                className="absolute right-3 top-2.5 text-gray-700"
                size={18}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Job List (Group 74 Style) */}
        <div className="w-full md:w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
          {jobsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No jobs found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setShowApplyForm(false);
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedJobId === job.id
                      ? "bg-blue-50"
                      : "border-l-transparent"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Company Logo Placeholder */}
                    <div className="w-14 h-14 bg-gray-300 rounded shrink-0"></div>
                    <div className="flex flex-col items-start justify-center min-w-0">
                      <h3 className="font-semibold text-primary-500 truncate">
                        {job.title}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        {job.companyName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {job.location}
                        {job.remoteAvailable && (
                          <span className="ml-2 text-primary-600">
                            • Remote
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Job Details (Group 46 Style) */}
        <div className="hidden md:flex md:w-2/3 flex-col bg-white">
          {selectedJobId && selectedJob ? (
            <>
              {/* Top Section with Company and Title */}
              <div className="border-b border-gray-200 px-8 py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {/* Company Logo and Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 bg-gray-300 rounded"></div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Company
                        </p>
                        <p className="text-gray-600">
                          {selectedJob.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Job Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      {selectedJob.title}
                    </h1>

                    {/* Employment Badges */}
                    <div className="flex gap-2 mb-4">
                      {selectedJob.employmentType && (
                        <span className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 font-medium">
                          {selectedJob.employmentType.replace(/_/g, "-")}
                        </span>
                      )}
                      {selectedJob.experienceLevel && (
                        <span className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 font-medium">
                          {selectedJob.experienceLevel}
                        </span>
                      )}
                      {selectedJob.salaryRange && (
                        <span className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 font-medium">
                          {selectedJob.salaryRange}
                        </span>
                      )}
                      {selectedJob.location && (
                        <span className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 font-medium">
                          {selectedJob.location}
                        </span>
                      )}
                    </div>

                    {/* Apply and Save Buttons */}
                    <div className="flex gap-2">
                      {appliedJobIds.has(selectedJobId) ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-green-100 text-green-700 rounded font-semibold cursor-not-allowed"
                        >
                          ✓ Applied
                        </button>
                      ) : (
                        !showApplyForm && (
                          <button
                            onClick={() => setShowApplyForm(true)}
                            className="px-4 py-2 bg-primary-500 text-white rounded font-semibold hover:bg-primary-600 transition flex justify-center items-center gap-2"
                          >
                            Apply <MoveUpRight className="h-5 w-5" />
                          </button>
                        )
                      )}
                      <button
                        onClick={handleSaveToggle}
                        className={`px-4 py-2 rounded font-semibold transition ${
                          savedJobIds.has(selectedJobId)
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <Bookmark size={18} className="inline" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                {/* About the Job */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-black mb-4">
                    About the job
                  </h2>
                  <Markdown>{selectedJob.description}</Markdown>
                </div>

                {/* Key Responsibilities */}
                {selectedJob.requirements && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Qualifications & Soft Skills
                    </h2>
                    <Markdown>{selectedJob.requirements}</Markdown>
                  </div>
                )}
              </div>

              {/* Apply Form at Bottom */}
              {showApplyForm && !appliedJobIds.has(selectedJobId) && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Apply for this position
                  </h3>

                  {/* Resume Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Resume <span className="text-red-500">*</span>
                    </label>
                    {resumes.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-700 text-sm">
                        No resumes found. Please upload a resume first.
                      </div>
                    ) : (
                      <select
                        value={selectedResumeId || ""}
                        onChange={(e) =>
                          setSelectedResumeId(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                      >
                        <option value="">Choose a resume...</option>
                        {resumes.map((resume) => (
                          <option key={resume.id} value={resume.id}>
                            {resume.fileName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Cover Letter */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell us why you're interested in this role..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                      rows={3}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleApply}
                      disabled={
                        !selectedResumeId || createApplicationMutation.isPending
                      }
                      className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-bold py-2 rounded transition"
                    >
                      {createApplicationMutation.isPending
                        ? "Submitting..."
                        : "Apply"}
                    </button>
                    <button
                      onClick={() => setShowApplyForm(false)}
                      className="px-6 bg-white border border-gray-300 text-gray-900 font-bold rounded hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 font-medium">
                  Select a job to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
