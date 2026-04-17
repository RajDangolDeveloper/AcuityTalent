import { useMutation } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { queryClient } from "@/library/queryClient";
import { SingleResponse, WorkExperience } from "../types/recruiter";

export const useUpdateWorkExperience = () => {
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number;
      company?: string;
      position?: string;
      startDate?: string;
      endDate?: string | null;
      isCurrent?: boolean;
      description?: string;
    }) => {
      try {
        const response = await apiClient.patch<SingleResponse<WorkExperience>>(
          `/candidates/work-experience/${id}`,
          payload,
        );
        return response.data.data;
      } catch (error) {
        console.error("[useUpdateWorkExperience] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-work-experiences"],
      });
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    },
  });
};

export const useDeleteWorkExperience = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        await apiClient.delete(`/candidates/work-experience/${id}`);
      } catch (error) {
        console.error("[useDeleteWorkExperience] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-work-experiences"],
      });
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    },
  });
};
