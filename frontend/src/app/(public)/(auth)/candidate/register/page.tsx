"use client";

import CustomButton from "@/src/components/CustomButton";
import CustomInput from "@/src/components/CustomInput";
import { Key, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    if (formData.get("password") !== formData.get("confirmPassword")) {
      setError("Passwords do not match");
      return;
    }

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
      router.refresh();
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
        <CustomButton color="primary" className="self-center" type="submit">
          Sign Up
        </CustomButton>
        {error && <p style={{ color: "red" }}>{error}</p>}
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
