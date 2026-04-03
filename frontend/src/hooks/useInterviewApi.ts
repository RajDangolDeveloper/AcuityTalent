import {
  UseQueryOptions,
  useQuery,
  UseMutationOptions,
  useMutation,
  QueryKey,
} from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { Interview } from "../types/interview";
import { queryClient } from "../lib/query-client";
import { interviewQueryKeys } from "../constants/interview/query-keys";

export const useUpcomingInterviews = (
  month?: string,
  options?: Omit<
    UseQueryOptions<Interview[], Error, Interview[], QueryKey>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: interviewQueryKeys.interviews.upcoming(month),
    queryFn: async () => {
      const query = month ? `?month=${month}` : "";
      const response = await apiClient.get<Interview[]>(
        `/interviews/candidate${query}`,
      );
      return response.data;
    },
    ...options,
  });
};

export const useInterview = (
  id: number,
  options?: UseQueryOptions<Interview, Error>,
) => {
  return useQuery({
    queryKey: interviewQueryKeys.interviews.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Interview>(`/interviews/${id}`);
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useInterviewByRoom = (
  roomId: string,
  options?: UseQueryOptions<Interview, Error>,
) => {
  return useQuery({
    queryKey: interviewQueryKeys.interviews.byRoom(roomId),
    queryFn: async () => {
      const res = await apiClient.get<Interview>(`/interviews/room/${roomId}`);
      return res.data;
    },
    enabled: !!roomId,
    ...options,
  });
};

export const useUpdateInterviewStatus = (
  options?: UseMutationOptions<
    Interview,
    Error,
    { id: number; status: string }
  >,
) => {
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await apiClient.patch<Interview>(`/interviews/${id}`, {
        status,
      });
      return response.data;
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.interviews.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.interviews.upcoming(),
      });
    },
    ...options,
  });
};

export const useMarkInterviewInProgress = (
  options?: UseMutationOptions<Interview, Error, number>,
) => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.patch<Interview>(
        `/interviews/${id}/status/in-progress`,
      );
      return response.data;
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.interviews.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.interviews.upcoming(),
      });
    },
    ...options,
  });
};

export const useMarkInterviewCompleted = (
  options?: UseMutationOptions<
    Interview,
    Error,
    { id: number; recordingUrl?: string }
  >,
) => {
  return useMutation({
    mutationFn: async ({ id, recordingUrl }) => {
      const response = await apiClient.patch<Interview>(
        `/interviews/${id}/status/completed`,
        {
          recordingUrl,
        },
      );
      return response.data;
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.interviews.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.interviews.upcoming(),
      });
    },
    ...options,
  });
};
