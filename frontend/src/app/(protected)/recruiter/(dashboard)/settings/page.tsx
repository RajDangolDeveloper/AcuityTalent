import { Suspense } from "react";
import SettingsPageClient from "./SettingsPageClient";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 md:p-8">Loading settings...</div>}>
      <SettingsPageClient />
    </Suspense>
  );
}
