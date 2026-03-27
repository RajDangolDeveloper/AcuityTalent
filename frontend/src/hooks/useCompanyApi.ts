import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { PaginatedResponse, Job, SingleResponse } from "../types/recruiter";
import { Company, CreateCompanyDto, UpdateCompanyDto } from "../types/company";

export const useRecruiterCompanies = () => {
  return useQuery({
    queryKey: ["recruiter-companies"],
    queryFn: async () => {
      const response = await apiClient.get<SingleResponse<any>>("/companies");
      console.log(response);
      return response.data.data;
    },
  });
};

export const useGetCompaniesName = () => {
  return useQuery({
    queryKey: ["get-companies"],
    queryFn: async () => {
      const response =
        await apiClient.get<PaginatedResponse<Company>>("/companies/names");
      console.log(response);
      return response.data;
    },
  });
};

export const useGetCompanies = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ["get-companies", page, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Company>>(
        "/companies",
        {
          params: { page, limit },
        },
      );
      console.log(response);
      return response.data;
    },
  });
};

export const useGetCompanyById = (id: number | null) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      const response = await apiClient.get<SingleResponse<Company>>(
        `/companies/${id}`,
      );
      console.log(response);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCompanyDto) => {
      const response = await apiClient.post<SingleResponse<Company>>(
        "/companies",
        data,
      );
      console.log(response);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCompanyDto;
    }) => {
      const response = await apiClient.patch<SingleResponse<Company>>(
        `/companies/${id}`,
        data,
      );
      console.log(response);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-companies"] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/companies/${id}`);
      console.log(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useGetRecruiterCompanies = () => {
  return useQuery({
    queryKey: ["recruiter-companies"],
    queryFn: async () => {
      const response = await apiClient.get<SingleResponse<any>>(
        "/companies/recruiter",
      );
      return response.data.data;
    },
  });
};
