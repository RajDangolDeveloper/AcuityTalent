"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/src/app/api/api-client";
import { CandidateApplication, SingleResponse } from "@/src/types/candidate";

import { candidateQueryKeys } from "@/src/constants/candidate/query-keys";

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      resumeId,
      coverLetter,
    }: {
      jobId: number;
      resumeId: number;
      coverLetter?: string;
    }) => {
      try {
        const response = await apiClient.post<
          SingleResponse<CandidateApplication>
        >("/applications", {
          jobId,
          resumeId,
          coverLetter: coverLetter || "",
        });
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: candidateQueryKeys.candidate.applications.all(),
        }),
        queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] }),
        queryClient.invalidateQueries({
          queryKey: ["recent-candidate-applications"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["total-candidate-applications"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["candidate-applications-response-rate"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["candidate-applications-interview-rate"],
        }),
        queryClient.invalidateQueries({ queryKey: ["candidate-total-offers"] }),
        queryClient.invalidateQueries({ queryKey: ["job-details"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-jobs"] }),
        queryClient.invalidateQueries({
          queryKey: ["candidate-recommended-jobs"],
        }),
      ]);
    },
  });
};

export const useGetApplicationById = (applicationId: number) => {
  return useQuery({
    queryKey: ["application", applicationId],
    queryFn: async () => {
      const response = await apiClient.get<
        SingleResponse<CandidateApplication>
      >(`/applications/${applicationId}`);
      return response.data.data;
    },
  });
};
