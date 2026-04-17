import { useQuery } from "@tanstack/react-query";
import apiClient from "@/src/app/api/api-client";
import {
  AdminEmbeddingResponse,
  AdminListResponse,
  AdminOverviewResponse,
} from "@/src/types/admin";
import { AdminFeatureKey } from "@/src/components/admin/adminFeatureConfig";

interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

const toQueryString = (params: AdminQueryParams) => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.search) query.append("search", params.search);
  return query.toString();
};

export const useAdminOverview = () => {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const response =
        await apiClient.get<AdminOverviewResponse>("/admin/overview");
      return response.data;
    },
  });
};

export const useAdminFeatureList = (
  feature: AdminFeatureKey,
  params: AdminQueryParams,
) => {
  return useQuery({
    queryKey: ["admin-feature-list", feature, params],
    queryFn: async () => {
      const queryString = toQueryString(params);
      const response = await apiClient.get<AdminListResponse>(
        `/admin/${feature}${queryString ? `?${queryString}` : ""}`,
      );
      return response.data;
    },
    enabled: !!feature,
  });
};

export const useAdminFeatureDetail = (
  feature: AdminFeatureKey,
  id?: number,
) => {
  return useQuery({
    queryKey: ["admin-feature-detail", feature, id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/${feature}/${id}`);
      return response.data as Record<string, unknown>;
    },
    enabled: !!feature && !!id,
  });
};

export const useAdminEmbeddings = (params: AdminQueryParams) => {
  return useQuery({
    queryKey: ["admin-embeddings", params],
    queryFn: async () => {
      const queryString = toQueryString(params);
      const response = await apiClient.get<AdminEmbeddingResponse>(
        `/admin/ai/embeddings${queryString ? `?${queryString}` : ""}`,
      );
      return response.data;
    },
  });
};
