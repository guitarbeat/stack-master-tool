import React from "react";

interface MeetingContextProps {
  meetingData: {
    title: string;
    code: string;
    facilitator: string;
    createdAt?: Date;
  };
  participants: Array<{
    id: string;
    name: string;
    isFacilitator: boolean;
    hasRaisedHand: boolean;
    joinedAt?: Date;
  }>;
  speakingQueue: Array<{
    id: string;
    participantName: string;
    type: string;
    timestamp: number;
  }>;
  currentSpeaker?: {
    participantName: string;
    startedSpeakingAt?: Date;
  };
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
