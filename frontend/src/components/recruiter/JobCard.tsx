'use client';

import { Job } from '@/types/recruiter';

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function JobCard({ job, isSelected, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className={`border-b cursor-pointer transition-colors hover:bg-gray-50 p-4 ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-gray-200'
      }`}
    >
      <h3 className="font-semibold text-gray-900">{job.title}</h3>
      <p className="text-sm text-gray-600">No of applicants: {job.applicationCount}</p>
    </div>
  );
}
