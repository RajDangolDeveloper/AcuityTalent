"use client";
import { CandidateApplication } from "@/src/types/recruiter";
import { X } from "lucide-react";
import CandidateCard from "./CandidateCard";

interface CandidateGridModalProps {
  candidates: CandidateApplication[];
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate: (candidateId: number) => void;
}

export default function CandidateGridModal({
  candidates,
  isOpen,
  onClose,
  onSelectCandidate,
}: CandidateGridModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Candidates</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => {
                  onSelectCandidate(candidate.candidateId);
                  onClose();
                }}
              >
                <CandidateCard candidate={candidate} showModal={true} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
