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
  prioritizeRemoteScreenShare?: boolean;
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
  prioritizeRemoteScreenShare = false,
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
  const displayStreamRef = useRef<MediaStream | null>(null);
  const remoteMediaStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRefreshTimeoutRef = useRef<number | null>(null);
  const pendingSignalsRef = useRef<
    Array<{ kind: "offer" | "answer" | "candidate"; signal: any }>
  >([]);

  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
  const [isRemotePresent, setIsRemotePresent] = useState(false);
  const [hasRemoteVideoTrack, setHasRemoteVideoTrack] = useState(false);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const updateOutgoingVideoTrack = async (
    nextTrack: MediaStreamTrack | null,
    previousTrack?: MediaStreamTrack | null,
  ) => {
    const peer = peerRef.current;
    if (!peer) return;

    if (previousTrack && nextTrack) {
      try {
        peer.replaceTrack(previousTrack, nextTrack, localStream as MediaStream);
        return;
      } catch (err) {
      }
    }

    if (previousTrack && !nextTrack) {
      try {
        peer.removeTrack(previousTrack, localStream as MediaStream);
        return;
      } catch (err) {
      }
    }

    if (!previousTrack && nextTrack) {
      try {
        peer.addTrack(nextTrack, localStream as MediaStream);
        return;
      } catch (err) {
      }
    }

    
    try {
      const pc = (peer as any)._pc as RTCPeerConnection | undefined;
      if (!pc) return;
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");

      if (sender) {
        await sender.replaceTrack(nextTrack);
      } else if (nextTrack) {
        pc.addTrack(nextTrack, localStream as MediaStream);
      }
    } catch (err) {
    }
  };

  const updateRemoteVideoAvailability = (stream?: MediaStream) => {
    const remoteStream =
      stream ||
      remoteMediaStreamRef.current ||
      (remoteVideoRef.current?.srcObject as MediaStream | null);
    if (!remoteStream) {
      setHasRemoteVideoTrack(false);
      return;
    }

    const hasLiveVideo = remoteStream
      .getVideoTracks()
      .some((track) => track.readyState === "live");
    setHasRemoteVideoTrack(hasLiveVideo);
  };

  const bindRemoteVideoTrackEvents = (stream: MediaStream) => {
    stream.onaddtrack = (event: MediaStreamTrackEvent) => {
      if (event.track.kind === "video") {
        setHasRemoteVideoTrack(true);
      }
    };

    stream.onremovetrack = (event: MediaStreamTrackEvent) => {
      if (event.track.kind === "video") {
        scheduleRemoteVideoAvailabilityRefresh();
      }
    };

    stream.getVideoTracks().forEach((track) => {
      track.onunmute = () => {
        setHasRemoteVideoTrack(true);
      };
      track.onmute = () => {
        scheduleRemoteVideoAvailabilityRefresh();
      };
      track.onended = () => {
        updateRemoteVideoAvailability(stream);
        if (!isRemoteScreenSharing) {
          scheduleRemoteVideoAvailabilityRefresh();
        }
      };
    });
  };

  const scheduleRemoteVideoAvailabilityRefresh = () => {
    if (remoteVideoRefreshTimeoutRef.current !== null) {
      window.clearTimeout(remoteVideoRefreshTimeoutRef.current);
    }

    
    remoteVideoRefreshTimeoutRef.current = window.setTimeout(() => {
      updateRemoteVideoAvailability();
      remoteVideoRefreshTimeoutRef.current = null;
    }, 350);
  };

  const attachRemoteStream = (stream: MediaStream) => {
    if (!remoteVideoRef.current) return;
    remoteMediaStreamRef.current = stream;
    remoteVideoRef.current.srcObject = stream;
    remoteVideoRef.current.play().catch(() => undefined);
    bindRemoteVideoTrackEvents(stream);
    updateRemoteVideoAvailability(stream);
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
      queueIncomingSignal(kind, signal);
    }
  };

  const hasLocalVideoTrack = Boolean(localStream?.getVideoTracks().length);
  const showLocalVideo = hasLocalVideoTrack && isVideoEnabled;
  const showRemoteVideo =
    isConnected &&
    hasRemoteVideoTrack &&
    (isRemoteScreenSharing || remoteVideoEnabled);
  const showRemoteOnMainStage =
    (prioritizeRemoteScreenShare && isRemoteScreenSharing) || !isScreenSharing;

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

    if (!screenTrack) {
      setIsScreenSharing(false);
      return;
    }

    try {
      void updateOutgoingVideoTrack(cameraTrack ?? null, screenTrack);

      localStream.removeTrack(screenTrack);
      if (cameraTrack && !localStream.getVideoTracks().includes(cameraTrack)) {
        localStream.addTrack(cameraTrack);
      }
      screenTrack.stop();

      screenTrackRef.current = null;
      displayStreamRef.current = null;
      cameraTrackRef.current = localStream.getVideoTracks()[0] || null;
      setIsScreenSharing(false);

      socketRef.current?.emit("toggle-screen-share", {
        roomId,
        senderId: socketRef.current?.id,
        isScreenSharing: false,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(() => undefined);
      }
    } catch (err) {
      setIsScreenSharing(false);
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
        audio: false,
      });

      const screenTrack = displayStream.getVideoTracks()[0];
      if (!screenTrack) {
        displayStream.getTracks().forEach((track) => track.stop());
        return;
      }

      const currentVideoTrack = localStream.getVideoTracks()[0];
      
      if (currentVideoTrack) {
        cameraTrackRef.current = currentVideoTrack;
      } else {
        cameraTrackRef.current = null;
      }

      displayStreamRef.current = displayStream;
      screenTrackRef.current = screenTrack;

      if (currentVideoTrack) {
        void updateOutgoingVideoTrack(screenTrack, currentVideoTrack);
        localStream.removeTrack(currentVideoTrack);
      } else if (peerRef.current) {
        void updateOutgoingVideoTrack(screenTrack, null);
      }

      localStream.addTrack(screenTrack);

      setIsScreenSharing(true);

      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(() => undefined);
      }

      
      screenTrack.onended = () => {
        stopScreenShare();
      };

      
      socketRef.current?.emit("toggle-screen-share", {
        roomId,
        senderId: socketRef.current?.id,
        isScreenSharing: true,
      });
    } catch (err: any) {
      
      if (err.name !== "NotAllowedError") {
      }
      setIsScreenSharing(false);
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

    peer.on("track", (track: MediaStreamTrack, stream: MediaStream) => {
      attachRemoteStream(stream);
      if (track.kind === "video") {
        setHasRemoteVideoTrack(true);
        bindRemoteVideoTrackEvents(stream);
      }
    });

    peer.on("close", () => {
      setIsConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    peer.on("error", (err) => {
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

    socket.on("toggle-screen-share", ({ senderId, isScreenSharing }) => {
      if (senderId !== socket.id) {
        setIsRemoteScreenSharing(Boolean(isScreenSharing));
        if (isScreenSharing) {
          
          setHasRemoteVideoTrack(true);
        }
        if (isScreenSharing && remoteVideoRefreshTimeoutRef.current !== null) {
          window.clearTimeout(remoteVideoRefreshTimeoutRef.current);
          remoteVideoRefreshTimeoutRef.current = null;
        }
        if (!isScreenSharing) {
          scheduleRemoteVideoAvailabilityRefresh();
        }
      }
    });

    socket.on("room-screen-share-state", ({ activeSharers }) => {
      if (!Array.isArray(activeSharers)) return;
      const myId = socket.id;
      const hasRemoteSharer = activeSharers.some((id: string) => id !== myId);
      setIsRemoteScreenSharing(hasRemoteSharer);
      if (hasRemoteSharer && remoteVideoRefreshTimeoutRef.current !== null) {
        window.clearTimeout(remoteVideoRefreshTimeoutRef.current);
        remoteVideoRefreshTimeoutRef.current = null;
      }
      if (!hasRemoteSharer) {
        scheduleRemoteVideoAvailabilityRefresh();
      }
    });

    socket.on("user-left", () => {
      setIsRemotePresent(false);
      setHasRemoteVideoTrack(false);
      setIsConnected(false);
      setRemoteVideoEnabled(true);
      setRemoteAudioEnabled(true);
      setIsRemoteScreenSharing(false);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      remoteMediaStreamRef.current = null;

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
      setHasRemoteVideoTrack(false);
      setRemoteVideoEnabled(true);
      setRemoteAudioEnabled(true);
      setIsRemoteScreenSharing(false);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      remoteMediaStreamRef.current = null;

      screenTrackRef.current?.stop();
      screenTrackRef.current = null;
      displayStreamRef.current?.getTracks().forEach((track) => track.stop());
      displayStreamRef.current = null;
      if (remoteVideoRefreshTimeoutRef.current !== null) {
        window.clearTimeout(remoteVideoRefreshTimeoutRef.current);
        remoteVideoRefreshTimeoutRef.current = null;
      }
      setIsScreenSharing(false);
    };
  }, [localStream, roomId]);

  useEffect(() => {
    return () => {
      resetPeer();
    };
  }, []);

  useEffect(() => {
    const remoteVideo = remoteVideoRef.current;
    if (!remoteVideo) return;

    const handleRemoteMediaReady = () => {
      updateRemoteVideoAvailability();
    };

    remoteVideo.addEventListener("loadeddata", handleRemoteMediaReady);
    remoteVideo.addEventListener("playing", handleRemoteMediaReady);
    remoteVideo.addEventListener("canplay", handleRemoteMediaReady);

    return () => {
      remoteVideo.removeEventListener("loadeddata", handleRemoteMediaReady);
      remoteVideo.removeEventListener("playing", handleRemoteMediaReady);
      remoteVideo.removeEventListener("canplay", handleRemoteMediaReady);
    };
  }, []);

  const handleToggleVideo = () => {
    if (!hasLocalVideoTrack || isScreenSharing) return;

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
          {}
          {showRemoteOnMainStage ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`h-full w-full ${isRemoteScreenSharing ? "object-contain bg-black" : "object-cover"}`}
            />
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          )}

          {!showRemoteVideo && showRemoteOnMainStage && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85">
              <div className="max-w-md text-center">
                <ProfileAvatar
                  className="mx-auto mb-5 h-24 w-24"
                  iconClassName="h-12 w-12"
                />
                <h2 className="text-xl font-semibold text-white">
                  {!isRemotePresent
                    ? "Waiting for your guest"
                    : isRemoteScreenSharing
                      ? "Viewing shared screen"
                      : hasRemoteVideoTrack
                        ? "Connecting the video feed"
                        : "Audio-only call"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {!isRemotePresent
                    ? "The meeting is live. When the other participant joins, the call will begin automatically."
                    : isRemoteScreenSharing
                      ? "The participant is sharing their screen. Content should appear on the main stage."
                      : hasRemoteVideoTrack
                        ? "Both people are in the room. The call will attach as soon as media negotiation completes."
                        : "The participant joined without video, so the interview continues with audio only."}
                </p>
              </div>
            </div>
          )}

          <div className="absolute left-5 top-5 flex items-center gap-3">
            <div className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              {isConnected ? "Connected" : "Connecting"}
            </div>
            {isRemoteScreenSharing && (
              <div className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-200 backdrop-blur-md">
                Viewing shared screen
              </div>
            )}
          </div>

          <div className="absolute right-5 top-5 w-40 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md md:w-52">
            {}
            {!showRemoteOnMainStage ? (
              <>
                <div className="flex h-32 w-full items-center justify-center bg-slate-900/95 md:h-36">
                  <ProfileAvatar
                    className="h-14 w-14 md:h-16 md:w-16"
                    iconClassName="h-7 w-7 md:h-8 md:w-8"
                  />
                </div>
              </>
            ) : (
              <>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`h-32 w-full object-cover md:h-36 ${showLocalVideo ? "" : "hidden"}`}
                />
                {!showLocalVideo && (
                  <div className="flex h-32 w-full items-center justify-center bg-slate-900/95 md:h-36">
                    <ProfileAvatar
                      className="h-14 w-14 md:h-16 md:w-16"
                      iconClassName="h-7 w-7 md:h-8 md:w-8"
                    />
                  </div>
                )}
              </>
            )}
            <div className="border-t border-white/10 bg-slate-950/70 px-3 py-2">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-200">
                <span className="truncate">{localParticipantName} (You)</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
                  {isAudioEnabled ? "Mic on" : "Muted"}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-slate-400">
                {isScreenSharing
                  ? "Sharing screen"
                  : showLocalVideo
                    ? "Camera on"
                    : "Audio only"}
              </p>
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
            label={
              hasLocalVideoTrack
                ? isVideoEnabled
                  ? "Stop Video"
                  : "Start Video"
                : "Audio only"
            }
            onClick={hasLocalVideoTrack ? handleToggleVideo : undefined}
            disabled={!hasLocalVideoTrack || isScreenSharing}
            icon={
              hasLocalVideoTrack && isVideoEnabled ? (
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

      <div className="absolute right-4 top-6 z-20 flex flex-col gap-3">
        <div className="group relative">
          <ProfileAvatar
            className="h-16 w-16 cursor-pointer transition hover:ring-2 hover:ring-blue-400"
            iconClassName="h-8 w-8"
          />
          <div className="absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-white backdrop-blur-md group-hover:block">
            {localParticipantName} (You)
          </div>
        </div>
        {isRemotePresent && (
          <div className="group relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-linear-to-br from-slate-700 via-slate-800 to-slate-900 cursor-pointer transition hover:ring-2 hover:ring-green-400">
              {hasRemoteVideoTrack ? (
                <svg
                  className="h-8 w-8 text-slate-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M15 14a4 4 0 10-6 0m6 0a7 7 0 11-6 0m6 0v1a3 3 0 01-3 3H9a3 3 0 01-3-3v-1"
                  />
                </svg>
              ) : (
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              )}
            </div>
            <div className="absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-white backdrop-blur-md group-hover:block">
              {remoteParticipantName}
            </div>
          </div>
        )}
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

function ProfileAvatar({
  className = "h-24 w-24",
  iconClassName = "h-12 w-12",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full border border-white/10 bg-linear-to-br from-slate-700 via-slate-800 to-slate-900 ${className}`}
    >
      <svg
        className={`${iconClassName} text-slate-200`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M15 14a4 4 0 10-6 0m6 0a7 7 0 11-6 0m6 0v1a3 3 0 01-3 3H9a3 3 0 01-3-3v-1"
        />
      </svg>
    </div>
  );
}
