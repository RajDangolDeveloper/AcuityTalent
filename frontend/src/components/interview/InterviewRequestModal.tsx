import {
  ActionType,
  InterviewRequest,
  InterviewRequestStatus,
  InterviewType,
} from "@/src/types/interview";
import {
  Calendar,
  CheckCircle,
  RefreshCw,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ViewDependentTime } from "@/src/utils";

interface InterviewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: InterviewRequest;
  onUpdate: (
    request: InterviewRequest,
    status: ActionType,
    startingDateTime: string | undefined,
    endingDateTime: string | undefined,
    selectedDateTime: string | undefined,
  ) => Promise<void>;
}

export default function InterviewRequestModal({
  isOpen,
  onClose,
  request,
  onUpdate,
}: InterviewRequestModalProps) {
  const [action, setAction] = useState<ActionType | null>(ActionType.ACCEPTED);
  const [startingDateTime, setStartingDateTime] = useState<string>("");
  const [endingDateTime, setEndingDateTime] = useState<string>("");
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateRange = () => {
    if (
      !request.availableDateRange ||
      request.availableDateRange.length === 0
    ) {
      return "No date range available";
    }
    const start = new Date(request.availableDateRange[0]);
    const end = new Date(
      request.availableDateRange[request.availableDateRange.length - 1],
    );
    return `${format(start, "PPP")} – ${format(end, "PPP")}`;
  };

  const isDateInRange = (date: string): boolean => {
    if (
      !request.availableDateRange ||
      request.availableDateRange.length === 0
    ) {
      return false;
    }
    const check = new Date(date);
    const start = new Date(request.availableDateRange[0]);
    const end = new Date(
      request.availableDateRange[request.availableDateRange.length - 1],
    );
    return check >= start && check <= end;
  };

  const handleSubmit = async () => {
    if (!action) {
      setError("Please select an action first.");
      return;
    }

    if (action === ActionType.REJECTED) {
      setIsSubmitting(true);
      try {
        await onUpdate(
          request,
          ActionType.REJECTED,
          undefined,
          undefined,
          undefined,
        );
        onClose();
      } catch (err) {
        setError("Failed to reject the interview request. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (
      action === ActionType.RESCHEDUELED &&
      !startingDateTime &&
      !endingDateTime
    ) {
      setError("Please select a date and time.");
      return;
    }

    if (action === ActionType.ACCEPTED && !selectedDateTime) {
      setError("Please select a date and time.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const startingDateTimeString =
      startingDateTime === "" ? "" : new Date(startingDateTime).toISOString();
    const endingDateTimeString =
      endingDateTime === "" ? "" : new Date(endingDateTime).toISOString();
    const selectedDateTimeString =
      selectedDateTime === "" ? "" : new Date(selectedDateTime).toISOString();

    try {
      await onUpdate(
        request,
        action,
        startingDateTimeString,
        endingDateTimeString,
        selectedDateTimeString,
      );
      onClose();
    } catch (err) {
      setError("Failed to update the interview request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAction(null);
    setSelectedDateTime("");
    setStartingDateTime("");
    setEndingDateTime("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {request.status ===
        (InterviewRequestStatus.CONFIRMED ||
          InterviewRequestStatus.DECLINED) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white rounded-t-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">Interview Request</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {request.job?.title || "Position"}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-white transition"
                >
                  {" "}
                  ✕
                </button>
              </div>
            </div>
            <div className="py-4 px-3">
              <div className="flex gap-4 items-center justify-center">
                <div className="h-18 w-18 shrink-0 rounded-full border border-gray-300 bg-white text-center text-[10px] font-semibold leading-tight text-gray-700 flex flex-col items-center justify-center">
                  <span>
                    {new Date(request.selectedDateTime)
                      .toLocaleDateString("en-US", { month: "short" })
                      .toUpperCase()}
                  </span>
                  <span className="text-lg leading-none">
                    {new Date(request.selectedDateTime).getDate()}
                  </span>
                </div>
                <div className=" w-1/2 ">
                  <div className="flex justify-between items-center w-full">
                    <div className="font-bold text-2xl">
                      {request.job.title}
                    </div>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <div>{request.job.employmentType}</div>
                  </div>
                </div>
                <div className="font-semibold border border-gray-800 rounded-md py-1 px-2">
                  {request.job.salaryRange}
                </div>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      )}
      {request.status === InterviewRequestStatus.PENDING_RECRUITER && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white rounded-t-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">Interview Request</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {request.job?.title || "Position"}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {request.status ===
        (InterviewRequestStatus.SENT ||
          InterviewRequestStatus.PENDING_CANDIDATE) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white rounded-t-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">Interview Request</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {request.job?.title || "Position"}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    request.status === "SENT"
                      ? "bg-blue-100 text-blue-700"
                      : request.status === "ACCEPTED"
                        ? "bg-green-100 text-green-700"
                        : request.status === "RESCHEDULED"
                          ? "bg-yellow-100 text-yellow-700"
                          : request.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {request.status}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Available Date Range</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {formatDateRange()}
                </p>
                {request.selectedDateTime && (
                  <div className="mt-2 text-sm text-slate-700">
                    <span className="font-medium">Suggested:</span>{" "}
                    {format(new Date(request.selectedDateTime), "PPP 'at' p")}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Response
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAction(ActionType.ACCEPTED)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                      action === ActionType.ACCEPTED
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50/50"
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                    Accept
                  </button>
                  <button
                    onClick={() => setAction(ActionType.RESCHEDUELED)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                      action === ActionType.RESCHEDUELED
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-slate-200 text-slate-600 hover:border-yellow-300 hover:bg-yellow-50/50"
                    }`}
                  >
                    <RefreshCw className="w-5 h-5 mx-auto mb-1" />
                    Reschedule
                  </button>
                  <button
                    onClick={() => setAction(ActionType.REJECTED)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                      action === ActionType.REJECTED
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50/50"
                    }`}
                  >
                    <XCircle className="w-5 h-5 mx-auto mb-1" />
                    Reject
                  </button>
                </div>
              </div>

              {action && action !== ActionType.REJECTED && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {action === ActionType.ACCEPTED
                      ? "Pick your preferred time"
                      : "Suggest a new time"}
                  </label>
                  {action === ActionType.ACCEPTED ? (
                    <input
                      type="datetime-local"
                      value={selectedDateTime}
                      onChange={(e) => setSelectedDateTime(e.target.value)}
                      min={request.availableDateRange[0]?.slice(0, 16) || ""}
                      max={
                        request.availableDateRange[
                          request.availableDateRange.length - 1
                        ]?.slice(0, 16) || ""
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex gap-4">
                      <input
                        type="datetime-local"
                        value={startingDateTime}
                        onChange={(e) => setStartingDateTime(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />{" "}
                      <input
                        type="datetime-local"
                        value={endingDateTime}
                        onChange={(e) => setEndingDateTime(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />{" "}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1.5">
                    Select a date & time within the available range.
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Response"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
