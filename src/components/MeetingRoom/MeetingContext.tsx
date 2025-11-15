import React from "react";
import type {
  MeetingData,
  Participant,
  SpeakingQueue,
  CurrentSpeaker,
} from "@/types/meeting";

interface MeetingContextProps {
  meetingData: MeetingData;
  participants: Participant[];
  speakingQueue: SpeakingQueue[];
  currentSpeaker?: CurrentSpeaker;
  totalSpeakingTime?: number; // in seconds
  isWatching?: boolean;
  userRole?: string;
  onAddToQueue?: () => void;
  onRemoveFromQueue?: () => void;
  onReorderQueue?: () => void;
  onUpdateParticipant?: () => void;
  onRemoveParticipant?: (participantId: string) => void;
  onEndMeeting?: () => void;
  children: React.ReactNode;
}

export const MeetingContext = ({ children }: MeetingContextProps) => {
  return <>{children}</>;
};
