import { useEffect } from "react";
import type { MeetingWithParticipants, Participant, QueueItem } from "@/types/meeting";
import type { IMeetingRealtime } from "@/services/meeting-service";

interface UseMeetingRealtimeProps {
  meetingId: string;
  meetingCode: string;
  realtimeService: IMeetingRealtime;
  setServerParticipants: (participants: Participant[]) => void;
  setServerQueue: (queue: QueueItem[]) => void;
  setServerMeeting: (fn: (m: MeetingWithParticipants | null) => MeetingWithParticipants | null) => void;
  setShowJohnDoe: (show: boolean) => void;
}

/**
 * * Custom hook for managing real-time meeting subscriptions
 * Handles all real-time updates for meeting data
 */
export function useMeetingRealtime({
  meetingId,
  meetingCode,
  realtimeService,
  setServerParticipants,
  setServerQueue,
  setServerMeeting,
  setShowJohnDoe,
}: UseMeetingRealtimeProps) {
  useEffect(() => {
    if (!meetingId || !meetingCode) {
      return;
    }

    const unsubscribe = realtimeService.subscribeToMeeting(meetingId, meetingCode, {
      onParticipantsUpdated: (participants: Participant[]) => {
        setServerParticipants(participants);
        // * Hide John Doe when real participants join
        if (participants.length > 0) {
          setShowJohnDoe(false);
        }
      },
      onQueueUpdated: setServerQueue,
      onMeetingTitleUpdated: (title: string) =>
        setServerMeeting((m) =>
          m ? ({ ...m, title } as MeetingWithParticipants) : m,
        ),
      onParticipantJoined: () => void 0,
      onParticipantLeft: () => void 0,
      onNextSpeaker: () => void 0,
      onError: () => void 0,
    });

    return () => {
      unsubscribe?.();
    };
  }, [meetingId, meetingCode, realtimeService, setServerParticipants, setServerQueue, setServerMeeting, setShowJohnDoe]);
}
