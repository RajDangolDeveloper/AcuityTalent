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

export type UpgradeRequest = {
  billingCycle?: "ANNUAL" | "MONTHLY";
  successUrl?: string;
  failureUrl?: string;
};

export type EsewaFinalizePayload = {
  transactionRef: string;
  userId: number;
  amount: number;
  provider: "ESEWA";
  planType: "PREMIUM" | "NON_PREMIUM";
  signature: string;
  signed_field_names: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  transaction_code?: string;
  status?: string;
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
    mutationFn: async (payload: UpgradeRequest = {}) => {
      const response = await apiClient.post<UpgradeResponse>(
        "/subscriptions/upgrade-to-premium",
        {
          planType: "PREMIUM",
          billingCycle: payload.billingCycle ?? "ANNUAL",
          successUrl: payload.successUrl,
          failureUrl: payload.failureUrl,
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

export const useFinalizeEsewaPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EsewaFinalizePayload) => {
      const response = await apiClient.post(
        "/subscriptions/webhook/payment-success",
        payload,
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

export const useMarkEsewaPaymentFailed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      transactionRef: string;
      userId: number;
      amount?: number;
      provider: "ESEWA";
      planType: "PREMIUM" | "NON_PREMIUM";
    }) => {
      const response = await apiClient.post(
        "/subscriptions/webhook/payment-failed",
        payload,
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
