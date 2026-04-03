"use client";

import { useParams } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Download,
  ArrowLeft,
} from "lucide-react";
import {
  useApplicationDetail,
  useUpdateApplicationStatus,
  useGetRecruiterJobs,
} from "@/src/hooks/useRecruiterApi";
import { useGetCandidateById } from "@/src/hooks/useCandidateApi";
import { useGetCurrentUser } from "@/src/hooks/useUserApi";

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params?.applicationId
    ? Number(params.applicationId)
    : null;

  const { data: application, isLoading } = useApplicationDetail(
    applicationId || 0,
  );
  const { data: jobsData } = useGetRecruiterJobs(1, 50);
  const updateStatus = useUpdateApplicationStatus();
  const candidateAccountQuery = useGetCurrentUser();
  const candidateProfileQuery = useGetCandidateById(application?.candidateId);

  const handleStatusUpdate = async (status: string) => {
    if (!application) return;
    try {
      await updateStatus.mutateAsync({
        applicationId: application.id,
        status: status as any,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // If no application ID in params, show message
  if (!applicationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-600 text-lg font-medium">
            No application selected
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-600 font-medium animate-pulse">
            Loading application details...
          </p>
        </div>
      </div>
    );
  }

  const candidateAccount = candidateAccountQuery.data;
  const candidateProfile = candidateProfileQuery.data;
  const jobs = jobsData?.data || [];
  const job = jobs.find((j: any) => j.id === application.jobId);

  return (
    <div
      className="h-screen bg-gray-50 overflow-y-auto font-sans relative"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="p-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => {
            if (typeof window !== "undefined") window.history.back();
          }}
          className="mb-6 p-2 hover:bg-gray-200 rounded-lg transition-colors inline-flex items-center gap-2"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">
            Back to Dashboard
          </span>
        </button>

        {/* Candidate Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative">
          {/* Status Banner */}
          {application.status && application.status !== "APPLIED" && (
            <div
              className={`w-full py-2 text-center text-sm font-medium text-white
              ${application.status === "ACCEPTED" ? "bg-[#26a69a]" : ""}
              ${application.status === "REJECTED" ? "bg-red-500" : ""}
              ${application.status === "SHORTLISTED" ? "bg-[#cddc39] text-gray-800" : ""}
              ${application.status === "INTERVIEWING" ? "bg-[#483d8b]" : ""}
            `}
            >
              Current Status: {application.status}
            </div>
          )}

          {/* Top Section */}
          <div className="p-8">
            {/* Name and Badge */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {candidateAccount?.firstName +
                    " " +
                    candidateAccount?.lastName || ""}
                </h2>
              </div>
              {application.matchScore && (
                <span className="bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                  {application.matchScore}% Compatible
                </span>
              )}
              {!application.matchScore && (
                <span className="bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                  No Compatibility Score
                </span>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-600 mb-6">
              {candidateProfile?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{candidateProfile?.email || ""}</span>
                </div>
              )}
              {candidateProfile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{candidateProfile?.phone || ""}</span>
                </div>
              )}
              {candidateProfile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{candidateProfile?.location || ""}</span>
                </div>
              )}
            </div>

            {/* Summary */}
            {candidateProfile?.summary && (
              <div className="mt-6 bg-gray-50 rounded-lg p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#483d8b]" /> Professional
                  Summary
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {candidateProfile?.summary || ""}
                </p>
              </div>
            )}

            {/* Experience and Applied */}
            <div className="flex items-center gap-12 mt-8">
              {candidateProfile?.yearsOfExperience !== undefined && (
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Experience
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {candidateProfile?.yearsOfExperience || ""} Years
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Applied On
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {new Date(application.appliedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Content Sections */}
          {candidateProfile?.skills > 0 &&
            candidateProfile?.workExperience > 0 && (
              <div className="p-8 space-y-10">
                {/* Skills */}
                {candidateProfile?.skills &&
                  candidateProfile?.skills.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {candidateProfile?.skills.map(
                          (skill: string, index: number) => (
                            <span
                              key={index}
                              className="bg-indigo-50 border border-[#483d8b]/20 text-[#483d8b] px-3.5 py-1.5 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ),
                        )}
                      </div>
                    </section>
                  )}

                {/* Work Experience */}
                {candidateProfile?.workExperience &&
                  candidateProfile?.workExperience.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-5">
                        Work Experience
                      </h3>
                      <div className="space-y-6">
                        {candidateProfile?.workExperience.map((exp: any) => {
                          const start = new Date(exp.startDate).getFullYear();
                          const end = exp.currentlyWorking
                            ? "Present"
                            : exp.endDate
                              ? new Date(exp.endDate).getFullYear()
                              : "";
                          return (
                            <div key={exp.id} className="relative pl-6">
                              <div className="absolute left-[3px] top-2 bottom-0 w-0.5 bg-gray-200" />
                              <div className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#483d8b] shadow-sm" />

                              <h4 className="text-base font-bold text-gray-900">
                                {exp.position}
                              </h4>
                              <p className="text-sm text-[#483d8b] font-semibold mt-0.5">
                                {exp.companyName}{" "}
                                <span className="text-gray-400 font-normal mx-1">
                                  •
                                </span>{" "}
                                <span className="text-gray-500 font-normal">
                                  {start} - {end}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                {candidateProfile?.education &&
                  candidateProfile?.education.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Education
                      </h3>
                      <div className="space-y-4">
                        {candidateProfile?.education.map((edu: any) => (
                          <div
                            key={edu.id}
                            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {edu.degree}
                              </h4>
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                Class of{" "}
                                {new Date(
                                  edu.endDate || edu.startDate,
                                ).getFullYear()}
                              </span>
                            </div>
                            <p className="text-sm text-[#483d8b] font-medium mb-2">
                              {edu.institution}
                            </p>
                            {edu.description && (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {edu.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
              </div>
            )}

          <div className="border-t border-gray-200 p-6 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
            <button
              onClick={() => console.warn("Download not implemented")}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm inline-flex items-center focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
              <Download className="mr-2 w-4 h-4" />
              Download Resume
            </button>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleStatusUpdate("INTERVIEWING")}
                className="px-5 py-2.5 border border-[#483d8b] text-[#483d8b] font-semibold rounded-lg hover:bg-indigo-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Interview
              </button>
              <button
                onClick={() => handleStatusUpdate("SHORTLISTED")}
                className="px-5 py-2.5 bg-[#d4e157] text-gray-800 font-semibold rounded-lg hover:bg-[#cddc39] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#d4e157]"
              >
                Shortlist
              </button>
              <button
                onClick={() => handleStatusUpdate("REJECTED")}
                className="px-5 py-2.5 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusUpdate("ACCEPTED")}
                className="px-5 py-2.5 bg-[#26a69a] text-white font-semibold rounded-lg hover:bg-teal-500 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
