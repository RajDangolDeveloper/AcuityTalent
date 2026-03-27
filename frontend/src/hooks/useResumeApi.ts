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
      console.log(response.data);
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
      console.log(response);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
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
    onSuccess: (updatedResume) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
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
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
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
  return useMutation({
    mutationFn: async ({ file, userId, textContent }: UploadResumeParams) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId.toString());
      if (textContent) {
        formData.append("textContent", textContent);
      }
      console.log("Sending userId:", userId);

      const response = await apiClient.post<Resume>(
        "/resumes/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });
};
