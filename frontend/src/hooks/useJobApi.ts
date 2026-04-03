import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { Job, PaginatedResponse, SingleResponse } from "../types/recruiter";
import { queryClient } from "../lib/query-client";
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
      console.log("[getAllJobs] Fetching jobs", { page, limit, filters });
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
        console.log("[getAllJobs] Success:", response.data);
        return response.data;
      } catch (error) {
        console.error("[getAllJobs] Error:", error);
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
      console.log("[useJobDetails] Fetching job details for jobId:", jobId);
      try {
        const response = await apiClient.get<SingleResponse<JobDetails>>(
          `/jobs/${jobId}`,
        );
        console.log("[useJobDetails] Success:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("[useJobDetails] Error:", error);
        throw error;
      }
    },
    enabled: !!jobId,
  });
};

export const useUpdateJobStatus = () => {
  return useMutation({
    mutationFn: async (payload: { id: number; status: string }) => {
      const response = await apiClient.patch<SingleResponse<any>>(
        "/jobs/status",
        payload,
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate the jobs list or dashboard stats so they refresh automatically
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-stats"] });
    },
    onError: (error) => {
      console.error("Failed to update job status:", error);
    },
  });
};

export const useSaveJob = () => {
  return useMutation({
    mutationFn: async (jobId: number) => {
      console.log("[useSaveJob] Saving job", { jobId });
      try {
        const response = await apiClient.post<SingleResponse<SavedJob>>(
          "/saved-jobs",
          { jobId },
        );
        console.log("[useSaveJob] Success:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("[useSaveJob] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[useSaveJob] Invalidating saved jobs query");
      queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] });
    },
  });
};

export const useRemoveSavedJob = () => {
  return useMutation({
    mutationFn: async (jobId: number) => {
      console.log("[useRemoveSavedJob] Removing saved job", { jobId });
      try {
        await apiClient.delete(`/saved-jobs/${jobId}`);
        console.log("[useRemoveSavedJob] Success");
      } catch (error) {
        console.error("[useRemoveSavedJob] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[useRemoveSavedJob] Invalidating saved jobs query");
      queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] });
    },
  });
};
