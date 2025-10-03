declare module '@/services/socket' {
  interface SocketService {
    connect(): Promise<any>;
    disconnect(): void;
    joinMeeting(meetingCode: string, participantName: string, isFacilitator?: boolean): Promise<any>;
    joinQueue(type?: string): void;
    leaveQueue(): void;
    nextSpeaker(): void;
    onQueueUpdated(callback: (data: any) => void): void;
    onParticipantsUpdated(callback: (data: any) => void): void;
    onParticipantJoined(callback: (data: any) => void): void;
    onParticipantLeft(callback: (data: any) => void): void;
    onNextSpeaker(callback: (data: any) => void): void;
    onError(callback: (error: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
    removeAllListeners(): void;
  }

  const socketService: SocketService;
  export default socketService;
}