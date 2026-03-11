import { useQuery } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { PaginatedResponse } from "../types/recruiter";
import { Resume } from "../types/candidate";

export const useGetAllResumes = () => {
  return useQuery({
    queryKey: ["candidateId"],
    queryFn: async () => {
      const response =
        await apiClient.get<PaginatedResponse<Resume>>("/resumes");
      console.log(response.data);
      return response.data;
    },
  });
};

export const useCreateResume = () => {
  return useQuery({
    queryKey: ["candidateId"],
    queryFn: async () => {
      const response = await apiClient.get;
    },
  });
};

export const useUpdateResume = () => {
  return useQuery({
    queryKey: ["candidateId"],
    queryFn: async () => {
      const response = await apiClient.get;
    },
  });
};

export const useDeleteResume = (resumeId: number) => {
  return useQuery({
    queryKey: ["resume-delete", resumeId],
    queryFn: async () => {
      const response = await apiClient.get;
    },
  });
};

export const useDownloadResume = (resumeId: number) => {
  return useQuery({
    queryKey: ["resume-download", resumeId],
    queryFn: async () => {
      const response = await apiClient.get(`/resumes/${resumeId}/download`);
      console.log(response);
      return response.data;
    },
    enabled: false, // Only run when explicitly triggered
  });
};
