"use client";

import apiClient from "@/src/app/api/api-client";
import CustomButton from "@/src/components/CustomButton";
import CustomInput from "@/src/components/CustomInput";
import { Key, Mail, OctagonX, TriangleAlert } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RegisterPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams?.get("callbackUrl") || "/recruiter/dashboard";
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setWarning("Passwords do not match");
      return;
    }

    try {
      const response = await apiClient.post("/auth/register", {
        email,
        password,
        role: "CANDIDATE",
      });

      if (response.status === 201 || response.status === 200) {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(
            "Account created, but login failed. Please sign in manually.",
          );
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Registration failed. Try again.";
      setError(message);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full h-full">
      <img
        className="self-start"
        src="/logo/primary-full-noslogan.png"
        alt=""
      />
      <form className="flex flex-col self-center pt-12" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-roboto">Sign Up</h1>
          <p className="text-lg">Create an account to find the jobs you want</p>
        </div>
        <div className="flex flex-col gap-4 py-4">
          <CustomInput
            name="email"
            type="email"
            leftIcon={<Mail size={18} />}
            placeholder="Enter your email"
            required
          />
          <CustomInput
            name="password"
            type="password"
            leftIcon={<Key size={18} />}
            placeholder="Enter your password"
            required
          />
          <CustomInput
            name="confirmPassword"
            type="password"
            leftIcon={<Key size={18} />}
            placeholder="Reenter your password"
            required
          />
        </div>
        <CustomButton
          color="primary"
          className="self-center mb-3"
          type="submit"
        >
          Sign Up
        </CustomButton>
        {error && (
          <p className="text-center text-red-500 font-semibold bg-red-50 border border-red-500 py-2 px-2 rounded-md flex gap-2 justify-center">
            <OctagonX className="text-red-500" />
            {error}
          </p>
        )}
        {warning && (
          <p className=" text-orange-500 font-semibold bg-orange-50 border border-orange-500 py-2 px-2 rounded-md flex gap-2 justify-center">
            <TriangleAlert className="text-orange-500" />
            {warning}
          </p>
        )}
      </form>
      <div className="flex flex-col gap-3 self-center ">
        <div className="self-center">
          Already have an account?
          <a className="text-primary-500" href="/candidate/login">
            {" "}
            Sign In
          </a>
        </div>
        <div className="self-center">Or</div>
        <div className="self-center">
          Are you a recruiter?
          <a className="text-primary-500" href="/recruiter/register">
            {" "}
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
