"use client";

import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";

interface VideoRoomProps {
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  roomId: string;
}

export default function VideoRoom({
  localStream,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  roomId,
}: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const setupPeerConnection = () => {
    if (!localStream) return;

    const peer = new SimplePeer({
      initiator: true,
      stream: localStream,
      trickle: true,
    });

    peer.on("signal", (data) => {
      // Send offer via socket
    });

    peer.on("stream", (stream: MediaStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setIsConnected(true);
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    peerRef.current = peer;
  };

  useEffect(() => {
    if (localStream) {
      setupPeerConnection();
    }

    return () => {
      peerRef.current?.destroy();
    };
  }, [localStream]);

  return (
    <div className="relative flex-1 bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
      {/* Remote Video (Large) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-gray-900"
        />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-gray-400">
                Waiting for interviewer to join...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Small) */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-xl overflow-hidden border-2 border-gray-600 shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${isVideoEnabled ? "" : "hidden"}`}
        />
        {!isVideoEnabled && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-gray-600 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-400">Camera Off</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 bg-gray-800/90 backdrop-blur-sm p-3 rounded-full border border-gray-700">
        <button
          onClick={onToggleAudio}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isAudioEnabled
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isAudioEnabled ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          )}
        </button>
        <button
          onClick={onToggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isVideoEnabled
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isVideoEnabled ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Recording Indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 px-3 py-1.5 rounded-full">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-xs font-medium">Recording</span>
      </div>
    </div>
  );
}
