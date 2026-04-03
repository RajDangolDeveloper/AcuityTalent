"use client";

import NotesPanel from "@/src/components/interview/NotesPanel";
import VideoRoom from "@/src/components/interview/VideoRoom";
import {
  useInterviewByRoom,
  useMarkInterviewInProgress,
  useMarkInterviewCompleted,
} from "@/src/hooks/useInterviewApi";
import { useRouter } from "next/router";
import { useState, useRef, useCallback, useEffect } from "react";

export default function InterviewRoomPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: interview, isLoading, error } = useInterviewByRoom(params.id);
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
      return stream;
    } catch (err) {
      console.error("Failed to get media stream:", err);
      throw err;
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
      } catch (err) {
        console.error("Failed to mark completed:", err);
      }
    }
    localStream?.getTracks().forEach((track) => track.stop());
    socketRef.current?.disconnect();
    router.push("/dashboard/interviews");
  }, [interview, localStream, router, markCompleted]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isVideoEnabled));
      setIsVideoEnabled(!isVideoEnabled);
    }
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
            onClick={() => router.push("/dashboard/interviews")}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div>
          <h1 className="text-lg font-semibold">
            {interview.application?.job?.title} Interview
          </h1>
          <p className="text-sm text-gray-400">
            {interview.interviewer.firstName} {interview.interviewer.lastName}
          </p>
        </div>
        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition flex items-center gap-2"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Leave Interview
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div className="lg:col-span-2 flex flex-col">
          <VideoRoom
            localStream={localStream}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            roomId={interview.roomId}
          />
        </div>
        <div className="lg:col-span-1 h-[60vh] lg:h-auto">
          <NotesPanel
            interviewId={interview.id}
            initialNotes={interview.notes || ""}
          />
        </div>
      </div>
    </div>
  );
}
