// src/app/candidate/resumes/page.tsx
"use client";

import CustomSidebar from "@/src/components/CustomSidebar";
import { useDeleteResume, useGetAllResumes } from "@/src/hooks/useResumeApi";
import apiClient from "@/src/app/api/api-client";
import { FileDown, Trash2, Pencil, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ResumesPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetAllResumes();
  const resumes = data?.data;
  const [selectedResumeID, setSelectedResumeId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ✅ Hooks called at component level
  const deleteMutation = useDeleteResume();

  const handleDownload = async (resumeId: number, fileName: string) => {
    try {
      setDownloadingId(resumeId);
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
    if (
      !confirm("Delete this resume permanently? This action cannot be undone.")
    )
      return;
    try {
      setDeletingId(resumeId);
      await deleteMutation.mutateAsync(resumeId);
      if (selectedResumeID === resumeId) {
        setSelectedResumeId(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectResume = async (resumeId: number) => {
    setSelectedResumeId(resumeId);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    try {
      const response = await apiClient.get(`/resumes/${resumeId}/view`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      setPreviewUrl(url);
    } catch (err) {
      console.error("Preview failed", err);
      setPreviewUrl(null);
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectedResume = resumes?.find((r) => r.id === selectedResumeID);

  return (
    <div className="relative h-dvh w-full flex bg-gray-50">
      {/* Sidebar - Resume List */}
      <div className="min-h-dvh w-full max-w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">My Resumes</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {resumes?.length || 0} uploaded
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading resumes...
            </div>
          )}
          {isError && (
            <div className="p-4 text-center text-sm text-red-600">
              Error loading resumes
            </div>
          )}
          {resumes?.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-gray-500">
              No resumes yet
            </div>
          )}

          {resumes && resumes.length > 0 && (
            <CustomSidebar
              className="border-r-0 w-full"
              variant="secondary"
              defaultCollapsed={false}
            >
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`border-b border-gray-100 px-4 py-3 cursor-pointer transition-colors ${
                    selectedResumeID === resume.id
                      ? "bg-indigo-50 border-l-4 border-l-indigo-500"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectResume(resume.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-12 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium text-gray-900 truncate"
                        title={resume.fileName}
                      >
                        {resume.fileName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(resume.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {/* ✅ Download only - Delete moved to detail view */}
                    <button
                      title="Download"
                      disabled={downloadingId === resume.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(resume.id, resume.fileName);
                      }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      {downloadingId === resume.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </CustomSidebar>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedResumeID === null ? (
          /* Empty State */
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-500">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium">Select a resume to preview</p>
            <p className="text-sm text-gray-400 mt-1">
              Or create a new one to get started
            </p>
          </div>
        ) : (
          /* Resume Preview with Actions */
          <div className="h-full flex flex-col">
            {/* Action Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                <h3
                  className="font-medium text-gray-900 truncate"
                  title={selectedResume?.fileName}
                >
                  {selectedResume?.fileName}
                </h3>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {selectedResume &&
                    new Date(selectedResume.uploadedAt).toLocaleDateString()}
                </span>
                {selectedResume && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    Resume Score: {selectedResume.aiScore}%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* ✅ Edit Button - Navigates to edit route */}
                <button
                  onClick={() =>
                    router.push(`/candidate/resumes/edit/${selectedResumeID}`)
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

                {/* ✅ Delete Button - Now in detail view only */}
                <button
                  onClick={() =>
                    selectedResumeID && handleDelete(selectedResumeID)
                  }
                  disabled={deletingId === selectedResumeID}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {deletingId === selectedResumeID ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>

            {/* PDF Preview - Smaller, Content-Only */}
            <div className="flex-1 p-6 overflow-hidden bg-gray-100">
              <div className="h-full w-full max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {previewUrl ? (
                  <iframe
                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full"
                    title="Resume Preview"
                    // ✅ Hide UI chrome for content-only view
                    style={{
                      border: "none",
                      // Optional: Force PDF to show only content area
                      display: "block",
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Resume FAB */}
      <Link href="/candidate/resumes/create">
        <button className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium shadow-lg hover:bg-indigo-700 transition-colors">
          <FileText className="w-4 h-4" />
          Create Resume
        </button>
      </Link>
    </div>
  );
}
