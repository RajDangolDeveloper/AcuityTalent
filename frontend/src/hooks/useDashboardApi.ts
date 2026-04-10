import { useQuery } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";

export const useGetCandidateApplicationResponseRate = () => {
  return useQuery({
    queryKey: ["candidate-applications-response-rate"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/applications/candidate/responserate",
      );
      return response.data;
    },
  });
};

export const useGetCandidateRecentApplication = () => {
  return useQuery({
    queryKey: ["recent-candidate-applications"],
    queryFn: async () => {
      const { data } = await apiClient.get(
        "/applications/candidate/recentApplications",
      );
      console.log(data);
      return data;
    },
  });
};

export const useGetCandidateTotalApplication = () => {
  return useQuery({
    queryKey: ["total-candidate-applications"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/applications/candidate/totalApplications",
      );
      return response.data;
    },
  });
};

export const useGetCandidateApplicationInterviewRate = () => {
  return useQuery({
    queryKey: ["candidate-applications-interview-rate"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/applications/candidate/interviewrate",
      );
      return response.data;
    },
  });
};

export const useGetCandidateTotalOffers = () => {
  return useQuery({
    queryKey: ["candidate-total-offers"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/applications/candidate/totaloffers",
      );
      return response.data;
    },
  });
};
