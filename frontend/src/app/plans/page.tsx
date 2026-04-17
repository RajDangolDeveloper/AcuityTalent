"use client";

import {
  useInitiateEsewaPayment,
  useSubscriptionStatus,
} from "@/src/hooks/useUserApi";
import { useSession, signIn } from "next-auth/react";

export default function PlansPage() {
  const { data: session, status } = useSession();
  const { data: subscription } = useSubscriptionStatus();
  const { mutateAsync: initiatePayment, isPending } = useInitiateEsewaPayment();

  const handleUpgrade = async () => {
    if (!session) {
      await signIn();
      return;
    }

    const payment = await initiatePayment();
    window.location.href = payment.paymentUrl;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900">Plans</h1>
        <p className="mt-2 text-slate-600">
          Upgrade to premium to unlock all AI features and recruiter insights.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Non Premium
            </h2>
            <p className="mt-1 text-sm text-slate-600">Free</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li>2 AI cover letter generations</li>
              <li>3 resume templates</li>
              <li>No resume score visibility</li>
              <li>No recruiter premium analytics</li>
            </ul>
          </div>

          <div className="rounded-2xl border-2 border-indigo-500 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Premium</h2>
            <p className="mt-1 text-sm text-slate-600">NPR 800 / month</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li>Unlimited AI cover letters</li>
              <li>All resume templates</li>
              <li>Resume score visibility</li>
              <li>Recruiter: matching score, category, and risk</li>
            </ul>

            <button
              type="button"
              onClick={handleUpgrade}
              disabled={isPending || subscription?.isPremium}
              className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {subscription?.isPremium
                ? "You are Premium"
                : isPending
                  ? "Redirecting to eSewa..."
                  : status === "authenticated"
                    ? "Pay with eSewa"
                    : "Login and pay with eSewa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
