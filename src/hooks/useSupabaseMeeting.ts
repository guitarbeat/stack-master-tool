import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SupabaseMeetingService, SupabaseRealtimeService, type Participant, type MeetingData, type QueueItem } from "../services/supabase";
import { toast } from "@/hooks/use-toast";
import { playBeep } from "../utils/sound.js";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";

export const useSupabaseMeeting = (
  participantName: string,
  meetingInfo: MeetingData | null
) => {
  const navigate = useNavigate();
  const [meetingData, setMeetingData] = useState<MeetingData | null>(meetingInfo);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [speakingQueue, setSpeakingQueue] = useState<QueueItem[]>([]);
  const [isInQueue, setIsInQueue] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentSpeaker, setCurrentSpeaker] = useState<QueueItem | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  
  // Enhanced connection tracking
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'disconnected'>('disconnected');
  const [lastConnected, setLastConnected] = useState<Date | undefined>();
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

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

  // Join meeting
  const joinMeeting = useCallback(async () => {
    if (!participantName || !meetingInfo) {
      return;
    }

    try {
      setIsConnected(false);
      setError("");
      setReconnectAttempts(0);

      // Join the meeting (requires authentication for facilitators only)
      const participant = await SupabaseMeetingService.joinMeeting(
        meetingInfo.code,
        participantName,
        false // Regular participant, not facilitator
      );

      setParticipantId(participant.id);
      setIsConnected(true);
      setLastConnected(new Date());
      setConnectionQuality('excellent');
      setReconnectAttempts(0);

      // Load initial meeting data
      const meeting = await SupabaseMeetingService.getMeeting(meetingInfo.code);
      if (meeting) {
        setMeetingData({
          id: meeting.id,
          code: meeting.code,
          title: meeting.title,
          facilitator: meeting.facilitatorName,
          createdAt: meeting.createdAt,
          isActive: meeting.isActive,
        });
        setParticipants(meeting.participants);
        setSpeakingQueue(meeting.speakingQueue);
        
        // Check if user is in queue
        const userInQueue = meeting.speakingQueue.find(
          item => item.participantId === participant.id
        );
        setIsInQueue(!!userInQueue);
      }

      notify("success", "Joined meeting", `Connected to ${meetingInfo.title}`);
    } catch (err: unknown) {
      console.error("Join meeting error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      setConnectionQuality('disconnected');
      setReconnectAttempts(prev => prev + 1);
      notify("error", errorInfo.title, errorInfo.description);
    }
  }, [participantName, meetingInfo, notify]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!meetingData || !participantId) return;

    const unsubscribe = SupabaseRealtimeService.subscribeToMeeting(meetingData.id, {
      onParticipantsUpdated: (updatedParticipants) => {
        setParticipants(updatedParticipants);
      },
      onQueueUpdated: (updatedQueue) => {
        setSpeakingQueue(updatedQueue);
        
        // Check if user is in queue
        const userInQueue = updatedQueue.find(
          item => item.participantId === participantId
        );
        setIsInQueue(!!userInQueue);
      },
      onMeetingTitleUpdated: (newTitle) => {
        setMeetingData(prev => prev ? { ...prev, title: newTitle } : null);
        notify("info", "Meeting title updated", newTitle);
      },
      onParticipantJoined: (participant) => {
        notify("info", `${participant.name} joined`);
      },
      onParticipantLeft: (leftParticipantId) => {
        // Find participant name for notification
        const leftParticipant = participants.find(p => p.id === leftParticipantId);
        if (leftParticipant) {
          notify("info", `${leftParticipant.name} left`);
        }
      },
      onNextSpeaker: (speaker) => {
        setCurrentSpeaker(speaker);
        notify("success", `${speaker.participantName} is up next`);
        playBeep(1200, 120);
        setTimeout(() => {
          setCurrentSpeaker(null);
        }, 5000);
      },
      onError: (error) => {
        console.error("Real-time error:", error);
        const errorInfo = getErrorDisplayInfo(error as AppError);
        setError(errorInfo.description);
        setConnectionQuality('disconnected');
        setReconnectAttempts(prev => prev + 1);
        notify("error", errorInfo.title, errorInfo.description);
      },
    });

    return unsubscribe;
  }, [meetingData, participantId, participants, notify]);

  // Auto-join meeting when component mounts
  useEffect(() => {
    if (participantName && meetingInfo && !isConnected && !isReconnecting) {
      joinMeeting();
    }
  }, [participantName, meetingInfo, isConnected, isReconnecting, joinMeeting]);

  const joinQueue = useCallback(
    async (type: string = "speak") => {
      if (isInQueue || !isConnected || !meetingData || !participantId) return;

      try {
        await SupabaseMeetingService.joinQueue(meetingData.id, participantId, type);
        notify(
          "success",
          "Joined queue",
          type === "speak" ? "Speak" : type.replace("-", " ")
        );
        playBeep(1000, 120);
      } catch (err: unknown) {
        console.error("Join queue error:", err);
        const errorInfo = getErrorDisplayInfo(err as AppError);
        setError(errorInfo.description);
        notify("error", errorInfo.title, errorInfo.description);
        playBeep(220, 200);
      }
    },
    [isInQueue, isConnected, meetingData, participantId, notify]
  );

  const leaveQueue = useCallback(async () => {
    if (!isInQueue || !isConnected || !meetingData || !participantId) return;

    try {
      await SupabaseMeetingService.leaveQueue(meetingData.id, participantId);
      notify("info", "Left queue");
      playBeep(600, 100);
    } catch (err: unknown) {
      console.error("Leave queue error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
      playBeep(220, 200);
    }
  }, [isInQueue, isConnected, meetingData, participantId, notify]);

  const leaveMeeting = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const onReconnect = useCallback(async () => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    setError("");
    
    try {
      await joinMeeting();
      notify("success", "Reconnected", "Successfully reconnected to the meeting");
    } catch (err: unknown) {
      console.error("Reconnection error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      setConnectionQuality('disconnected');
      setReconnectAttempts(prev => prev + 1);
      notify("error", "Reconnection failed", errorInfo.description);
    } finally {
      setIsReconnecting(false);
    }
  }, [isReconnecting, joinMeeting, notify]);

  return {
    meetingData,
    participants,
    speakingQueue,
    isInQueue,
    isConnected,
    error,
    currentSpeaker,
    joinQueue,
    leaveQueue,
    leaveMeeting,
    // Enhanced connection tracking
    connectionQuality,
    lastConnected,
    reconnectAttempts,
    onReconnect,
  };
};