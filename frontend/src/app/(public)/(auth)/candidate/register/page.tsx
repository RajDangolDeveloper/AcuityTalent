import { Suspense } from "react";
import RegisterPageClient from "./RegisterPageClient";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-6 md:p-8">Loading signup...</div>}>
      <RegisterPageClient />
    </Suspense>
  );
}
