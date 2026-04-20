"use client";

import VideoRoom from "@/src/components/interview/VideoRoom";
import {
  useInterviewByRoom,
  useMarkInterviewInProgress,
  useMarkInterviewCompleted,
} from "@/src/hooks/useInterviewApi";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";

export default function InterviewRoomPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const roomId = params?.id ? decodeURIComponent(params.id) : "";
  const { data: interview, isLoading, error } = useInterviewByRoom(roomId);
  const markInProgress = useMarkInterviewInProgress();
  const markCompleted = useMarkInterviewCompleted();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const socketRef = useRef<any>(null);

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setIsVideoEnabled(stream.getVideoTracks().length > 0);
      return stream;
    } catch (err) {
      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        setLocalStream(audioOnlyStream);
        setIsVideoEnabled(false);
        return audioOnlyStream;
      } catch {
        throw new Error("Failed to get media stream");
      }
    }
  }, []);

  useEffect(() => {
    initializeMedia();
  }, [initializeMedia]);

  useEffect(() => {
    if (interview && interview.status === "SCHEDULED") {
      markInProgress.mutate(interview.id);
    }
  }, [interview, markInProgress]);

  const handleLeave = useCallback(async () => {
    if (interview) {
      try {
        await markCompleted.mutateAsync({ id: interview.id });
      } catch {}
    }
    localStream?.getTracks().forEach((track) => track.stop());
    socketRef.current?.disconnect();
    router.push("/candidate/interviews");
  }, [interview, localStream, router, markCompleted]);

  const toggleVideo = useCallback(() => {
    if (!localStream) return;

    const cameraTracks = localStream
      .getVideoTracks()
      .filter((track) => !track.getSettings().displaySurface);

    if (cameraTracks.length === 0) return;

    cameraTracks.forEach((track) => {
      track.enabled = !isVideoEnabled;
    });
    setIsVideoEnabled(!isVideoEnabled);
  }, [localStream, isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isAudioEnabled));
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [localStream, isAudioEnabled]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Room Not Found</h2>
          <button
            onClick={() => router.push("/candidate/interviews")}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const interviewerFirstName =
    interview.interviewer?.firstName ||
    interview.interviewer?.user?.firstName ||
    "";
  const interviewerLastName =
    interview.interviewer?.lastName ||
    interview.interviewer?.user?.lastName ||
    "";
  const interviewerName =
    `${interviewerFirstName} ${interviewerLastName}`.trim();
  const candidateName =
    `${interview.application?.candidate?.user?.firstName || ""} ${
      interview.application?.candidate?.user?.lastName || ""
    }`.trim() || "Candidate";
  const scheduledLabel = interview.scheduledAt
    ? new Date(interview.scheduledAt).toLocaleString()
    : "Not specified";

  return (
    <div className="flex flex-col min-h-dvh bg-gray-900 text-white">
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div>
          <h1 className="text-lg font-semibold">Candidate Interview Room</h1>
          <p className="text-sm text-gray-400">
            {interview.application?.job?.title || "Interview"}
          </p>
        </div>
        <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          Live
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div className="lg:col-span-2 flex flex-col">
          <VideoRoom
            localStream={localStream}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            onLeave={handleLeave}
            roomId={interview.roomId}
            allowScreenShare
            localParticipantName={candidateName}
            remoteParticipantName={interviewerName || "Recruiter"}
            meetingTitle={interview.application?.job?.title || "Interview"}
            meetingSubtitle={`${interviewerName || "Recruiter"} with ${candidateName}`}
          />
        </div>
        <div className="lg:col-span-1 space-y-4 h-[60vh] lg:h-auto overflow-y-auto">
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4">
            <h2 className="text-base font-semibold">Interview Details</h2>
            <div className="mt-3 space-y-3 text-sm text-gray-300">
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-400">Interviewer</span>
                <span className="text-right">
                  {interviewerName || "Recruiter"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-400">Type</span>
                <span className="text-right">{interview.interviewType}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-400">Scheduled</span>
                <span className="text-right">{scheduledLabel}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-400">Status</span>
                <span className="rounded-full bg-indigo-600/30 text-indigo-300 px-2 py-0.5 text-xs font-medium">
                  {interview.status}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4">
            <h2 className="text-base font-semibold">Before You Start</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-300 list-disc list-inside">
              <li>Keep your camera at eye level and your face well lit.</li>
              <li>Mute when you are not speaking in noisy environments.</li>
              <li>Have your portfolio or resume ready for quick reference.</li>
              <li>Use the Leave button only when the interview is complete.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300">
            <p className="text-gray-400">Connection</p>
            <p className="mt-1 font-medium text-white">
              {localStream
                ? "Camera and microphone are active"
                : "Initializing devices..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
