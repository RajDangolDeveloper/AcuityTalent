import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import {
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
  SubscriptionStatusResponse,
} from "../types/user";

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiClient.get<UserResponseDto[]>("/users");
      return response.data;
    },
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await apiClient.get<UserResponseDto>("/users/current");
      return response.data;
    },
  });
};

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionStatusResponse>(
        "/users/subscription/status",
      );
      return response.data;
    },
  });
};

export const useInitiateEsewaPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<{
        paymentUrl: string;
        amount: number;
        transactionRef: string;
      }>("/users/subscription/esewa/initiate");
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["subscription-status"],
      });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useGetUserById = (id: number) => {
  return useQuery({
    queryKey: ["particular-users", id],
    queryFn: async () => {
      const response = await apiClient.get<UserResponseDto>(`/users/${id}`);
      return response.data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUser: CreateUserDto) => {
      const response = await apiClient.post<UserResponseDto>("/users", newUser);
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-list"] }),
      ]);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserDto }) => {
      const response = await apiClient.patch<UserResponseDto>(
        `/users/${id}`,
        data,
      );
      console.log(response.data);
      return response.data;
    },
    onSuccess: async (updatedUser) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({
          queryKey: ["particular-users", updatedUser.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["user"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-list"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-detail"] }),
      ]);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-list"] }),
      ]);
    },
  });
};
