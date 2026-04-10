import {
  UseQueryOptions,
  useQuery,
  UseMutationOptions,
  useMutation,
  QueryKey,
} from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import {
  CreateInterviewDto,
  Interview,
  InterviewStatus,
} from "../types/interview";
import { queryClient } from "@/library/queryClient";
import { interviewQueryKeys } from "../constants/interview/query-keys";

export const useCreateInterview = () => {
  return useMutation({
    mutationFn: async (newInterview: CreateInterviewDto) =>
      (await apiClient.post("/interviews", newInterview)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.interviews.all,
      });
    },
    onError: () => {
      alert("Failed to create Interview. Please try again.");
    },
  });
};

// Backward-compatible export to avoid breaking existing imports.
export const createInterview = useCreateInterview;

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
      if (!month) {
        const response = await apiClient.get<Interview[]>(
          "/interviews/candidate",
        );
        return response.data;
      }

      const [year, monthNum] = month.split("-").map(Number);

      const response = await apiClient.get<Interview[]>(
        `/interviews/candidate/month?year=${year}&month=${monthNum}`,
      );
      return response.data;
    },
    ...options,
  });
};

export const useInterviews = (
  options?: Omit<
    UseQueryOptions<Interview[], Error, Interview[], QueryKey>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: interviewQueryKeys.interviews.all,
    queryFn: async () => {
      const response = await apiClient.get<Interview[]>("/interviews");
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
    { id: number; status: InterviewStatus }
  >,
) => {
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await apiClient.patch<Interview>(
        `/interviews/${id}/status`,
        {
          status,
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

export const useMarkInterviewInProgress = (
  options?: UseMutationOptions<Interview, Error, number>,
) => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.patch<Interview>(
        `/interviews/${id}/in-progress`,
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
        `/interviews/${id}/complete`,
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

export const useUpdateInterviewNotes = (
  options?: UseMutationOptions<Interview, Error, { id: number; notes: string }>,
) => {
  return useMutation({
    mutationFn: async ({ id, notes }) => {
      const response = await apiClient.patch<Interview>(
        `/interviews/${id}/notes`,
        {
          notes,
        },
      );
      return response.data;
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.interviews.detail(id),
      });
    },
    ...options,
  });
};

export const useSendInterviewDecision = (
  options?:
    | UseMutationOptions<
        unknown,
        Error,
        { applicationId: number; decision: "OFFER" | "REJECTED" }
      >
    | undefined,
) => {
  return useMutation({
    mutationFn: async ({ applicationId, decision }) => {
      const response = await apiClient.post("/interviews/decision", {
        applicationId,
        decision,
      });
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.interviews.all,
      });
    },
    ...options,
  });
};
