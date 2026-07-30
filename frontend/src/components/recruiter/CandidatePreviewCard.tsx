"use client";

import React, { useRef } from "react";

import { Mail, Phone, MapPin, Calendar } from "lucide-react";
import { CandidateApplication } from "@/src/types/candidate";

interface Props {
  candidate: CandidateApplication;
  onClick?: () => void;
}

export default function CandidatePreviewCard({ candidate, onClick }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    try {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.muted = true;
        const p = videoRef.current.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
    } catch (e) {}
  };

  const handleMouseLeave = () => {
    try {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    } catch (e) {}
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow bg-white"
    >
      <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />

      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">
            {candidate.candidateName}
          </h3>
          {candidate.matchScore != null && (
            <span className="text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {Math.round(candidate.matchScore)}% Compatible
            </span>
          )}
        </div>

        <div className="mt-2 text-sm text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <Mail size={14} />
            <span>{candidate.candidateEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <span>{candidate.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{candidate.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>
              Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="w-48 h-28 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
        {}
        {}
        {"" as any}
        {(candidate as any).videoUrl ? (
          <video
            ref={videoRef}
            src={(candidate as any).videoUrl}
            className="w-full h-full object-cover"
            playsInline
            preload="metadata"
            muted
            loop={false}
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
    </div>
  );
}
