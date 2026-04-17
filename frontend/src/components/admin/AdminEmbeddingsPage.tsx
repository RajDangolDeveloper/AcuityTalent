"use client";

import { useState } from "react";
import { useAdminEmbeddings } from "@/src/hooks/useAdminApi";

export default function AdminEmbeddingsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading, isError } = useAdminEmbeddings({ page, limit });

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">AI Embeddings</h1>
        <p className="text-slate-600 mt-2">
          Candidate and job vector records for platform AI visibility.
        </p>
      </div>

      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          Loading...
        </div>
      )}

      {isError && (
        <div className="bg-white border border-red-200 text-red-700 rounded-xl p-6">
          Could not load embeddings.
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-sm text-slate-500">Candidate Embeddings</div>
              <div className="text-2xl font-bold mt-1">
                {data.totalCandidate}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-sm text-slate-500">Job Embeddings</div>
              <div className="text-2xl font-bold mt-1">{data.totalJobs}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 overflow-auto">
            <h2 className="font-semibold text-slate-900 mb-2">Snapshot</h2>
            <pre className="text-xs leading-5 text-slate-800 whitespace-pre-wrap">
              {JSON.stringify(
                {
                  candidateEmbeddings: data.candidateEmbeddings,
                  jobEmbeddings: data.jobEmbeddings,
                },
                null,
                2,
              )}
            </pre>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <button
              className="px-3 py-1.5 rounded border border-slate-300"
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
