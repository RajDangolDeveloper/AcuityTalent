"use client";

import CustomInput from "@/src/components/CustomInput";
import { Key, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
      <form className="flex flex-col gap-4 self-center" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-roboto">Sign In</h1>
          <p className="text-lg">
            Log into your account to continue your journey
          </p>
        </div>
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
        <button type="submit">Sign In</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
