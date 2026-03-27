"use client";

import CustomSidebar from "@/src/components/CustomSidebar";
import { useDeleteResume, useGetAllResumes } from "@/src/hooks/useResumeApi";
import apiClient from "@/src/app/api/api-client";
import { FileDown, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ResumesPage() {
  const { data, isLoading, isError } = useGetAllResumes();
  const resumes = data?.data;
  const [selectedResumeID, setSelectedResumeId] = useState(0);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ✅ Hooks called at component level
  const deleteMutation = useDeleteResume();

  const handleDownload = async (resumeId: number, fileName: string) => {
    try {
      setDownloadingId(resumeId);
      // Fetch as blob so auth headers are sent
      const response = await apiClient.get(`/resumes/${resumeId}/download`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (resumeId: number) => {
    if (!confirm("Delete this resume?")) return;
    try {
      setDeletingId(resumeId);
      await deleteMutation.mutateAsync(resumeId);
      if (selectedResumeID === resumeId) setSelectedResumeId(0);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Build a blob URL for the selected resume so the iframe gets auth headers
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSelectResume = async (resumeId: number) => {
    setSelectedResumeId(resumeId);
    // Revoke previous blob URL to avoid memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    try {
      const response = await apiClient.get(`/resumes/${resumeId}/view`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      setPreviewUrl(url);
    } catch (err) {
      console.error("Preview failed", err);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="relative h-dvh w-full flex">
      {/* Sidebar */}
      <div className="min-h-dvh w-full max-w-80 flex justify-center items-center">
        {isLoading && (
          <div className="font-medium text-lg">Loading Resumes...</div>
        )}
        {isError && (
          <div className="font-medium text-lg">Error Loading Resumes..</div>
        )}
        {resumes?.length === 0 && !isLoading && (
          <div className="font-medium text-lg">No Resumes Yet</div>
        )}

        {resumes && resumes.length > 0 && (
          <CustomSidebar
            className="border-r"
            variant="secondary"
            defaultCollapsed={false}
          >
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="border-b border-l-0 border-r-0 border-solid border-gray-800 flex justify-between py-3 px-4 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectResume(resume.id)}
              >
                <div className="flex flex-col gap-1">
                  <div className="font-semibold">{resume.fileName}</div>
                  <div className="flex gap-2 items-center">
                    <div className="text-xs text-gray-500">
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs">Resume Score</div>
                  </div>
                </div>
                <div className="flex gap-1 items-start">
                  {/* Download */}
                  <button
                    title="Download"
                    disabled={downloadingId === resume.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(resume.id, resume.fileName);
                    }}
                  >
                    {downloadingId === resume.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileDown className="w-5 h-5 cursor-pointer" />
                    )}
                  </button>
                  {/* Delete */}
                  <button
                    title="Delete"
                    disabled={deletingId === resume.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(resume.id);
                    }}
                  >
                    {deletingId === resume.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <X className="w-5 h-5 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </CustomSidebar>
        )}
      </div>

      {/* Preview area */}
      {selectedResumeID === 0 && (
        <div className="h-full w-full flex items-center justify-center text-lg font-medium text-primary-500">
          No Resume selected
        </div>
      )}

      {selectedResumeID !== 0 && (
        <div className="h-full w-full p-4 overflow-hidden">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border border-gray-300 rounded-md"
              title="Resume Preview"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          )}
        </div>
      )}

      <Link href="/candidate/resumes/create">
        <button className="absolute bottom-2 right-2 p-4 rounded-md bg-primary-500 text-gray-100 font-semibold">
          Create Resume
        </button>
      </Link>
    </div>
  );
}
