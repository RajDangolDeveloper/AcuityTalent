import { Suspense } from "react";
import ResetPasswordPageClient from "./ResetPasswordPageClient";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className="p-6 md:p-8">Loading reset form...</div>}
    >
      <ResetPasswordPageClient />
    </Suspense>
  );
}
