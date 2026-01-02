"use client";

import apiClient from "@/src/app/api/api-client";
import CustomButton from "@/src/components/CustomButton";
import CustomInput from "@/src/components/CustomInput";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, use, useState } from "react";

interface VerifyOtpProps {
  params: Promise<{
    email: string;
  }>;
}

export default function ResetPage({ params }: VerifyOtpProps) {
  const router = useRouter();
  const { email } = use(params);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post("auth/verify-otp", {
        email: email,
        otp: otp,
      });

      if (response.data.success === true) {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col px-2 gap-8 items-center min-h-full">
      <img
        className="self-start py-8 px-2"
        src="/logo/primary-full-noslogan.png"
        alt=""
      />
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-bold pb-2">Forgot Password</h1>
        <div>
          <div className="pb-2">Check for a verification code</div>
          <form className="flex flex-col gap-4">
            <CustomInput
              name="otp"
              type="text"
              value={otp}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setOtp(e.target.value)
              }
              disabled={loading}
              maxLength={6}
              placeholder="Enter your 6-digit code"
              required
            />
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}
            <CustomButton
              className="flex-10"
              color="primary"
              type="submit"
              onClick={handleSubmit}
              disabled={loading || otp.length <= 6}
            >
              {loading ? "Verifying..." : "Submit"}
            </CustomButton>
          </form>
        </div>
        <p className="max-w-sm">
          If you don’t see the email in your inbox, check your spam folder. If
          it’s not there, the email address may not be confirmed, or it may not
          match an existing AcuityTalent account.
        </p>
      </div>
      <div className="flex justify-between gap-4 w-[390px]"></div>
    </div>
  );
}
