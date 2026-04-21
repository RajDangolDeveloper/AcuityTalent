"use client";

import React from "react";
import Link from "next/link";
import { UserResponseDto } from "@/types/user";
import {
  isPremiumUser,
  getDaysRemaining,
  formatExpiryDate,
} from "@/src/utils/subscription";
import { ArrowUpRight, Check } from "lucide-react";

interface SubscriptionStatusCardProps {
  user: UserResponseDto | null | undefined;
  variant?: "compact" | "full";
}





export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  user,
  variant = "full",
}) => {
  if (!user) return null;

  const isPremium = isPremiumUser(user);
  const daysRemaining = getDaysRemaining(user);

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          isPremium
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isPremium && <Check className="w-4 h-4" />}
        <span>{isPremium ? "Premium" : "Free Plan"}</span>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                Premium Subscriber
              </h3>
            </div>
            <p className="text-sm text-green-800">
              {daysRemaining && daysRemaining > 0
                ? `Renews on ${formatExpiryDate(user.subscriptionExpiresAt)}`
                : "Your subscription has expired"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-1">
            Upgrade to Premium
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            Unlock unlimited job postings, advanced analytics, and priority
            support.
          </p>
          <Link href="/recruiter/settings">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Upgrade Now <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatusCard;
