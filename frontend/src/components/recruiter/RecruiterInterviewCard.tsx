// src/components/interview/RecruiterInterviewCard.tsx
"use client";

import { useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { Interview, InterviewStatus } from "@/src/types/interview";

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Props {
  interview: Interview;
  typeLabel: string;
  statusConfig: Record<InterviewStatus, StatusConfig>;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  onView: () => void;
  onJoin: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export default function RecruiterInterviewCard({
  interview,
  typeLabel,
  statusConfig,
  isSelected = false,
  onSelect,
  onView,
  onJoin,
  onReschedule,
  onCancel,
  compact = false,
}: Props) {
  const [showActions, setShowActions] = useState(false);
  const status = statusConfig[interview.status];
  const StatusIcon = status.icon;

  const scheduledDate = new Date(interview.scheduledAt);
  const timeStr = scheduledDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isPast = scheduledDate < new Date();
  const canJoin = interview.status === "IN_PROGRESS" && !isPast;

  if (compact) {
    return (
      <div className="group bg-white/85 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3">
          {/* Checkbox for bulk selection */}
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}
              >
                <StatusIcon className="w-3 h-3 inline mr-1" />
                {status.label}
              </span>
              <span className="text-xs text-gray-500">{typeLabel}</span>
            </div>

            <h4 className="font-semibold text-gray-800 truncate">
              {interview.application?.candidate?.name || "Unknown Candidate"}
            </h4>
            <p className="text-sm text-gray-500 truncate">
              {interview.application?.job?.title || "Unknown Position"}
            </p>

            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {scheduledDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {timeStr}
              </span>
              {interview.interviewer && (
                <span className="flex items-center gap-1 truncate">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{interview.interviewer.name}</span>
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    View Details
                  </button>
                  {canJoin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoin();
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Join Interview
                    </button>
                  )}
                  {onReschedule && interview.status === "SCHEDULED" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReschedule();
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Reschedule
                    </button>
                  )}
                  {onCancel && interview.status === "SCHEDULED" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Join Button for canJoin state */}
        {canJoin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-linear-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            <Video className="w-4 h-4" />
            Join Now
          </button>
        )}
      </div>
    );
  }

  // Full list view
  return (
    <div className="group bg-white/85 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Avatar / Initials */}
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
          <span className="text-lg font-semibold text-indigo-700">
            {interview.application?.candidate?.user?.firstName.charAt(0) || "C"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-gray-800">
                {interview.application?.candidate?.user?.firstName ||
                  "Unknown Candidate"}
              </h4>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}
            >
              <StatusIcon className="w-3.5 h-3.5 inline mr-1" />
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              {typeLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              {scheduledDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            {interview.interviewer && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                {interview.interviewer.firstName}
              </span>
            )}
          </div>

          {interview.notes && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              {interview.notes}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  View Full Details
                </button>
                {canJoin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onJoin();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2.5 text-left text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Join as Observer
                  </button>
                )}
                {onReschedule && interview.status === "SCHEDULED" && (
                  <>
                    <hr className="my-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReschedule();
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Reschedule
                    </button>
                  </>
                )}
                {onCancel && interview.status === "SCHEDULED" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Interview
                  </button>
                )}
                <hr className="my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(interview.roomId || "");
                    // Could add toast here
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50"
                >
                  Copy Room ID: {interview.roomId?.slice(0, 8)}...
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
        {canJoin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm"
          >
            <Video className="w-4 h-4" />
            Join Interview
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
