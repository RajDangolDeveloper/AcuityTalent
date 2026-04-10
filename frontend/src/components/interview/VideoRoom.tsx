"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import SimplePeer from "simple-peer";
import { io, Socket } from "socket.io-client";

interface VideoRoomProps {
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onLeave?: () => void;
  roomId: string;
  allowScreenShare?: boolean;
  localParticipantName?: string;
  remoteParticipantName?: string;
  meetingTitle?: string;
  meetingSubtitle?: string;
}

export default function VideoRoom({
  localStream,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onLeave,
  roomId,
  allowScreenShare = false,
  localParticipantName = "You",
  remoteParticipantName = "Participant",
  meetingTitle = "Interview Meeting",
  meetingSubtitle,
}: VideoRoomProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const hasInitiatedOfferRef = useRef(false);
  const socketIdRef = useRef<string | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const pendingSignalsRef = useRef<
    Array<{ kind: "offer" | "answer" | "candidate"; signal: any }>
  >([]);

  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemotePresent, setIsRemotePresent] = useState(false);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const attachRemoteStream = (stream: MediaStream) => {
    if (!remoteVideoRef.current) return;
    remoteVideoRef.current.srcObject = stream;
    remoteVideoRef.current.play().catch(() => undefined);
    setIsConnected(true);
  };

  const resetPeer = () => {
    peerRef.current?.destroy();
    peerRef.current = null;
    hasInitiatedOfferRef.current = false;
    pendingSignalsRef.current = [];
  };

  const queueIncomingSignal = (
    kind: "offer" | "answer" | "candidate",
    signal: any,
  ) => {
    pendingSignalsRef.current.push({ kind, signal });
  };

  const flushPendingSignals = () => {
    const peer = peerRef.current;
    if (!peer || pendingSignalsRef.current.length === 0) return;

    const pending = pendingSignalsRef.current;
    pendingSignalsRef.current = [];

    const orderedSignals = [
      ...pending.filter((item) => item.kind === "offer"),
      ...pending.filter((item) => item.kind === "answer"),
      ...pending.filter((item) => item.kind === "candidate"),
    ];

    orderedSignals.forEach(({ signal }) => {
      try {
        peer.signal(signal);
      } catch (err) {
        console.error("Failed to apply queued WebRTC signal:", err);
      }
    });
  };

  const handleIncomingSignal = (
    kind: "offer" | "answer" | "candidate",
    signal: any,
  ) => {
    const peer = peerRef.current;
    if (!peer) {
      queueIncomingSignal(kind, signal);
      return;
    }

    try {
      peer.signal(signal);
    } catch (err) {
      console.error(`Failed to apply ${kind}:`, err);
      queueIncomingSignal(kind, signal);
    }
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => undefined);
      if (!isScreenSharing) {
        cameraTrackRef.current = localStream.getVideoTracks()[0] || null;
      }
    }
  }, [localStream, isScreenSharing]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const stopScreenShare = () => {
    if (!localStream) return;

    const screenTrack = screenTrackRef.current;
    const cameraTrack = cameraTrackRef.current;

    if (!screenTrack || !cameraTrack) {
      setIsScreenSharing(false);
      return;
    }

    try {
      peerRef.current?.replaceTrack(screenTrack, cameraTrack, localStream);
    } catch (err) {
      console.error("Failed to restore camera track:", err);
    }

    localStream.removeTrack(screenTrack);
    if (!localStream.getVideoTracks().includes(cameraTrack)) {
      localStream.addTrack(cameraTrack);
    }

    screenTrack.stop();
    screenTrackRef.current = null;
    setIsScreenSharing(false);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => undefined);
    }
  };

  const toggleScreenShare = async () => {
    if (!allowScreenShare || !localStream) return;

    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = displayStream.getVideoTracks()[0];
      const currentVideoTrack = localStream.getVideoTracks()[0];

      if (!screenTrack || !currentVideoTrack) return;

      cameraTrackRef.current = currentVideoTrack;
      peerRef.current?.replaceTrack(
        currentVideoTrack,
        screenTrack,
        localStream,
      );

      localStream.removeTrack(currentVideoTrack);
      localStream.addTrack(screenTrack);
      screenTrackRef.current = screenTrack;
      setIsScreenSharing(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(() => undefined);
      }

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Failed to start screen share:", err);
    }
  };

  const handleScreenSharePrompt = async () => {
    if (!allowScreenShare) return;

    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    const confirmed = window.confirm(
      "Do you want to share your screen in this interview?",
    );
    if (!confirmed) return;

    await toggleScreenShare();
  };

  const createPeer = (initiator: boolean) => {
    if (!localStream || peerRef.current) return;

    const peer = new SimplePeer({
      initiator,
      stream: localStream,
      trickle: true,
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    });

    peer.on("signal", (data) => {
      const socket = socketRef.current;
      if (!socket) return;

      if ((data as any).type === "offer") {
        socket.emit("webrtc-offer", {
          roomId,
          offer: data,
          senderId: socket.id,
        });
      } else if ((data as any).type === "answer") {
        socket.emit("webrtc-answer", {
          roomId,
          answer: data,
          senderId: socket.id,
        });
      } else if ((data as any).candidate) {
        socket.emit("webrtc-ice-candidate", {
          roomId,
          candidate: data,
          senderId: socket.id,
        });
      }
    });

    peer.on("connect", () => {
      setIsConnected(true);
      flushPendingSignals();
    });

    peer.on("stream", (stream: MediaStream) => {
      attachRemoteStream(stream);
    });

    peer.on("close", () => {
      setIsConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    peerRef.current = peer;
  };

  const syncParticipants = (participants: string[]) => {
    const mySocketId = socketIdRef.current;
    if (!mySocketId) return;

    const others = participants.filter((id) => id !== mySocketId);
    const hasRemote = others.length > 0;
    setIsRemotePresent(hasRemote);

    if (!hasRemote) {
      setIsConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      resetPeer();
      return;
    }

    if (!peerRef.current) {
      const sorted = [...participants].sort();
      const shouldInitiate = sorted[0] === mySocketId;
      hasInitiatedOfferRef.current = shouldInitiate;
      createPeer(shouldInitiate);
      flushPendingSignals();
    }
  };

  useEffect(() => {
    if (!localStream || !roomId) return;

    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!socketUrl) {
      console.error("NEXT_PUBLIC_BACKEND_URL is not configured");
      return;
    }

    const socket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socketIdRef.current = socket.id || null;
      socket.emit("join-room", roomId);
    });

    socket.on("room-participants", ({ participants }) => {
      if (!Array.isArray(participants)) return;
      syncParticipants(participants);
    });

    socket.on("user-joined", () => {
      setIsRemotePresent(true);
    });

    socket.on("webrtc-offer", ({ offer, senderId }) => {
      if (senderId === socket.id) return;

      if (!peerRef.current) {
        createPeer(false);
      }

      handleIncomingSignal("offer", offer);
    });

    socket.on("webrtc-answer", ({ answer, senderId }) => {
      if (senderId === socket.id) return;
      handleIncomingSignal("answer", answer);
    });

    socket.on("webrtc-ice-candidate", ({ candidate, senderId }) => {
      if (senderId === socket.id) return;
      handleIncomingSignal("candidate", candidate);
    });

    socket.on("user-video-state", ({ senderId, isVideoOn }) => {
      if (senderId !== socket.id) {
        setRemoteVideoEnabled(Boolean(isVideoOn));
      }
    });

    socket.on("user-audio-state", ({ senderId, isAudioOn }) => {
      if (senderId !== socket.id) {
        setRemoteAudioEnabled(Boolean(isAudioOn));
      }
    });

    socket.on("user-left", () => {
      setIsRemotePresent(false);
      setIsConnected(false);
      setRemoteVideoEnabled(true);
      setRemoteAudioEnabled(true);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      resetPeer();
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.disconnect();
      socketRef.current = null;
      socketIdRef.current = null;

      resetPeer();
      setIsConnected(false);
      setIsRemotePresent(false);
      setRemoteVideoEnabled(true);
      setRemoteAudioEnabled(true);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      screenTrackRef.current?.stop();
      screenTrackRef.current = null;
      setIsScreenSharing(false);
    };
  }, [localStream, roomId]);

  useEffect(() => {
    return () => {
      resetPeer();
    };
  }, []);

  const handleToggleVideo = () => {
    onToggleVideo();
    socketRef.current?.emit("toggle-video", {
      roomId,
      senderId: socketRef.current?.id,
      isVideoOn: !isVideoEnabled,
    });
  };

  const handleToggleAudio = () => {
    onToggleAudio();
    socketRef.current?.emit("toggle-audio", {
      roomId,
      senderId: socketRef.current?.id,
      isAudioOn: !isAudioEnabled,
    });
  };

  const handleToggleFullscreen = async () => {
    if (!stageRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await stageRef.current.requestFullscreen();
    } catch (err) {
      console.error("Failed to toggle fullscreen:", err);
    }
  };

  return (
    <div
      ref={stageRef}
      className="relative flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1120] text-white shadow-[0_28px_90px_rgba(0,0,0,0.45)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.2),rgba(2,6,23,0.75))]" />

      <div className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-slate-950/55 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-sky-200/75">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]" />
              Live Meeting
            </div>
            <h1 className="mt-1 truncate text-lg font-semibold text-white md:text-xl">
              {meetingTitle}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {meetingSubtitle ||
                  `${localParticipantName} and ${remoteParticipantName}`}
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(roomId);
                  } catch (err) {
                    console.error("Failed to copy meeting ID:", err);
                  }
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200 transition hover:bg-white/10"
                title="Copy meeting ID"
              >
                Meeting ID: {roomId}
              </button>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              {isRemotePresent
                ? "Participant connected"
                : "Waiting for participant"}
            </div>
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              {isFullscreen ? "Exit full screen" : "Full screen"}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center p-4 pt-24 pb-28">
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />

          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <svg
                    className="h-12 w-12 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {isRemotePresent
                    ? "Connecting the video feed"
                    : "Waiting for your guest"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {isRemotePresent
                    ? "Both people are in the room. The call will attach as soon as media negotiation completes."
                    : "The meeting is live. When the other participant joins, the call will begin automatically."}
                </p>
              </div>
            </div>
          )}

          <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            {isConnected ? "Connected" : "Connecting"}
          </div>

          <div className="absolute right-5 top-5 w-40 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md md:w-52">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`h-32 w-full object-cover md:h-36 ${isVideoEnabled ? "" : "hidden"}`}
            />
            {!isVideoEnabled && (
              <div className="flex h-32 w-full items-center justify-center bg-slate-900/95 md:h-36">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <svg
                      className="h-6 w-6 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-300">Camera off</p>
                </div>
              </div>
            )}
            <div className="border-t border-white/10 bg-slate-950/70 px-3 py-2">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-200">
                <span className="truncate">{localParticipantName} (You)</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
                  {isAudioEnabled ? "Mic on" : "Muted"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 overflow-x-auto">
          <ToolbarButton
            active={isAudioEnabled}
            danger={!isAudioEnabled}
            label={isAudioEnabled ? "Mute" : "Unmute"}
            onClick={handleToggleAudio}
            icon={
              isAudioEnabled ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M12 18a4 4 0 004-4V8a4 4 0 10-8 0v6a4 4 0 004 4z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M19 11a7 7 0 01-14 0"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M12 18v3"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              )
            }
          />

          <ToolbarButton
            active={isVideoEnabled}
            danger={!isVideoEnabled}
            label={isVideoEnabled ? "Stop Video" : "Start Video"}
            onClick={handleToggleVideo}
            icon={
              isVideoEnabled ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              )
            }
          />

          <ToolbarButton
            active={isScreenSharing}
            label={isScreenSharing ? "Stop Share" : "Share Screen"}
            onClick={handleScreenSharePrompt}
            disabled={!allowScreenShare}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M9.75 17L6 21m0 0l-3.75-4M6 21V3m12 4l3.75 4M21.75 11L18 7m0 0v18"
                />
              </svg>
            }
          />

          <ToolbarButton
            label={isFullscreen ? "Exit Full" : "Full Screen"}
            onClick={handleToggleFullscreen}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                />
              </svg>
            }
          />

          <ToolbarButton
            label="Leave"
            danger
            onClick={onLeave}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            }
          />
        </div>
      </div>

      <div className="absolute left-4 top-20 z-20 hidden w-72 rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl lg:block">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
          Participants
        </div>
        <div className="mt-4 space-y-3">
          <ParticipantRow
            name={`${localParticipantName} (You)`}
            status={isAudioEnabled ? "Mic on" : "Muted"}
            online
          />
          <ParticipantRow
            name={remoteParticipantName}
            status={`${remoteVideoEnabled ? "Camera on" : "Camera off"} · ${remoteAudioEnabled ? "Mic on" : "Muted"}`}
            online={isRemotePresent}
          />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  active = false,
  danger = false,
  disabled = false,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`flex min-w-[92px] flex-col items-center gap-2 rounded-2xl px-4 py-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
          : active
            ? "bg-white/12 text-white hover:bg-white/18"
            : "bg-white/6 text-slate-200 hover:bg-white/12"
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${
          danger ? "bg-rose-500/20" : active ? "bg-white/10" : "bg-white/8"
        }`}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function ParticipantRow({
  name,
  status,
  online,
}: {
  name: string;
  status: string;
  online: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-white">{name}</div>
        <div className="truncate text-xs text-slate-400">{status}</div>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
          online
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-amber-500/15 text-amber-300"
        }`}
      >
        {online ? "Online" : "Waiting"}
      </span>
    </div>
  );
}
