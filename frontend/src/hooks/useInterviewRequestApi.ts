// src/hooks/useInterviewRequestApi.ts

import { queryClient } from "@/library/queryClient";
import {
  UseQueryOptions,
  QueryKey,
  useQuery,
  UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import {
  InterviewRequest,
  CreateInterviewRequestDto,
  UpdateInterviewRequestDto,
} from "../types/interview";
import { interviewRequestQueryKeys } from "../constants/interviewRequest/query-keys";

export const useInterviewRequest = (
  id: number,
  options?: Omit<
    UseQueryOptions<InterviewRequest, Error, InterviewRequest, QueryKey>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ["interviewRequest", id], // improved key
    queryFn: async () => {
      const response = await apiClient.get<InterviewRequest>(
        "/interviewRequest",
        { params: { id } },
      );
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useGetInterviewRequestsByRecruiter = (
  options?: Omit<
    UseQueryOptions<InterviewRequest[], Error, InterviewRequest[], QueryKey>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: interviewRequestQueryKeys.byRecruiter(-1), // placeholder, but works
    queryFn: async () => {
      const response = await apiClient.get<InterviewRequest[]>(
        "/interviewRequest/recruiter",
      );
      return response.data;
    },
    ...options,
  });
};

export const useGetInterviewRequestsByCandidate = (
  options?: Omit<
    UseQueryOptions<InterviewRequest[], Error, InterviewRequest[], QueryKey>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: interviewRequestQueryKeys.byCandidate(-1), // placeholder
    queryFn: async () => {
      const response = await apiClient.get<InterviewRequest[]>(
        "/interviewRequest/candidate",
      );
      return response.data;
    },
    ...options,
  });
};

export const useCreateInterviewRequest = (
  options?: UseMutationOptions<
    InterviewRequest,
    Error,
    CreateInterviewRequestDto
  >,
) => {
  return useMutation({
    mutationFn: async (newRequest: CreateInterviewRequestDto) => {
      const response = await apiClient.post<InterviewRequest>(
        "/interviewRequest",
        newRequest,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interviewRequestQueryKeys.lists(),
      });
    },
    ...options,
  });
};

export const useUpdateInterviewRequest = (
  options?: UseMutationOptions<
    InterviewRequest,
    Error,
    UpdateInterviewRequestDto
  >,
) => {
  return useMutation({
    mutationFn: async (updateData: UpdateInterviewRequestDto) => {
      const response = await apiClient.patch<InterviewRequest>(
        "/interviewRequest",
        updateData,
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate detail and lists
      queryClient.invalidateQueries({
        queryKey: interviewRequestQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: interviewRequestQueryKeys.lists(),
      });
    },
    ...options,
  });
};

export const useDeleteInterviewRequest = (
  options?: UseMutationOptions<void, Error, number>,
) => {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete("/interviewRequest", { params: { id } });
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: interviewRequestQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: interviewRequestQueryKeys.lists(),
      });
    },
    ...options,
  });
};
