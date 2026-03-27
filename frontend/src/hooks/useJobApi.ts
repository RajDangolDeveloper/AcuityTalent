import { useQuery } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { SingleResponse } from "../types/recruiter";

export const useUpdateJobStatus = () => {
  return useQuery({
    queryKey: ["recruiter-companies"],
    queryFn: async () => {
      const response = await apiClient.get<SingleResponse<any>>("/companies");
      console.log(response);
      return response.data.data;
    },
  });
};