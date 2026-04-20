import { useMutation } from "@tanstack/react-query";
import apiClient from "@/src/app/api/api-client";

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const response = await apiClient.patch("/auth/change-password", payload);
      return response.data;
    },
  });
};
