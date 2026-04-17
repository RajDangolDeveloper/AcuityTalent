"use client";

import { CandidateApplication } from "@/src/types/recruiter";
import { MapPin, Mail, Phone, Briefcase, Calendar } from "lucide-react";
import { Badge } from "./Badge";

interface CandidateCardProps {
  candidate: CandidateApplication;
  job?: any; // Optional job info
  isSelected?: boolean;
  onClick?: () => void;
  showModal?: boolean;
  showPremiumAnalytics?: boolean;
}

export default function CandidateCard({
  candidate,
  job,
  isSelected,
  onClick,
  showModal,
  showPremiumAnalytics = true,
}: CandidateCardProps) {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const content = (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-gray-300 shrink-0"></div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">
              {candidate.candidateName}
            </h3>
            {showPremiumAnalytics && candidate.matchScore !== undefined && (
              <Badge variant="success" className="mt-1">
                {Math.round(candidate.matchScore)}% Compatible
              </Badge>
            )}
            {showPremiumAnalytics && candidate.riskScore !== undefined && (
              <Badge variant="warning" className="mt-1">
                {Math.round(candidate.riskScore)}% Risk
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail size={16} />
            <span>{candidate.candidateEmail}</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{candidate.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{candidate.location}</span>
          </div>
        </div>

        {job && (
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Briefcase size={16} />
              <span className="font-medium">{job.title}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <span>
                Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Close button for modal */}
      {showModal && (
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );

  if (showModal) {
    return (
      <div
        onClick={onClick}
        className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-lg transition-shadow cursor-pointer"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`border-b p-4 cursor-pointer transition-colors ${
        isSelected
          ? "bg-gray-100 border-l- border-gray-200"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      {content}
    </div>
  );
}
