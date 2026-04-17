"use client";

import Link from "next/link";
import {
  AdminFeatureKey,
  getAdminFeatureByKey,
} from "@/src/components/admin/adminFeatureConfig";
import { useAdminFeatureDetail } from "@/src/hooks/useAdminApi";

interface Props {
  feature: AdminFeatureKey;
  id: number;
}

export default function AdminFeatureDetailPage({ feature, id }: Props) {
  const featureConfig = getAdminFeatureByKey(feature);
  const { data, isLoading, isError } = useAdminFeatureDetail(feature, id);

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="mb-6">
        <Link
          href={`/admin/${feature}`}
          className="text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          Back to {featureConfig?.label ?? feature}
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          {featureConfig?.label ?? feature} Detail #{id}
        </h1>
      </div>

      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          Loading...
        </div>
      )}

      {isError && (
        <div className="bg-white border border-red-200 text-red-700 rounded-xl p-6">
          Could not load detail data.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 overflow-auto">
          <pre className="text-xs leading-5 text-slate-800 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
