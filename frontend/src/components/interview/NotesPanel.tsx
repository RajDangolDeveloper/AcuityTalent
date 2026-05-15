"use client";

import { useState, useEffect } from "react";
import { useUpdateInterviewNotes } from "@/src/hooks/useInterviewApi";

interface NotesPanelProps {
  interviewId: number;
  initialNotes: string;
}

export default function NotesPanel({
  interviewId,
  initialNotes,
}: NotesPanelProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveMutation = useUpdateInterviewNotes({
    onSuccess: () => {
      setIsSaving(false);
      setLastSaved(new Date());
      setSaveError(null);
    },
    onError: () => {
      setIsSaving(false);
      setSaveError("Failed to save notes. Please try again.");
    },
  });

  const handleSave = () => {
    if (notes === initialNotes && !isSaving) return;
    setIsSaving(true);
    saveMutation.mutate({ id: interviewId, notes });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSave();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== initialNotes) handleSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [notes, initialNotes]);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-200">Recruiter Notes</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {isSaving ? (
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Saving...
            </span>
          ) : lastSaved ? (
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          ) : (
            <span>Press Ctrl+Enter to save</span>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {saveError && (
          <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {saveError}
          </div>
        )}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add notes about the candidate's performance, technical skills, communication, and hiring recommendation..."
          className="w-full h-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm leading-relaxed"
        />
      </div>

      <div className="p-3 border-t border-gray-700 bg-gray-800/50 flex justify-end gap-2">
        <button
          onClick={() => setNotes(initialNotes)}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition rounded-md hover:bg-gray-700"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || notes === initialNotes}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-md text-sm font-medium transition flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          Save Notes
        </button>
      </div>
    </div>
  );
}
