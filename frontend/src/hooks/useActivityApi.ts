import { useQuery } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { LatestUserActivityListResponse } from "../types/activity";

export const useGetLatestUserActivity = () => {
  return useQuery({
    queryKey: ["latest-user-activity"],
    queryFn: async () => {
      const response =
        await apiClient.get<LatestUserActivityListResponse[]>(`activity/user/`);
      return response.data || [];
    },
  });
};
