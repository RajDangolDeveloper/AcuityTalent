"use client";

import RecruiterSidebar from "@/src/components/recruiter/RecruiterSidebar";
import { Download, FileText } from "lucide-react";

export default function ResumesPage() {
  const resumes = [
    {
      id: 1,
      candidateName: "John Doe",
      fileName: "john_doe_resume.pdf",
      uploadedAt: "2025-01-15",
    },
    {
      id: 2,
      candidateName: "Jane Smith",
      fileName: "jane_smith_resume.pdf",
      uploadedAt: "2025-01-14",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resumes</h1>
          <p className="text-gray-600 mb-8">
            View and manage candidate resumes.
          </p>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Candidate Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resumes.map((resume) => (
                  <tr
                    key={resume.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-900">
                      {resume.candidateName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                      <FileText size={18} />
                      {resume.fileName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-sm font-medium">
                        <Download size={16} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
