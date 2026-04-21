"use client";

import React from "react";
import Link from "next/link";
import { UserResponseDto } from "@/types/user";
import { isPremiumUser } from "@/src/utils/subscription";
import { Lock, ArrowUpRight } from "lucide-react";

interface PremiumFeatureGateProps {
  user: UserResponseDto | null | undefined;
  featureName?: string;
  children?: React.ReactNode;
}





export const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  user,
  featureName = "Premium Feature",
  children,
}) => {
  const isPremium = isPremiumUser(user);

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {}
      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center z-10">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {featureName} is Premium Only
          </h3>
          <p className="text-sm text-gray-600 text-center mb-6">
            Upgrade to premium to access {featureName.toLowerCase()} and other
            AI-powered tools.
          </p>
          <Link href="/candidate/settings">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
              Upgrade to Premium <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {}
      <div className="opacity-50 pointer-events-none">{children}</div>
    </div>
  );
};

export default PremiumFeatureGate;
