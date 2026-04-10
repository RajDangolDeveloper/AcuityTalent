"use client";

import { useState } from "react";
import { useSendInterviewDecision } from "@/src/hooks/useInterviewApi";

interface DecisionModalProps {
  isOpen: boolean;
  applicationId: number;
  onClose: () => void;
}

export default function DecisionModal({
  isOpen,
  applicationId,
  onClose,
}: DecisionModalProps) {
  const [decision, setDecision] = useState<"OFFER" | "REJECTED">("OFFER");
  const { mutate, isPending } = useSendInterviewDecision();

  if (!isOpen) return null;

  const handleSubmit = () => {
    mutate(
      {
        applicationId,
        decision,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900">Send Decision</h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose the post-interview decision for this candidate.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDecision("OFFER")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              decision === "OFFER"
                ? "border-green-600 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-700"
            }`}
          >
            Offer
          </button>
          <button
            type="button"
            onClick={() => setDecision("REJECTED")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              decision === "REJECTED"
                ? "border-red-600 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-700"
            }`}
          >
            Reject
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-60"
          >
            {isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
