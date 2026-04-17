"use client";

import AdminFeatureListPage from "@/src/components/admin/AdminFeatureListPage";
import {
  AdminFeatureKey,
  ADMIN_FEATURES,
} from "@/src/components/admin/adminFeatureConfig";
import { useParams } from "next/navigation";

const VALID_FEATURES = new Set(ADMIN_FEATURES.map((feature) => feature.key));

export default function AdminDynamicFeaturePage() {
  const params = useParams<{ feature: string }>();
  const feature = params?.feature;

  if (!feature || !VALID_FEATURES.has(feature as AdminFeatureKey)) {
    return (
      <div className="p-8 text-red-700 font-semibold">
        Unknown admin feature: {feature}
      </div>
    );
  }

  return <AdminFeatureListPage feature={feature as AdminFeatureKey} />;
}
