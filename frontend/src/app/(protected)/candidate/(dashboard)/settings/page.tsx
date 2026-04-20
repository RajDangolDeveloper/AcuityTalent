"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useGetCurrentUser, useUpdateUser } from "@/src/hooks/useUserApi";
import { useChangePassword } from "@/src/hooks/useAuthApi";
import {
  useInitiatePremiumUpgrade,
  useMyPaymentHistory,
  useMySubscription,
  usePaymentStatusLookup,
} from "@/src/hooks/useSubscriptionApi";
import {
  formatExpiryDate,
  getSubscriptionStatusString,
} from "@/src/utils/subscription";

export default function CandidateSettingsPage() {
  const { data: currentUser } = useGetCurrentUser();
  const updateUser = useUpdateUser();
  const changePassword = useChangePassword();

  const { data: subscription, isLoading: subscriptionLoading } =
    useMySubscription();
  const { data: paymentHistory = [], isLoading: paymentsLoading } =
    useMyPaymentHistory();

  const upgradeMutation = useInitiatePremiumUpgrade();
  const paymentStatusMutation = usePaymentStatusLookup();

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [statusCheckRef, setStatusCheckRef] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    setProfileForm({
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
      contactPhone: currentUser.contactPhone ?? "",
      contactEmail: currentUser.contactEmail ?? "",
    });
  }, [currentUser]);

  const latestPaymentRef = useMemo(() => {
    return paymentHistory[0]?.transactionRef ?? "";
  }, [paymentHistory]);

  const postToEsewa = (
    paymentUrl: string,
    formData: Record<string, string>,
  ) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      return;
    }

    try {
      await updateUser.mutateAsync({
        id: currentUser.id,
        data: {
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          contactPhone: profileForm.contactPhone.trim(),
          contactEmail: profileForm.contactEmail.trim(),
        },
      });
      setMessageType("success");
      setMessage("Profile updated successfully.");
    } catch (error: any) {
      setMessageType("error");
      setMessage(error?.response?.data?.message ?? "Failed to update profile.");
    }
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessageType("error");
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessageType("success");
      setMessage("Password changed successfully.");
    } catch (error: any) {
      setMessageType("error");
      setMessage(
        error?.response?.data?.message ?? "Failed to change password.",
      );
    }
  };

  const onUpgrade = async () => {
    try {
      const result = await upgradeMutation.mutateAsync("ANNUAL");
      if (!result.paymentUrl || !result.formData) {
        throw new Error("Payment initialization failed");
      }

      setStatusCheckRef(result.paymentReference ?? "");
      setMessageType("success");
      setMessage("Redirecting to eSewa checkout...");
      postToEsewa(result.paymentUrl, result.formData);
    } catch (error: any) {
      setMessageType("error");
      setMessage(error?.response?.data?.message ?? "Failed to start payment.");
    }
  };

  const onCheckPaymentStatus = async () => {
    if (!statusCheckRef.trim()) {
      setMessageType("error");
      setMessage("Enter a transaction reference first.");
      return;
    }

    try {
      const payment = await paymentStatusMutation.mutateAsync(statusCheckRef);
      setMessageType("success");
      setMessage(`Payment status: ${payment.status}`);
    } catch (error: any) {
      setMessageType("error");
      setMessage(
        error?.response?.data?.message ?? "Failed to fetch payment status.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Candidate Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account, password, premium plan, and payments.
          </p>
        </div>

        {message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Profile
            </h2>
            <form className="space-y-3" onSubmit={onSaveProfile}>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="First name"
                value={profileForm.firstName}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Last name"
                value={profileForm.lastName}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
              />
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Phone"
                value={profileForm.contactPhone}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    contactPhone: e.target.value,
                  }))
                }
              />
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Contact email"
                value={profileForm.contactEmail}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
              />
              <button
                type="submit"
                disabled={updateUser.isPending}
                className="rounded-md bg-[#484677] px-4 py-2 text-white disabled:opacity-60"
              >
                {updateUser.isPending ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Security
            </h2>
            <form className="space-y-3" onSubmit={onChangePassword}>
              <input
                type="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
              />
              <input
                type="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
              <input
                type="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="rounded-md bg-[#484677] px-4 py-2 text-white disabled:opacity-60"
              >
                {changePassword.isPending ? "Updating..." : "Change Password"}
              </button>
            </form>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Subscription
            </h2>
            {subscriptionLoading ? (
              <p className="text-sm text-gray-500">Loading subscription...</p>
            ) : (
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Current Plan:</span>{" "}
                  {subscription?.subscriptionPlan ?? "NON_PREMIUM"}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {getSubscriptionStatusString(currentUser ?? null)}
                </p>
                <p>
                  <span className="font-medium">Expires At:</span>{" "}
                  {formatExpiryDate(subscription?.expiresAt ?? null)}
                </p>
                <p>
                  <span className="font-medium">Days Remaining:</span>{" "}
                  {subscription?.daysRemaining ?? 0}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Billing
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Upgrade to premium to unlock all AI tools including resume
                review, text improvement, and cover letter generation.
              </p>
              <button
                onClick={onUpgrade}
                disabled={upgradeMutation.isPending}
                className="rounded-md bg-green-600 px-4 py-2 text-white disabled:opacity-60"
              >
                {upgradeMutation.isPending
                  ? "Starting payment..."
                  : "Upgrade via eSewa"}
              </button>

              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  Use transaction ref to check latest payment status.
                </p>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Transaction reference"
                  value={statusCheckRef}
                  onChange={(e) => setStatusCheckRef(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={onCheckPaymentStatus}
                    disabled={paymentStatusMutation.isPending}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    {paymentStatusMutation.isPending
                      ? "Checking..."
                      : "Check Status"}
                  </button>
                  {latestPaymentRef && (
                    <button
                      onClick={() => setStatusCheckRef(latestPaymentRef)}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      Use Latest
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment History
          </h2>
          {paymentsLoading ? (
            <p className="text-sm text-gray-500">Loading payments...</p>
          ) : paymentHistory.length === 0 ? (
            <p className="text-sm text-gray-500">No payment records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Reference</th>
                    <th className="py-2 pr-4">Provider</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr
                      key={payment.transactionRef}
                      className="border-b border-gray-100"
                    >
                      <td className="py-2 pr-4">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4">{payment.transactionRef}</td>
                      <td className="py-2 pr-4">{payment.provider}</td>
                      <td className="py-2 pr-4">NPR {payment.amount}</td>
                      <td className="py-2">{payment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
