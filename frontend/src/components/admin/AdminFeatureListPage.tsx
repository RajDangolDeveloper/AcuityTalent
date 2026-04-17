"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AdminFeatureKey,
  getAdminFeatureByKey,
} from "@/src/components/admin/adminFeatureConfig";
import { useAdminFeatureList } from "@/src/hooks/useAdminApi";

interface Props {
  feature: AdminFeatureKey;
}

export default function AdminFeatureListPage({ feature }: Props) {
  const featureConfig = getAdminFeatureByKey(feature);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useAdminFeatureList(feature, {
    page,
    limit,
    search: search || undefined,
  });

  const rows = data?.data ?? [];

  const columns = useMemo(() => {
    if (!rows.length) {
      return ["id", "createdAt", "updatedAt"];
    }
    return Object.keys(rows[0]).slice(0, 6);
  }, [rows]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {featureConfig?.label ?? "Feature"}
          </h1>
          <p className="text-slate-600 mt-2">{featureConfig?.description}</p>
        </div>

        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search records..."
          className="w-full max-w-sm border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          Loading...
        </div>
      )}

      {isError && (
        <div className="bg-white border border-red-200 text-red-700 rounded-xl p-6">
          Could not load data for {featureConfig?.label ?? feature}.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="text-left px-4 py-3 font-semibold text-slate-700"
                    >
                      {column}
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const record = row as Record<string, unknown>;
                  const recordId = record.id as number | undefined;

                  return (
                    <tr
                      key={recordId ?? idx}
                      className="border-t border-slate-100"
                    >
                      {columns.map((column) => {
                        const value = record[column];
                        return (
                          <td key={column} className="px-4 py-3 text-slate-700">
                            {typeof value === "object" && value !== null
                              ? "[object]"
                              : String(value ?? "-")}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3">
                        {recordId ? (
                          <Link
                            className="text-blue-700 hover:text-blue-900 font-semibold"
                            href={`/admin/${feature}/${recordId}`}
                          >
                            View details
                          </Link>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-8 text-slate-500"
                      colSpan={columns.length + 1}
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <div className="text-sm text-slate-600">
              Page {page} of {totalPages}
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
                className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
