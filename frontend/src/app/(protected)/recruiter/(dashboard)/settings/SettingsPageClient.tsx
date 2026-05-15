"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useGetCurrentUser,
  useUpdateUser,
  useUploadProfileImage,
} from "@/src/hooks/useUserApi";
import { useChangePassword } from "@/src/hooks/useAuthApi";
import {
  useFinalizeEsewaPayment,
  useInitiatePremiumUpgrade,
  useMyPaymentHistory,
  useMySubscription,
  useMarkEsewaPaymentFailed,
  usePaymentStatusLookup,
} from "@/src/hooks/useSubscriptionApi";
import {
  formatExpiryDate,
  getSubscriptionStatusString,
} from "@/src/utils/subscription";

export default function SettingsPageClient() {
  const pendingTxnStorageKey = "esewa:recruiter:pendingTransactionRef";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: currentUser } = useGetCurrentUser();
  const updateUser = useUpdateUser();
  const uploadProfileImage = useUploadProfileImage();
  const changePassword = useChangePassword();

  const { data: subscription, isLoading: subscriptionLoading } =
    useMySubscription();
  const { data: paymentHistory = [], isLoading: paymentsLoading } =
    useMyPaymentHistory();

  const upgradeMutation = useInitiatePremiumUpgrade();
  const paymentStatusMutation = usePaymentStatusLookup();
  const finalizeEsewaMutation = useFinalizeEsewaPayment();
  const markEsewaFailureMutation = useMarkEsewaPaymentFailed();
  const handledReturnKeyRef = useRef<string>("");

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] =
    useState(false);
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
    setProfilePicturePreview(currentUser.profilePictureUrl ?? null);
  }, [currentUser]);

  const latestPaymentRef = useMemo(() => {
    return paymentHistory[0]?.transactionRef ?? "";
  }, [paymentHistory]);

  useEffect(() => {
    const rawPaymentResult = searchParams.get("payment");
    const fallbackParams = new URLSearchParams();
    let paymentResult = rawPaymentResult;

    if (rawPaymentResult?.includes("?")) {
      const separatorIndex = rawPaymentResult.indexOf("?");
      const normalizedPaymentResult = rawPaymentResult.slice(0, separatorIndex);
      const appendedQuery = rawPaymentResult.slice(separatorIndex + 1);
      paymentResult = normalizedPaymentResult || null;
      const appendedParams = new URLSearchParams(appendedQuery);
      appendedParams.forEach((value, key) => {
        fallbackParams.set(key, value);
      });
    }

    const getParam = (name: string) =>
      searchParams.get(name) ?? fallbackParams.get(name);

    const hasEsewaPayload = Boolean(
      getParam("data") ||
      getParam("transaction_uuid") ||
      getParam("transactionRef") ||
      getParam("oid") ||
      getParam("signature"),
    );
    if (!paymentResult && !hasEsewaPayload) {
      return;
    }

    const effectivePaymentResult = paymentResult ?? "success";

    if (!currentUser?.id) {
      return;
    }

    const returnKey = `${effectivePaymentResult}:${searchParams.toString()}`;
    if (handledReturnKeyRef.current === returnKey) {
      return;
    }
    handledReturnKeyRef.current = returnKey;

    const cleanupReturnQuery = () => {
      router.replace(pathname);
    };

    const directSignaturePayload = {
      signature: getParam("signature"),
      signedFieldNames: getParam("signed_field_names"),
      totalAmount: getParam("total_amount"),
      transactionUuid: getParam("transaction_uuid"),
      productCode: getParam("product_code"),
      transactionCode: getParam("transaction_code"),
      status: getParam("status"),
    };

    let parsedPayload: {
      signature: string | null;
      signed_field_names: string | null;
      total_amount: string | null;
      transaction_uuid: string | null;
      product_code: string | null;
      transaction_code: string | null;
      status: string | null;
    } | null = null;

    if (
      directSignaturePayload.signature &&
      directSignaturePayload.signedFieldNames &&
      directSignaturePayload.totalAmount &&
      directSignaturePayload.transactionUuid &&
      directSignaturePayload.productCode
    ) {
      parsedPayload = {
        signature: directSignaturePayload.signature,
        signed_field_names: directSignaturePayload.signedFieldNames,
        total_amount: directSignaturePayload.totalAmount,
        transaction_uuid: directSignaturePayload.transactionUuid,
        product_code: directSignaturePayload.productCode,
        transaction_code: directSignaturePayload.transactionCode,
        status: directSignaturePayload.status,
      };
    } else {
      const encodedData = getParam("data");
      if (encodedData) {
        try {
          const decoded = atob(encodedData);
          const parsed = JSON.parse(decoded);
          parsedPayload = {
            signature: parsed?.signature ?? null,
            signed_field_names: parsed?.signed_field_names ?? null,
            total_amount: parsed?.total_amount ?? null,
            transaction_uuid: parsed?.transaction_uuid ?? null,
            product_code: parsed?.product_code ?? null,
            transaction_code: parsed?.transaction_code ?? null,
            status: parsed?.status ?? null,
          };
        } catch {
          parsedPayload = null;
        }
      }
    }

    const storedPendingRef =
      typeof window !== "undefined"
        ? window.localStorage.getItem(pendingTxnStorageKey)
        : null;

    const transactionRef =
      parsedPayload?.transaction_uuid ||
      getParam("transaction_uuid") ||
      getParam("transactionRef") ||
      getParam("oid") ||
      storedPendingRef ||
      latestPaymentRef;

    if (!transactionRef) {
      setMessageType("error");
      setMessage(
        "Returned from eSewa, but transaction reference was missing. Please use Payment History to verify.",
      );
      cleanupReturnQuery();
      return;
    }

    setStatusCheckRef(transactionRef);
    setMessageType("success");
    setMessage("Returned from eSewa. Verifying payment status...");

    const finalizeAndCheck = async () => {
      try {
        if (
          effectivePaymentResult === "success" &&
          parsedPayload?.signature &&
          parsedPayload?.signed_field_names &&
          parsedPayload?.total_amount &&
          parsedPayload?.transaction_uuid &&
          parsedPayload?.product_code
        ) {
          await finalizeEsewaMutation.mutateAsync({
            transactionRef,
            userId: Number(currentUser.id),
            amount: Number(parsedPayload.total_amount),
            provider: "ESEWA",
            planType: "PREMIUM",
            signature: parsedPayload.signature,
            signed_field_names: parsedPayload.signed_field_names,
            total_amount: parsedPayload.total_amount,
            transaction_uuid: parsedPayload.transaction_uuid,
            product_code: parsedPayload.product_code,
            transaction_code: parsedPayload.transaction_code ?? undefined,
            status: parsedPayload.status ?? undefined,
          });
        }

        if (effectivePaymentResult === "failed") {
          await markEsewaFailureMutation.mutateAsync({
            transactionRef,
            userId: Number(currentUser.id),
            amount:
              paymentHistory.find(
                (payment) => payment.transactionRef === transactionRef,
              )?.amount ?? undefined,
            provider: "ESEWA",
            planType: "PREMIUM",
          });
        }

        const payment = await paymentStatusMutation.mutateAsync(transactionRef);
        const status = String(payment?.status ?? "UNKNOWN");

        if (status === "COMPLETED") {
          setMessageType("success");
          setMessage("Payment completed successfully. Premium is now active.");
        } else if (status === "PENDING") {
          setMessageType("error");
          setMessage(
            "Payment is still pending. If this was a test cancel, this is expected.",
          );
        } else if (status === "FAILED") {
          setMessageType("error");
          setMessage("Payment failed. Please try again.");
        } else {
          setMessageType("error");
          setMessage(`Payment returned with status: ${status}`);
        }
      } catch (error: any) {
        setMessageType("error");
        setMessage(
          error?.response?.data?.message ??
            "Returned from eSewa but could not verify payment. Use Check Status with the reference.",
        );
      } finally {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(pendingTxnStorageKey);
        }
        cleanupReturnQuery();
      }
    };

    void finalizeAndCheck();
  }, [
    currentUser?.id,
    finalizeEsewaMutation,
    latestPaymentRef,
    markEsewaFailureMutation,
    pendingTxnStorageKey,
    pathname,
    paymentStatusMutation,
    router,
    searchParams,
  ]);

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
      const baseUrl = window.location.origin;
      const result = await upgradeMutation.mutateAsync({
        billingCycle: "ANNUAL",
        successUrl: `${baseUrl}/recruiter/settings?payment=success`,
        failureUrl: `${baseUrl}/recruiter/settings?payment=failed`,
      });
      if (!result.paymentUrl || !result.formData) {
        throw new Error("Payment initialization failed");
      }

      const pendingTxnRef =
        result.paymentReference || result.formData.transaction_uuid || "";
      if (pendingTxnRef) {
        window.localStorage.setItem(pendingTxnStorageKey, pendingTxnRef);
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
            Recruiter Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account, password, subscription, and payments.
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

            <div className="mb-6 flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow overflow-hidden cursor-pointer hover:opacity-80 transition">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile picture"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById("recruiter-profile-picture-input")
                      ?.click();
                  }}
                  disabled={isUploadingProfilePicture}
                  className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {isUploadingProfilePicture ? "..." : <Camera size={14} />}
                </button>
              </div>
              <input
                id="recruiter-profile-picture-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setProfilePicturePreview(preview);
                    setIsUploadingProfilePicture(true);
                    uploadProfileImage.mutateAsync(file).finally(() => {
                      setIsUploadingProfilePicture(false);
                    });
                  }
                }}
              />
              <p className="text-sm text-gray-600">
                Click to change profile picture
              </p>
            </div>

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

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Subscription
            </h2>
            {subscriptionLoading ? (
              <p className="text-sm text-gray-500">Loading subscription...</p>
            ) : subscription ? (
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  Status: {getSubscriptionStatusString(currentUser ?? null)}
                </p>
                <p>Expires: {formatExpiryDate(subscription.expiresAt)}</p>
                <p>Plan: {subscription.subscriptionPlan}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No subscription data.</p>
            )}
            <button
              type="button"
              onClick={onUpgrade}
              disabled={upgradeMutation.isPending}
              className="mt-4 rounded-md bg-[#484677] px-4 py-2 text-white disabled:opacity-60"
            >
              {upgradeMutation.isPending
                ? "Preparing..."
                : "Upgrade to Premium"}
            </button>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Status
            </h2>
            <div className="space-y-3">
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Transaction reference"
                value={statusCheckRef}
                onChange={(e) => setStatusCheckRef(e.target.value)}
              />
              <button
                type="button"
                onClick={onCheckPaymentStatus}
                disabled={paymentStatusMutation.isPending}
                className="rounded-md bg-[#484677] px-4 py-2 text-white disabled:opacity-60"
              >
                {paymentStatusMutation.isPending
                  ? "Checking..."
                  : "Check Status"}
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Payments
            </h2>
            {paymentsLoading ? (
              <p className="text-sm text-gray-500">
                Loading payment history...
              </p>
            ) : paymentHistory.length ? (
              <div className="space-y-2 text-sm text-gray-700">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-md border border-gray-200 p-3"
                  >
                    <p>
                      Ref: {payment.transactionRef} | Amount: {payment.amount}
                    </p>
                    <p>
                      Status: {payment.status} | Provider: {payment.provider}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No payment history.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
