"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/src/app/api/api-client";
import { CandidateApplication } from "@/src/types/candidate";

interface ApplicationsResponse {
  statusCode: number;
  data: CandidateApplication[];
  pagination: { total: number; page: number; limit: number };
}

export const useGetCandidateApplications = () => {
  return useQuery({
    queryKey: ["candidate-applications"],
    queryFn: async () => {
      const res = await apiClient.get<ApplicationsResponse>(
        "/applications/candidate/all",
        { params: { page: 1, limit: 50 } },
      );
      return res.data.data;
    },
  });
};
