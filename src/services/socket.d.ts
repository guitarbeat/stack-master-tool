import { Socket } from 'socket.io-client';

interface JoinMeetingData {
  meetingData: any;
  participants: any[];
  queue: any[];
}

interface SocketServiceInterface {
  socket: Socket | null;
  isConnected: boolean;
  connecting: boolean;
  reconnectAttempts: number;
  
  connect(): Socket;
  disconnect(): void;
  
  joinMeeting(
    meetingCode: string,
    participantName: string,
    isFacilitator?: boolean
  ): Promise<JoinMeetingData>;
  
  joinQueue(type?: string): void;
  leaveQueue(): void;
  nextSpeaker(): void;
  
  updateMeetingTitle(newTitle: string): void;
  updateParticipantName(participantId: string, newName: string): void;
  
  onQueueUpdated(callback: (queue: any[]) => void): void;
  onParticipantsUpdated(callback: (participants: any[]) => void): void;
  onParticipantJoined(callback: (data: any) => void): void;
  onParticipantLeft(callback: (data: any) => void): void;
  onNextSpeaker(callback: (speaker: any) => void): void;
  onMeetingTitleUpdated(callback: (data: any) => void): void;
  onParticipantNameUpdated(callback: (data: any) => void): void;
  onError(callback: (error: any) => void): void;
  
  off(event: string, callback: Function): void;
  removeAllListeners(): void;
}

declare const socketService: SocketServiceInterface;
export default socketService;
