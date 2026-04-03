import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../app/api/api-client";
import { UserResponseDto, CreateUserDto, UpdateUserDto } from "../types/user";

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

export const useGetUserById = (id: number) => {
  return useQuery({
    queryKey: ["particular-users"],
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", updatedUser.id] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
