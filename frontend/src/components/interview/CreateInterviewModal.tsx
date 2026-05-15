"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useCreateInterview } from "@/src/hooks/useInterviewApi";
import { InterviewType } from "@/src/types/interview";

interface CreateInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  interviewerId: number;
  defaultType?: InterviewType;
}

export default function CreateInterviewModal({
  isOpen,
  onClose,
  applicationId,
  interviewerId,
  defaultType = InterviewType.SCREENING,
}: CreateInterviewModalProps) {
  const [interviewType, setInterviewType] =
    useState<InterviewType>(defaultType);
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createInterview = useCreateInterview();

  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!scheduledAt) {
      setErrorMessage("Please choose a date and time.");
      return;
    }

    setErrorMessage(null);

    createInterview.mutate(
      {
        applicationId,
        interviewerId,
        interviewType,
        scheduledAt: new Date(scheduledAt).toISOString(),
        meetingLink: meetingLink || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-950 tracking-tight">
              Schedule Interview
            </h2>
            <p className="text-gray-600 mt-1">Create a new interview slot</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage}
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-gray-800">
              Interview Type
            </label>
            <select
              value={interviewType}
              onChange={(e) =>
                setInterviewType(e.target.value as InterviewType)
              }
              className="mt-2 w-full border border-gray-200 rounded-xl h-12 px-4"
            >
              <option value={InterviewType.SCREENING}>Screening</option>
              <option value={InterviewType.TECHNICAL}>Technical</option>
              <option value={InterviewType.FINAL}>Final</option>
              <option value={InterviewType.HR}>HR</option>
              <option value={InterviewType.SYSTEM_DESIGN}>System Design</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-800">
              Date and Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minDateTime}
              required
              className="mt-2 w-full border border-gray-200 rounded-xl h-12 px-4"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-800">
              Meeting Link (optional)
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="mt-2 w-full border border-gray-200 rounded-xl h-12 px-4"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-800">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preparation notes for this round"
              className="mt-2 w-full border border-gray-200 rounded-xl min-h-24 px-4 py-3"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createInterview.isPending}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-white disabled:opacity-60"
            >
              {createInterview.isPending ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
