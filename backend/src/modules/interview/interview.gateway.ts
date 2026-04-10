import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' },
})
export class InterviewGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(InterviewGateway.name);
  private readonly roomScreenShares = new Map<string, Set<string>>();

  private emitRoomParticipants(roomId: string) {
    const room = this.server.sockets.adapter.rooms.get(roomId);
    const participants = room ? Array.from(room) : [];

    this.server.to(roomId).emit('room-participants', {
      roomId,
      participants,
    });
  }

  private emitRoomScreenShareState(roomId: string) {
    const sharers = this.roomScreenShares.get(roomId);
    this.server.to(roomId).emit('room-screen-share-state', {
      roomId,
      activeSharers: sharers ? Array.from(sharers) : [],
    });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    this.logger.log(`Client ${client.id} joined room ${roomId}`);
    client.to(roomId).emit('user-joined', client.id);
    this.emitRoomParticipants(roomId);
    this.emitRoomScreenShareState(roomId);
    return { event: 'joined', data: roomId };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const sharers = this.roomScreenShares.get(roomId);
    if (sharers) {
      sharers.delete(client.id);
      if (sharers.size === 0) {
        this.roomScreenShares.delete(roomId);
      }
      this.emitRoomScreenShareState(roomId);
    }

    client.leave(roomId);
    this.logger.log(`Client ${client.id} left room ${roomId}`);
    client.to(roomId).emit('user-left', client.id);
    this.emitRoomParticipants(roomId);
  }

  handleDisconnect(client: Socket) {
    const joinedRooms = Array.from(client.rooms).filter(
      (id) => id !== client.id,
    );

    joinedRooms.forEach((roomId) => {
      const sharers = this.roomScreenShares.get(roomId);
      if (!sharers) return;

      sharers.delete(client.id);
      if (sharers.size === 0) {
        this.roomScreenShares.delete(roomId);
      }
      this.emitRoomScreenShareState(roomId);
    });
  }

  @SubscribeMessage('webrtc-offer')
  handleOffer(
    @MessageBody() data: { roomId: string; offer: any; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client
      .to(data.roomId)
      .emit('webrtc-offer', { offer: data.offer, senderId: data.senderId });
  }

  @SubscribeMessage('webrtc-answer')
  handleAnswer(
    @MessageBody() data: { roomId: string; answer: any; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client
      .to(data.roomId)
      .emit('webrtc-answer', { answer: data.answer, senderId: data.senderId });
  }

  @SubscribeMessage('webrtc-ice-candidate')
  handleIceCandidate(
    @MessageBody() data: { roomId: string; candidate: any; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('webrtc-ice-candidate', {
      candidate: data.candidate,
      senderId: data.senderId,
    });
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(
    @MessageBody()
    data: {
      roomId: string;
      message: string;
      senderName: string;
      timestamp: Date;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.roomId).emit('chat-message', data);
  }

  @SubscribeMessage('toggle-video')
  handleToggleVideo(
    @MessageBody()
    data: { roomId: string; senderId: string; isVideoOn: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('user-video-state', data);
  }

  @SubscribeMessage('toggle-audio')
  handleToggleAudio(
    @MessageBody()
    data: { roomId: string; senderId: string; isAudioOn: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('user-audio-state', data);
  }

  @SubscribeMessage('toggle-screen-share')
  handleToggleScreenShare(
    @MessageBody()
    data: { roomId: string; senderId: string; isScreenSharing: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    let sharers = this.roomScreenShares.get(data.roomId);
    if (!sharers) {
      sharers = new Set<string>();
      this.roomScreenShares.set(data.roomId, sharers);
    }

    if (data.isScreenSharing) {
      sharers.add(data.senderId || client.id);
    } else {
      sharers.delete(data.senderId || client.id);
    }

    if (sharers.size === 0) {
      this.roomScreenShares.delete(data.roomId);
    }

    client.to(data.roomId).emit('toggle-screen-share', data);
    this.emitRoomScreenShareState(data.roomId);
  }
}
