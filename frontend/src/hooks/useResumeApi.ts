import { useQuery } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { PaginatedResponse } from "../types/recruiter";
import { Resume } from "../types/candidate";

export const getAllResumes = () => {
  return useQuery({
    queryKey: ["candidateId"],
    queryFn: async () => {
      const response =
        await apiClient.get<PaginatedResponse<Resume>>("/resumes");
      return response.data;
    },
  });
};

export const createResume = () => {
  return useQuery({
    queryKey: ["candidateId"],
    queryFn: async () => {
      const response = await apiClient.get;
    },
  });
};

export const updateResume = () => {
  return useQuery({
    queryKey: ["candidateId"],
    queryFn: async () => {
      const response = await apiClient.get;
    },
  });
};
