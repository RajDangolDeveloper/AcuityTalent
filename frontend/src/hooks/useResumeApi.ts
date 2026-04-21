import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { PaginatedResponse, SingleResponse } from "../types/recruiter";
import { Resume } from "../types/candidate";
import { UpdateResumeDto, UploadResumeParams } from "../types/resume";

export const useGetAllResumes = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["resumes", params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Resume>>(
        "/resumes",
        { params },
      );
      return response.data;
    },
  });
};

export const useGetResumeById = (id: number | null) => {
  return useQuery({
    queryKey: ["resume", id],
    queryFn: async () => {
      const response = await apiClient.get<SingleResponse<Resume>>(
        `/resumes/${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post<SingleResponse<Resume>>(
        "/resumes",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["resumes"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-resumes"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-profile"] }),
      ]);
    },
  });
};

export const useUpdateResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateResumeDto }) => {
      const response = await apiClient.patch<SingleResponse<Resume>>(
        `/resumes/${id}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: async (updatedResume) => {
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["resumes"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-resumes"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-profile"] }),
      ]);
      queryClient.setQueryData(["resume", updatedResume.id], updatedResume);
    },
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resumeId: number) => {
      await apiClient.delete(`/resumes/${resumeId}`);
    },
    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["resumes"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-resumes"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-profile"] }),
      ]);
      queryClient.removeQueries({ queryKey: ["resume", id] });
    },
  });
};

export const useDownloadResume = (resumeId: number) => {
  return useQuery({
    queryKey: ["resume-download", resumeId],
    queryFn: async () => {
      const response = await apiClient.get(`/resumes/${resumeId}/download`, {
        responseType: "blob",
      });
      return response.data;
    },
    enabled: false,
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, userId, textContent }: UploadResumeParams) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId.toString());
      if (textContent) {
        formData.append("textContent", textContent);
      }

      const response = await apiClient.post<Resume>(
        "/resumes/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["resumes"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-resumes"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-profile"] }),
      ]);
    },
    onError: (error) => {
    },
  });
};
