"use client";

import { useMutation } from "@tanstack/react-query";
import apiClient from "@/src/app/api/api-client";
import { CandidateApplication, SingleResponse } from "@/src/types/candidate";
import { queryClient } from "@/library/queryClient";

export const useCreateApplication = () => {
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
      console.log("[useCreateApplication] Creating application", {
        jobId,
        resumeId,
        coverLetter,
      });
      try {
        const response = await apiClient.post<
          SingleResponse<CandidateApplication>
        >("/applications", {
          jobId,
          resumeId,
          coverLetter: coverLetter || "",
        });
        console.log("[useCreateApplication] Success:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("[useCreateApplication] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[useCreateApplication] Invalidating related queries");
      queryClient.invalidateQueries({ queryKey: ["candidate-applications"] });
      queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] });
    },
  });
};
