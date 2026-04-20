import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/src/app/api/api-client";

export type SubscriptionStatusResponse = {
  userId: number;
  subscriptionPlan: "NON_PREMIUM" | "PREMIUM";
  isActive: boolean;
  isPremium: boolean;
  expiresAt: string | null;
  daysRemaining: number | null;
};

export type SubscriptionPayment = {
  id: number;
  userId: number;
  amount: number;
  provider: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  transactionRef: string;
  createdAt: string;
  updatedAt: string;
};

export type UpgradeResponse = {
  success: boolean;
  message: string;
  paymentReference?: string;
  paymentUrl?: string;
  amount?: number;
  formData?: Record<string, string>;
};

export const useMySubscription = () => {
  return useQuery({
    queryKey: ["subscription", "me"],
    queryFn: async () => {
      const response =
        await apiClient.get<SubscriptionStatusResponse>("/subscriptions/me");
      return response.data;
    },
  });
};

export const useMyPaymentHistory = () => {
  return useQuery({
    queryKey: ["subscription", "payments"],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionPayment[]>(
        "/subscriptions/me/payments",
      );
      return response.data;
    },
  });
};

export const useInitiatePremiumUpgrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billingCycle: "ANNUAL" | "MONTHLY" = "ANNUAL") => {
      const response = await apiClient.post<UpgradeResponse>(
        "/subscriptions/upgrade-to-premium",
        {
          planType: "PREMIUM",
          billingCycle,
        },
      );
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["subscription", "me"] }),
        queryClient.invalidateQueries({
          queryKey: ["subscription", "payments"],
        }),
      ]);
    },
  });
};

export const usePaymentStatusLookup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionRef: string) => {
      const response = await apiClient.get(
        `/subscriptions/payment-status/${transactionRef}`,
      );
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["subscription", "me"] }),
        queryClient.invalidateQueries({
          queryKey: ["subscription", "payments"],
        }),
      ]);
    },
  });
};
