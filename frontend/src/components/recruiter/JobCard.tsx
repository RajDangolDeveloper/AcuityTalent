"use client";

import { Job } from "@/src/types/recruiter";

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function JobCard({ job, isSelected, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className={`border-b cursor-pointer transition-colors hover:bg-gray-50 px-6 py-4 ${
        isSelected ? "bg-blue-50" : "border-gray-200"
      }`}
    >
      <h3 className="font-semibold text-primary-700">{job.title}</h3>
      <div className="flex mt-1 justify-between items-center">
        <p className="text-sm text-gray-600">
          No of applicants: {job.applicationCount}
        </p>
        <p className="text-sm text-gray-600">
          Applied Date: {new Date(job.latestAppliedDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
