"use client";

import AdminFeatureDetailPage from "@/src/components/admin/AdminFeatureDetailPage";
import {
  AdminFeatureKey,
  ADMIN_FEATURE_WITH_DETAIL,
} from "@/src/components/admin/adminFeatureConfig";
import { useParams } from "next/navigation";

export default function AdminDynamicFeatureDetailPage() {
  const params = useParams<{ feature: string; id: string }>();
  const feature = params?.feature as AdminFeatureKey | undefined;
  const id = Number(params?.id);

  if (!feature || !ADMIN_FEATURE_WITH_DETAIL.has(feature)) {
    return (
      <div className="p-8 text-red-700 font-semibold">Unknown feature.</div>
    );
  }

  if (!id || Number.isNaN(id)) {
    return <div className="p-8 text-red-700 font-semibold">Invalid id.</div>;
  }

  return <AdminFeatureDetailPage feature={feature} id={id} />;
}
