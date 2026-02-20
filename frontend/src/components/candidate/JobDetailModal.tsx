"use client";

import { useState } from "react";
import {
  X,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Bookmark,
  Send,
} from "lucide-react";
import {
  useCreateApplication,
  useSaveJob,
  useRemoveSavedJob,
  useCandidateResumes,
} from "@/src/hooks/useCandidateApi";
import { JobDetails } from "@/src/types/candidate";
import Notification from "@/src/element/Notification";

interface JobDetailModalProps {
  job: JobDetails;
  isOpen: boolean;
  onClose: () => void;
  isApplied: boolean;
  isSaved: boolean;
}

export default function JobDetailModal({
  job,
  isOpen,
  onClose,
  isApplied,
  isSaved,
}: JobDetailModalProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Mutations
  const createApplicationMutation = useCreateApplication();
  const saveJobMutation = useSaveJob();
  const removeSavedJobMutation = useRemoveSavedJob();

  // Queries
  const { data: resumes = [] } = useCandidateResumes();

  if (!isOpen) return null;

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
        jobId: job.id,
        resumeId: selectedResumeId,
        coverLetter,
      });

      // Also save the job automatically
      if (!isSaved) {
        await saveJobMutation.mutateAsync(job.id);
      }

      Notification({
        toastMessage: "Application submitted successfully!",
        toastStatus: "success",
      });

      // Reset form and close modal
      setSelectedResumeId(null);
      setCoverLetter("");
      setShowApplyForm(false);
      onClose();
    } catch (error) {
      Notification({
        toastMessage:
          error instanceof Error ? error.message : "Failed to apply",
        toastStatus: "error",
      });
    }
  };

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await removeSavedJobMutation.mutateAsync(job.id);
        Notification({
          toastMessage: "Job removed from saved",
          toastStatus: "success",
        });
      } else {
        await saveJobMutation.mutateAsync(job.id);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {job.title}
            </h2>
            <p className="text-lg text-gray-600">{job.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <MapPin size={18} />
                <span className="text-sm font-medium">Location</span>
              </div>
              <p className="text-gray-900 font-semibold">{job.location}</p>
              {job.remoteAvailable && (
                <p className="text-xs text-blue-600 mt-1">Remote available</p>
              )}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Briefcase size={18} />
                <span className="text-sm font-medium">Type</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {job.employmentType.replace(/_/g, " ")}
              </p>
            </div>

            {job.salaryRange && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                  <DollarSign size={18} />
                  <span className="text-sm font-medium">Salary</span>
                </div>
                <p className="text-gray-900 font-semibold">{job.salaryRange}</p>
              </div>
            )}

            {job.experienceLevel && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Clock size={18} />
                  <span className="text-sm font-medium">Level</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {job.experienceLevel}
                </p>
              </div>
            )}
          </div>

          {/* About the Job */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              About the Job
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Requirements
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </div>
          )}

          {/* Job Posted Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-600">
            <p>
              Posted on{" "}
              {job.postedDate
                ? new Date(job.postedDate).toLocaleDateString()
                : "Unknown"}
            </p>
            <p>{job.applicationCount} candidates have applied</p>
            {job.applicationDeadline && (
              <p>
                Application deadline:{" "}
                {new Date(job.applicationDeadline).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Apply Section */}
          {!isApplied ? (
            !showApplyForm ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Send size={20} />
                  Apply Now
                </button>
                <button
                  onClick={handleSaveToggle}
                  className={`px-4 py-3 rounded-lg font-bold transition ${
                    isSaved
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Bookmark size={20} />
                </button>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Apply for this position
                </h3>

                {/* Resume Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Resume <span className="text-red-500">*</span>
                  </label>
                  {resumes.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                      <p className="text-sm">
                        No resumes found. Please upload a resume first.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={selectedResumeId || ""}
                      onChange={(e) =>
                        setSelectedResumeId(
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us why you're interested in this role..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={5}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleApply}
                    disabled={
                      !selectedResumeId || createApplicationMutation.isPending
                    }
                    className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    {createApplicationMutation.isPending
                      ? "Submitting..."
                      : "Submit Application"}
                  </button>
                  <button
                    onClick={() => setShowApplyForm(false)}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-green-700 font-semibold">
                  ✓ You have already applied for this job
                </p>
              </div>
              <button
                onClick={handleSaveToggle}
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  isSaved
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Bookmark size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
