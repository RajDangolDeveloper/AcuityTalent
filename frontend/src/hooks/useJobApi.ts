import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { Job, PaginatedResponse, SingleResponse } from "../types/recruiter";
import { JobDetails, SavedJob } from "../types/candidate";

// Get all active jobs with filters
export const getAllJobs = (
  page: number = 1,
  limit: number = 10,
  filters?: {
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
    remoteOnly?: boolean;
    search?: string;
  },
) => {
  return useQuery({
    queryKey: ["candidate-jobs", page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (filters?.location) params.append("location", filters.location);
      if (filters?.employmentType)
        params.append("employmentType", filters.employmentType);
      if (filters?.experienceLevel)
        params.append("experienceLevel", filters.experienceLevel);
      if (filters?.remoteOnly) params.append("remoteOnly", "true");
      if (filters?.search) params.append("search", filters.search);

      try {
        const response = await apiClient.get<PaginatedResponse<Job>>(
          `/jobs?${params.toString()}`,
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

// Get job details
export const useJobDetails = (jobId: number | null) => {
  return useQuery({
    queryKey: ["job-details", jobId],
    queryFn: async () => {
      try {
        const response = await apiClient.get<SingleResponse<JobDetails>>(
          `/jobs/${jobId}`,
        );
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!jobId,
  });
};

export const usePublicJobDetails = (jobId: number | null) => {
  return useQuery({
    queryKey: ["public-job-details", jobId],
    queryFn: async () => {
      if (!jobId) return null;

      const response = await apiClient.get<SingleResponse<JobDetails>>(
        `/public/jobs/${jobId}`,
      );
      return response.data.data;
    },
    enabled: !!jobId,
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; status: string }) => {
      const response = await apiClient.patch<SingleResponse<any>>(
        "/jobs/status",
        payload,
      );
      return response.data.data;
    },
    onSuccess: async (_, variables) => {
      // Invalidate the jobs list or dashboard stats so they refresh automatically
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["recruiter-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-jobs"] }),
        queryClient.invalidateQueries({
          queryKey: ["job-details", variables.id],
        }),
      ]);
    },
    onError: (error) => {
    },
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: number) => {
      try {
        const response = await apiClient.post<SingleResponse<SavedJob>>(
          "/saved-jobs",
          { jobId },
        );
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["job-details"] }),
        queryClient.invalidateQueries({
          queryKey: ["candidate-recommended-jobs"],
        }),
      ]);
    },
  });
};

export const useRemoveSavedJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: number) => {
      try {
        await apiClient.delete(`/saved-jobs/${jobId}`);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["job-details"] }),
        queryClient.invalidateQueries({
          queryKey: ["candidate-recommended-jobs"],
        }),
      ]);
    },
  });
};
