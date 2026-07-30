"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Briefcase,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Phone,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetApplicationById } from "@/src/hooks/useApplicationApi";
import apiClient from "@/src/app/api/api-client";
import { downloadResume } from "@/src/library/downloadResume";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.applicationId
    ? parseInt(params.applicationId as string)
    : 0;

  const {
    data: application,
    isLoading,
    error,
  } = useGetApplicationById(applicationId);
  const queryClient = useQueryClient();

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDownload = async (resumeId: number, fileName?: string) => {
    if (!resumeId) {
      setActionError("No resume available to download");
      return;
    }
    try {
      setDownloadingId(resumeId);
      await downloadResume(resumeId, fileName);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to download resume",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleStatusUpdate = async (action: string) => {
    if (!applicationId || applicationId === 0) {
      setActionError("Invalid application ID");
      console.error("Invalid application ID:", applicationId);
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      const endpoints: Record<string, string> = {
        INTERVIEW: `/applications/${applicationId}/interview`,
        OFFERED: `/applications/${applicationId}/offer`,
        REJECTED: `/applications/${applicationId}/reject`,
        SHORTLIST: `/applications/${applicationId}/shortlist`,
      };

      const endpoint = endpoints[action];
      if (!endpoint) throw new Error("Invalid action");

      await apiClient.patch(endpoint);
      await queryClient.invalidateQueries({
        queryKey: ["application", applicationId],
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update application";
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!params?.applicationId || isNaN(applicationId)) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="text-center">
            <p className="text-gray-500">Invalid application ID</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">
              {error instanceof Error
                ? error.message
                : "Failed to load application"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="text-center">
            <p className="text-gray-500">Application not found</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800";
      case "REVIEWED":
        return "bg-yellow-100 text-yellow-800";
      case "INTERVIEW":
        return "bg-purple-100 text-purple-800";
      case "OFFERED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return "text-gray-500";
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4 items-center-safe">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Applications
          </button>
          <div className="flex gap-1 items-center mb-6">
            <div className="font-light text-md text-gray-400">POSITION : </div>
            <div className="text-md font-semibold bg-gray-200 px-2 py-1 rounded-md">
              {application.jobTitle}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {application.candidateName}
                </h1>
                <p className="text-gray-600"></p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(
                  application.status,
                )}`}
              >
                {application.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href={`mailto:${application.candidateEmail}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {application.candidateEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <div className="">{application.candidatePhone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="text-gray-900 font-medium">
                    {application.companyName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Applied</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {(application.matchScore !== undefined ||
              application.riskScore !== undefined) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
                {application.matchScore !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Match Score</p>
                    <p
                      className={`text-2xl font-bold ${getScoreColor(
                        application.matchScore,
                      )}`}
                    >
                      {application.matchScore}%
                    </p>
                  </div>
                )}
                {application.riskScore !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Risk Score</p>
                    <p
                      className={`text-2xl font-bold ${getScoreColor(
                        100 - (application.riskScore || 0),
                      )}`}
                    >
                      {application.riskScore}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {application.coverLetter && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cover Letter
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-700">
                  {application.coverLetter}
                </div>
              </div>
            )}

            {application.resumeFileName && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resume
                </h3>
                <button
                  onClick={() =>
                    handleDownload(
                      application.resumeId,
                      application.resumeFileName,
                    )
                  }
                  disabled={
                    actionLoading || downloadingId === application.resumeId
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <Download size={18} />
                  Download Resume
                </button>
              </div>
            )}

            {actionError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{actionError}</p>
              </div>
            )}

            <div className="mb-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleStatusUpdate("INTERVIEW")}
                  disabled={
                    actionLoading || application.status === "INTERVIEWING"
                  }
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <Clock size={18} />
                  <span className="text-sm font-medium">Interview</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate("OFFERED")}
                  disabled={
                    actionLoading || application.status === "OFFER_EXTENDED"
                  }
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">Accept</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate("REJECTED")}
                  disabled={actionLoading || application.status === "REJECTED"}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <XCircle size={18} />
                  <span className="text-sm font-medium">Reject</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate("SHORTLIST")}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <Star size={18} />
                  <span className="text-sm font-medium">Shortlist</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <p className="text-sm text-gray-500">
                Last updated:{" "}
                {new Date(application.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
