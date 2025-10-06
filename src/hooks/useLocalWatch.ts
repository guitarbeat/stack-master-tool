import { useState, useEffect } from "react";
import { useUnifiedFacilitator } from "./useUnifiedFacilitator";

interface Participant {
  id: string;
  name: string;
  isFacilitator?: boolean;
}

interface QueueEntry {
  id: string;
  participantName: string;
  type: string;
  timestamp: number;
}

export const useLocalWatch = (meetingCode: string) => {
  const [facilitatorName] = useState(() => {
    const stored = localStorage.getItem("facilitatorName");
    return stored || "Facilitator";
  });

  const {
    isRemoteEnabled,
    meetingCode: hostMeetingCode,
    meetingTitle,
    participants,
    speakingQueue,
    currentSpeaker,
  } = useUnifiedFacilitator(facilitatorName);

  // Check if this is a local meeting (MANUAL code or matches current host)
  const isLocalMeeting =
    meetingCode === "MANUAL" || meetingCode === hostMeetingCode;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLocalMeeting) {
      setError("This meeting is not available for local watching");
      return;
    }

    setError("");
  }, [isLocalMeeting, meetingCode]);

  // Transform data to match the expected format
  const meetingData = isLocalMeeting
    ? {
        code: meetingCode,
        title: meetingTitle || "Local Meeting",
        facilitator: facilitatorName,
      }
    : null;

  const transformedParticipants: Participant[] = participants.map(p => ({
    id: p.id,
    name: p.name,
    isFacilitator: p.is_facilitator ?? false,
  }));

  const transformedSpeakingQueue: QueueEntry[] = speakingQueue.map(
    (entry: any, index: number) => ({
      id: entry.id,
      participantName: entry.participantName || "Unknown",
      type: entry.queue_type || "regular",
      timestamp: new Date(entry.joined_queue_at || Date.now()).getTime(),
    })
  );

  const transformedCurrentSpeaker: QueueEntry | null = currentSpeaker
    ? {
        id: currentSpeaker.id,
        participantName: currentSpeaker.participantName || "Unknown",
        type: currentSpeaker.queue_type || "regular",
        timestamp: new Date().getTime(),
      }
    : null;

  return {
    meetingData,
    participants: transformedParticipants,
    speakingQueue: transformedSpeakingQueue,
    currentSpeaker: transformedCurrentSpeaker,
    isLoading,
    error,
    isLocalMeeting,
  };
};
