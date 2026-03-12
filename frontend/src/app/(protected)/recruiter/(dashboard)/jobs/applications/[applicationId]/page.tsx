"use client";

import { useParams } from "next/navigation";
import React from "react";
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
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">No application selected</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  const candidate = application.candidate;
  const jobs = jobsData?.data || [];
  const job = jobs.find((j: any) => j.id === application.jobId);

  return (
    <div
      className="h-screen bg-gray-50 overflow-y-auto"
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
        </button>

        {/* Candidate Card */}
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm relative">
          {/* Top Section */}
          <div className="p-8">
            {/* Name and Badge */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {candidate.name}
                </h2>
              </div>
              {application.matchScore && (
                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {application.matchScore}% Compatible
                </span>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{candidate.location}</span>
                </div>
              )}
            </div>

            {/* Summary */}
            {candidate.summary && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {candidate.summary}
                </p>
              </div>
            )}

            {/* Experience and Applied */}
            <div className="flex items-center gap-8 mt-6 pt-4 border-t border-gray-200">
              {candidate.yearsOfExperience !== undefined && (
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Experience
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {candidate.yearsOfExperience} Years
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600 text-sm font-medium">Applied</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(application.appliedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Content Sections */}
          <div className="p-8 space-y-8">
            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#483d8b] text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Work Experience */}
            {candidate.workExperience &&
              candidate.workExperience.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Work Experience
                  </h3>
                  <div className="space-y-6">
                    {candidate.workExperience.map((exp) => {
                      const start = new Date(exp.startDate).getFullYear();
                      const end = exp.currentlyWorking
                        ? "Present"
                        : exp.endDate
                          ? new Date(exp.endDate).getFullYear()
                          : "";
                      return (
                        <div key={exp.id} className="relative pl-6">
                          <div className="absolute -left-3 top-1.5 w-3 h-3 rounded-full bg-[#483d8b]" />
                          <h4 className="text-base font-bold text-gray-900">
                            {exp.position}
                          </h4>
                          <p className="text-sm text-[#483d8b] font-medium">
                            {exp.companyName} • {start} - {end}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {exp.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

            {/* Education */}
            {candidate.education && candidate.education.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Education
                </h3>
                <div className="space-y-3">
                  {candidate.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                    >
                      <h4 className="font-semibold text-gray-900">
                        {edu.degree}
                      </h4>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      {edu.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {edu.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Class of{" "}
                        {new Date(edu.endDate || edu.startDate).getFullYear()}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Action Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex flex-wrap gap-3 justify-between">
            <button
              onClick={() => console.warn("Download not implemented")}
              className="px-6 py-2.5 bg-[#483d8b] text-white font-medium rounded-lg hover:bg-indigo-800 transition-colors shadow-sm"
            >
              <Download className="inline-block mr-2 w-4 h-4" />
              Download Resume
            </button>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleStatusUpdate("INTERVIEWING")}
                className="px-4 py-2.5 border border-[#483d8b] text-[#483d8b] font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Interview
              </button>
              <button
                onClick={() => handleStatusUpdate("SHORTLISTED")}
                className="px-4 py-2.5 bg-[#d4e157] text-gray-900 font-medium rounded-lg hover:bg-lime-400 transition-colors"
              >
                Shortlist
              </button>
              <button
                onClick={() => handleStatusUpdate("REJECTED")}
                className="px-4 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusUpdate("ACCEPTED")}
                className="px-4 py-2.5 bg-[#26a69a] text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
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
