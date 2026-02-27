"use client";

import CustomSidebar from "@/src/components/CustomSidebar";
import {
  useDeleteResume,
  useDownloadResume,
  useGetAllResumes,
} from "@/src/hooks/useResumeApi";
import { FileDown, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Markdown from "react-markdown";

export default function ResumesPage() {
  //This is to call the hook for all of the data in useGetAllResumes
  const { data, isLoading, isError } = useGetAllResumes();
  const resume = data?.data;
  // This is for the selected Resume functionality
  const [selectedResumeID, setSelectedResumeId] = useState(0);

  const handleDownload = (resumeId: number) => {
    useDownloadResume(resumeId);
  };

  const handleDelete = (resumeId: number) => {
    // TODO: Implement delete logic
    useDeleteResume(resumeId);
  };
  return (
    <div className="relative h-dvh w-full flex">
      {/* This is the secondary sidebar for the list of resumes available */}
      <div className="min-h-dvh w-full max-w-96 border-r flex justify-center items-center">
        {isLoading && (
          <div className="font-medium text-lg">Loading Resumes...</div>
        )}
        {isError && (
          <div className="font-medium text-lg">Error Loading Resumes..</div>
        )}

        {resume?.length === 0 && !isLoading && (
          <div className="font-medium text-lg">No Resumes Yet</div>
        )}

        {resume && resume.length > 0 && (
          <CustomSidebar className="border-r" variant="secondary">
            {resume?.map((resume, id) => (
              <div
                className="border border-l-0 border-r-0 border-solid border-gray-800 flex justify-between py-3 px-4 cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedResumeId(resume.id)}
              >
                <div className="flex flex-col gap-1">
                  <div className="font-semibold">{resume.fileName}</div>
                  <div className="flex gap-2 items-center">
                    <div className="text-xs text-gray-100 bg-yellow-400 border border-yellow-500 font-semibold px-1 py-0.5 rounded-sm"></div>
                    <div className="text-xs">Resume Score</div>
                  </div>
                </div>
                <div className="flex gap-1 items-start">
                  <button
                    onClick={() => {
                      handleDownload(resume.id);
                    }}
                  >
                    <FileDown className="w-5 h-5 cursor-pointer" />
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(resume.id);
                    }}
                  >
                    <X className="w-5 h-5 cursor-pointer" />
                  </button>
                </div>
              </div>
            ))}
          </CustomSidebar>
        )}
      </div>

      {selectedResumeID === 0 && (
        <div className="h-full w-full flex items-center justify-center text-lg font-medium text-primary-500">
          No Resume selected
        </div>
      )}
      {/* This is the Detailed View of said resume */}
      {selectedResumeID !== 0 && resume && (
        <div className="h-full w-full overflow-auto p-4">
          <Markdown>
            {resume.find((r) => r.id === selectedResumeID)?.textContent || ""}
          </Markdown>
        </div>
      )}
      {/* This is the button for creating a resume*/}
      <Link href="/candidate/resumes/create">
        <button className="absolute bottom-2 right-2 p-4 rounded-md bg-primary-500 text-gray-100 font-semibold">
          Create Resume
        </button>
      </Link>
    </div>
  );
}
