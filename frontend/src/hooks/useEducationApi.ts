import { useMutation } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { queryClient } from "../lib/query-client";
import { SingleResponse, Education } from "../types/recruiter";

export const useCreateEducation = () => {
  return useMutation({
    mutationFn: async (payload: {
      institution: string;
      degree: string;
      fieldOfStudy?: string;
      startDate: string;
      endDate?: string;
      gpa?: number;
      description?: string;
    }) => {
      try {
        const response = await apiClient.post<SingleResponse<Education>>(
          "/candidates/education",
          payload,
        );
        return response.data.data;
      } catch (error) {
        console.error("[useCreateEducation] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-educations"] });
    },
  });
};

export const useUpdateEducation = () => {
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number;
      institution?: string;
      degree?: string;
      fieldOfStudy?: string;
      startDate?: string;
      endDate?: string | null;
      gpa?: number;
      description?: string;
    }) => {
      try {
        const response = await apiClient.patch<SingleResponse<Education>>(
          `/candidates/education/${id}`,
          payload,
        );
        return response.data.data;
      } catch (error) {
        console.error("[useUpdateEducation] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-educations"] });
    },
  });
};

export const useDeleteEducation = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        await apiClient.delete(`/candidates/education/${id}`);
      } catch (error) {
        console.error("[useDeleteEducation] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-educations"] });
    },
  });
};
