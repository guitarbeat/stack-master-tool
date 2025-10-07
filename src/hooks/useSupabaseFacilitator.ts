import { useEffect, useState, useCallback } from "react";
import { SupabaseMeetingService, SupabaseRealtimeService, type Participant, type MeetingData, type QueueItem } from "../services/supabase";
import { toast } from "@/hooks/use-toast";
import { playBeep } from "../utils/sound.js";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";

export const useSupabaseFacilitator = (
  meetingCode: string,
  facilitatorName: string
) => {
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [speakingQueue, setSpeakingQueue] = useState<QueueItem[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [facilitatorId, setFacilitatorId] = useState<string | null>(null);

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

  // Join as facilitator
  const joinAsFacilitator = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      // Join the meeting as facilitator (requires authentication)
      const participant = await SupabaseMeetingService.joinMeeting(
        meetingCode,
        facilitatorName,
        true // Facilitator
      );

      setFacilitatorId(participant.id);
      setIsConnected(true);

      // Load meeting data
      const meeting = await SupabaseMeetingService.getMeeting(meetingCode);
      if (meeting) {
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
      }

      notify("success", "Joined as facilitator", `Connected to ${meeting.title}`);
    } catch (err: unknown) {
      console.error("Join facilitator error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
    } finally {
      setIsLoading(false);
    }
  }, [meetingCode, facilitatorName, notify]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!meetingData || !facilitatorId) return;

    const unsubscribe = SupabaseRealtimeService.subscribeToMeeting(meetingData.id, {
      onParticipantsUpdated: (updatedParticipants) => {
        setParticipants(updatedParticipants);
      },
      onQueueUpdated: (updatedQueue) => {
        setSpeakingQueue(updatedQueue);
      },
      onMeetingTitleUpdated: (newTitle) => {
        setMeetingData(prev => prev ? { ...prev, title: newTitle } : null);
        notify("info", "Meeting title updated", newTitle);
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
        notify("success", `${speaker.participantName} is up next`);
        playBeep(1200, 120);
      },
      onError: (error) => {
        console.error("Real-time error:", error);
        const errorInfo = getErrorDisplayInfo(error as AppError);
        setError(errorInfo.description);
        notify("error", errorInfo.title, errorInfo.description);
      },
    });

    return unsubscribe;
  }, [meetingData, facilitatorId, participants, notify]);

  // Auto-join as facilitator when component mounts
  useEffect(() => {
    if (meetingCode && facilitatorName && !isConnected && !isLoading) {
      joinAsFacilitator();
    }
  }, [meetingCode, facilitatorName, isConnected, isLoading, joinAsFacilitator]);

  // Facilitator actions
  const nextSpeaker = useCallback(async () => {
    if (!meetingData) return;

    try {
      const speaker = await SupabaseMeetingService.nextSpeaker(meetingData.id);
      if (speaker) {
        notify("success", "Next speaker", `${speaker.participantName} is now speaking`);
        playBeep(1000, 120);
      } else {
        notify("info", "Queue empty", "No one is in the speaking queue");
      }
    } catch (err: unknown) {
      console.error("Next speaker error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
      playBeep(220, 200);
    }
  }, [meetingData, notify]);

  const updateMeetingTitle = useCallback(async (newTitle: string) => {
    if (!meetingData) return;

    try {
      await SupabaseMeetingService.updateMeetingTitle(meetingData.id, newTitle);
      notify("success", "Title updated", "Meeting title has been updated");
    } catch (err: unknown) {
      console.error("Update title error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
    }
  }, [meetingData, notify]);

  const updateParticipantName = useCallback(async (participantId: string, newName: string) => {
    try {
      await SupabaseMeetingService.updateParticipantName(participantId, newName);
      notify("success", "Name updated", "Participant name has been updated");
    } catch (err: unknown) {
      console.error("Update participant name error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
    }
  }, [notify]);

  const addParticipant = useCallback(async (name: string) => {
    if (!meetingData) return;

    try {
      await SupabaseMeetingService.joinMeeting(meetingData.code, name, false);
      notify("success", "Participant added", `${name} has been added to the meeting`);
    } catch (err: unknown) {
      console.error("Add participant error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
    }
  }, [meetingData, notify]);

  const removeParticipant = useCallback(async (participantId: string) => {
    try {
      // This would need to be implemented in the service
      // For now, we'll just show a notification
      notify("info", "Remove participant", "This feature will be implemented");
    } catch (err: unknown) {
      console.error("Remove participant error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
    }
  }, [notify]);

  return {
    meetingData,
    participants,
    speakingQueue,
    isConnected,
    error,
    isLoading,
    nextSpeaker,
    updateMeetingTitle,
    updateParticipantName,
    addParticipant,
    removeParticipant,
  };
};