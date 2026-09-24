import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { queryClient } from "@/library/queryClient";
import {
  CandidateWorkExperience,
  RecruiterWorkExperience,
} from "../types/experience";
import { PaginatedResponse, SingleResponse } from "../types";

export const useGetCurrentRecruiterPosition = () => {
  return useQuery({
    queryKey: ["recruiter-current-position"],
    queryFn: async () => {
      const response = await apiClient.get<
        SingleResponse<RecruiterWorkExperience>
      >("/work-experience/recruiter/current");
      return response.data.data;
    },
  });
};

export const useGetRecruiterWorkExperience = () => {
  return useQuery({
    queryKey: ["recruiter-work-experience"],
    queryFn: async () => {
      const response = await apiClient.get<
        PaginatedResponse<RecruiterWorkExperience>
      >("/work-experience/recruiter");
      return response.data.data;
    },
  });
};

export const useGetCandidateWorkExperience = () => {
  return useQuery({
    queryKey: ["candidate-work-experience-list"],
    queryFn: async () => {
      const response = await apiClient.get<
        PaginatedResponse<CandidateWorkExperience>
      >("/work-experience/candidate");
      return response.data.data;
    },
  });
};

export const useCreateWorkExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      isCurrent?: boolean;
      description?: string;
    }) => {
      try {
        const response = await apiClient.post<
          SingleResponse<CandidateWorkExperience>
        >("/work-experience/candidate", payload);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["candidate-work-experiences"],
        }),
        queryClient.invalidateQueries({ queryKey: ["candidate-profile"] }),
      ]);
    },
  });
};

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
        const response = await apiClient.patch<
          SingleResponse<CandidateWorkExperience>
        >(`/work-experience/candidate/${id}`, payload);
        return response.data.data;
      } catch (error) {
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
        await apiClient.delete(`/work-experience/candidate/${id}`);
      } catch (error) {
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
