import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 md:p-8">Loading login...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
