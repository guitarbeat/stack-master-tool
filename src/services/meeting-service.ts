import type {
  MeetingWithParticipants,
  Participant,
  QueueItem,
  ParticipantSnapshot,
  MeetingData
} from "@/types/meeting";

export interface RealtimeCallbacks {
  onParticipantsUpdated?: (participants: Participant[]) => void;
  onQueueUpdated?: (queue: QueueItem[]) => void;
  onMeetingTitleUpdated?: (title: string) => void;
  onParticipantJoined?: (participant: Participant) => void;
  onParticipantLeft?: (participantId: string) => void;
  onNextSpeaker?: (speaker: QueueItem) => void;
  onError?: (error: Error | unknown) => void;
}

export interface IMeetingRealtime {
  subscribeToMeeting(
    meetingId: string,
    meetingCode: string,
    callbacks: RealtimeCallbacks,
  ): () => void;
}

export interface IMeetingService {
  createMeeting(
    title: string,
    facilitatorName: string,
    facilitatorId?: string,
  ): Promise<MeetingData>;

  getMeeting(code: string): Promise<MeetingWithParticipants | null>;

  joinMeeting(
    code: string,
    name: string,
    isFacilitator?: boolean,
  ): Promise<Participant>;

  joinQueue(
    meetingId: string,
    participantId: string,
    queueType?: string,
  ): Promise<QueueItem>;

  leaveQueue(meetingId: string, participantId: string): Promise<void>;

  nextSpeaker(meetingId: string): Promise<QueueItem | null>;

  updateMeetingTitle(meetingId: string, newTitle: string): Promise<void>;

  updateParticipantName(participantId: string, newName: string): Promise<void>;

  reorderQueueItem(
    meetingId: string,
    participantId: string,
    newPosition: number,
  ): Promise<void>;

  removeParticipant(participantId: string): Promise<ParticipantSnapshot>;

  restoreParticipant(participantId: string): Promise<void>;

  leaveMeeting(participantId: string): Promise<void>;

  endMeeting(meetingId: string): Promise<void>;

  updateMeetingCode(meetingId: string, newCode: string): Promise<void>;

  canRejoinAsFacilitator(meetingCode: string, participantName: string): Promise<boolean>;
}
