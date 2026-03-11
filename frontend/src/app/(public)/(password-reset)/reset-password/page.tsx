"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomButton from "@/src/components/CustomButton";
import CustomInput from "@/src/components/CustomInput";
import apiClient from "@/src/app/api/api-client";
import { Key } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Redirect if no email provided (user didn't complete OTP verification)
  useEffect(() => {
    if (!email) {
      router.push("/forget-password");
    }
  }, [email, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("auth/update-password", {
        email: email,
        password: password,
      });

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/candidate/login");
        }, 2000);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
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
        alt="AcuityTalent Logo"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-[390px]">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold pb-2">Reset Password</h1>
          <p className="text-base text-gray-600">
            Enter your new password below
          </p>
        </div>

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">
              Password reset successfully! Redirecting to login...
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <CustomInput
            name="password"
            type="password"
            leftIcon={<Key size={18} />}
            placeholder="Enter your new password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            disabled={loading || success}
            required
          />
          <CustomInput
            name="confirmPassword"
            type="password"
            leftIcon={<Key size={18} />}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            disabled={loading || success}
            required
          />
        </div>

        <div className="flex justify-between gap-4">
          <CustomButton
            className="flex-1"
            color="white"
            type="button"
            onClick={handleBack}
            disabled={loading || success}
          >
            Back
          </CustomButton>
          <CustomButton
            className="flex-1"
            color="primary"
            type="submit"
            disabled={loading || success}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </CustomButton>
        </div>
      </form>

      <p className="max-w-sm text-center text-gray-600 text-sm">
        Make sure your password is strong and includes uppercase letters,
        lowercase letters, numbers, and special characters.
      </p>
    </div>
  );
}
