import { useEffect } from "react";
import { SupabaseRealtimeService, type MeetingWithParticipants, type Participant as SbParticipant, type QueueItem as SbQueueItem } from "@/services/supabase";

interface UseMeetingRealtimeProps {
  meetingId: string;
  setServerParticipants: (participants: SbParticipant[]) => void;
  setServerQueue: (queue: SbQueueItem[]) => void;
  setServerMeeting: (fn: (m: MeetingWithParticipants | null) => MeetingWithParticipants | null) => void;
  setShowJohnDoe: (show: boolean) => void;
}

/**
 * * Custom hook for managing real-time meeting subscriptions
 * Handles all real-time updates for meeting data
 */
export function useMeetingRealtime({
  meetingId,
  setServerParticipants,
  setServerQueue,
  setServerMeeting,
  setShowJohnDoe,
}: UseMeetingRealtimeProps) {
  useEffect(() => {
    if (!meetingId) {
      return;
    }

    const unsubscribe = SupabaseRealtimeService.subscribeToMeeting(meetingId, meetingId, {
      onParticipantsUpdated: (participants: SbParticipant[]) => {
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
  }, [meetingId, setServerParticipants, setServerQueue, setServerMeeting, setShowJohnDoe]);
}