import { useEffect, useState, useCallback } from "react";
import { SupabaseMeetingService, SupabaseRealtimeService, type Participant, type MeetingData, type QueueItem } from "../services/supabase";
import { toast } from "@/hooks/use-toast";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";

export const useSupabaseWatch = (meetingCode: string) => {
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [speakingQueue, setSpeakingQueue] = useState<QueueItem[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const notify = useCallback(
    (
      _type: "success" | "error" | "info",
      title: string,
      description?: string
    ) => {
      toast({ title, description });
    },
    []
  );

  // Load meeting data for watching
  const loadMeeting = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const meeting = await SupabaseMeetingService.getMeeting(meetingCode);
      if (!meeting) {
        setError("Meeting not found");
        return;
      }

      setMeetingData({
        id: meeting.id,
        code: meeting.code,
        title: meeting.title,
        facilitatorName: meeting.facilitatorName,
        createdAt: meeting.createdAt,
        isActive: meeting.isActive,
      });
      setParticipants(meeting.participants);
      setSpeakingQueue(meeting.speakingQueue);
      setIsConnected(true);

      notify("success", "Connected", `Watching ${meeting.title}`);
    } catch (err: unknown) {
      console.error("Load meeting error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
    } finally {
      setIsLoading(false);
    }
  }, [meetingCode, notify]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!meetingData) return;

    const unsubscribe = SupabaseRealtimeService.subscribeToMeeting(meetingData.id, {
      onParticipantsUpdated: (updatedParticipants) => {
        setParticipants(updatedParticipants);
      },
      onQueueUpdated: (updatedQueue) => {
        setSpeakingQueue(updatedQueue);
      },
      onMeetingTitleUpdated: (newTitle) => {
        setMeetingData(prev => prev ? { ...prev, title: newTitle } : null);
      },
      onParticipantJoined: (participant) => {
        notify("info", `${participant.name} joined`);
      },
      onParticipantLeft: (leftParticipantId) => {
        const leftParticipant = participants.find(p => p.id === leftParticipantId);
        if (leftParticipant) {
          notify("info", `${leftParticipant.name} left`);
        }
      },
      onNextSpeaker: (speaker) => {
        notify("info", `${speaker.participantName} is now speaking`);
      },
      onError: (error) => {
        console.error("Real-time error:", error);
        const errorInfo = getErrorDisplayInfo(error as AppError);
        setError(errorInfo.description);
        notify("error", errorInfo.title, errorInfo.description);
      },
    });

    return unsubscribe;
  }, [meetingData, participants, notify]);

  // Load meeting when component mounts
  useEffect(() => {
    if (meetingCode && !isConnected && !isLoading) {
      loadMeeting();
    }
  }, [meetingCode, isConnected, isLoading, loadMeeting]);

  return {
    meetingData,
    participants,
    speakingQueue,
    isConnected,
    error,
    isLoading,
  };
};