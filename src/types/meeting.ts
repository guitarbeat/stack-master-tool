export interface MeetingData {
  title: string;
  code: string;
  facilitator: string;
  createdAt?: Date;
}

export interface Participant {
  id: string;
  name: string;
  isFacilitator: boolean;
  hasRaisedHand: boolean;
  joinedAt?: Date;
}

export interface SpeakingQueue {
  id: string;
  participantName: string;
  type: string;
  timestamp: number;
}

export interface CurrentSpeaker {
  participantName: string;
  startedSpeakingAt?: Date;
}
