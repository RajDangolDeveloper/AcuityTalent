import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' },
})
export class InterviewGateway {
  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(InterviewGateway.name);

  private emitRoomParticipants(roomId: string) {
    const room = this.server.sockets.adapter.rooms.get(roomId);
    const participants = room ? Array.from(room) : [];

    this.server.to(roomId).emit('room-participants', {
      roomId,
      participants,
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
    return { event: 'joined', data: roomId };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(roomId);
    this.logger.log(`Client ${client.id} left room ${roomId}`);
    client.to(roomId).emit('user-left', client.id);
    this.emitRoomParticipants(roomId);
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
}
