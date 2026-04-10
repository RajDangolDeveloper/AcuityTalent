"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import NotesPanel from "@/src/components/interview/NotesPanel";
import VideoRoom from "@/src/components/interview/VideoRoom";
import DecisionModal from "@/src/components/interview/DecisionModal";
import {
  useInterviewByRoom,
  useMarkInterviewCompleted,
  useMarkInterviewInProgress,
} from "@/src/hooks/useInterviewApi";

export default function RecruiterInterviewRoomPage() {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const roomId = params?.roomId ? decodeURIComponent(params.roomId) : "";
  const { data: session } = useSession();
  const { data: interview, isLoading, error } = useInterviewByRoom(roomId);
  const markInProgress = useMarkInterviewInProgress();
  const markCompleted = useMarkInterviewCompleted();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const socketRef = useRef<any>(null);

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
    } catch (err) {
      console.error("Failed to get media stream:", err);
    }
  }, []);

  useEffect(() => {
    initializeMedia();
  }, [initializeMedia]);

  useEffect(() => {
    if (interview?.status === "SCHEDULED") {
      markInProgress.mutate(interview.id);
    }
  }, [interview?.id, interview?.status]);

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

    if (session?.user?.role === "RECRUITER" && interview?.application?.id) {
      setShowDecisionModal(true);
      return;
    }

    router.push("/recruiter/interview");
  }, [interview, localStream, session?.user?.role, router]);

  const toggleVideo = useCallback(() => {
    if (!localStream) return;

    localStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !isVideoEnabled));
    setIsVideoEnabled(!isVideoEnabled);
  }, [localStream, isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    if (!localStream) return;

    localStream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !isAudioEnabled));
    setIsAudioEnabled(!isAudioEnabled);
  }, [localStream, isAudioEnabled]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Room Not Found</h2>
          <button
            onClick={() => router.push("/recruiter/interview")}
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

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div>
            <h1 className="text-lg font-semibold">
              {interview.application?.job?.title} Interview
            </h1>
            <p className="text-sm text-gray-400">
              {`${interviewerFirstName} ${interviewerLastName}`.trim()}
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
              localParticipantName={interviewerName || "Interviewer"}
              remoteParticipantName={candidateName}
              meetingTitle={interview.application?.job?.title || "Interview"}
              meetingSubtitle={`${interviewerName || "Recruiter"} with ${candidateName}`}
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

      <DecisionModal
        isOpen={showDecisionModal}
        applicationId={interview.application.id}
        onClose={() => {
          setShowDecisionModal(false);
          router.push("/recruiter/interview");
        }}
      />
    </>
  );
}
