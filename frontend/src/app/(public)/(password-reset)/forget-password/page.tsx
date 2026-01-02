"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "@/src/components/CustomButton";
import CustomInput from "@/src/components/CustomInput";
import apiClient from "@/src/app/api/api-client";

interface ApiResponse {
  message?: string;
  error?: string;
}

export default function ResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("auth/forget-password", {
        email: email,
      });

      if (response.status) {
        router.push(`forget-password/verify-otp/${encodeURIComponent(email)}`);
      } else {
        setError("Failed to send reset email");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col px-2 gap-8 items-center min-h-full">
      <img
        className="self-start py-8 px-2"
        src="/logo/primary-full-noslogan.png"
        alt=""
      />

      {/* Add form wrapper and onSubmit handler */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold pb-2">Forgot Password</h1>
          <div>
            <label htmlFor="email">Enter your email</label>
            <CustomInput
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              disabled={loading}
            />
          </div>
          <p className="max-w-sm">
            We'll send you a verification email to your account's email address
            if it matches an existing AcuityTalent account.
          </p>
        </div>

        {/* Error message (only added element) */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md -mt-2">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-between gap-4 w-[390px]">
          <CustomButton
            className="flex-10"
            color="white"
            type="button"
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </CustomButton>
          <CustomButton
            className="flex-10"
            color="primary"
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !email}
          >
            {loading ? "Sending..." : "Next"}
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
