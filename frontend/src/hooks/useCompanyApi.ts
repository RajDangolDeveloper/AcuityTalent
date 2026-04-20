import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { PaginatedResponse, SingleResponse } from "../types/recruiter";
import { Company, CreateCompanyDto, UpdateCompanyDto } from "../types/company";

export const useRecruiterCompanies = () => {
  return useQuery({
    queryKey: ["recruiter-companies"],
    queryFn: async () => {
      const response = await apiClient.get<SingleResponse<any>>("/companies");
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
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["get-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["recruiter-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-list"] }),
      ]);
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
      return response.data.data;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["get-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["recruiter-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["company", variables.id] }),
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-list"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-detail"] }),
      ]);
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/companies/${id}`);
    },
    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["get-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["recruiter-companies"] }),
        queryClient.removeQueries({ queryKey: ["company", id] }),
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-list"] }),
      ]);
    },
  });
};

export const useUploadCompanyLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<SingleResponse<Company>>(
        `/companies/${id}/upload/logo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      return response.data.data;
    },
    onSuccess: async (company) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["get-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["recruiter-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["company", company.id] }),
      ]);
    },
  });
};
