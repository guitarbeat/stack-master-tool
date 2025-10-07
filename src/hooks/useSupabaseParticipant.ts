import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { playBeep } from "../utils/sound.js";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";

interface Participant {
  id: string;
  name: string;
  meeting_id: string;
  is_facilitator: boolean | null;
  is_active: boolean | null;
  joined_at: string;
}

interface QueueEntry {
  id: string;
  participant_id: string;
  meeting_id: string;
  queue_type: string;
  position: number;
  joined_queue_at: string;
  is_speaking: boolean | null;
  // Joined data
  participantName?: string;
}

interface MeetingData {
  id: string;
  meeting_code: string;
  title: string;
  facilitator_name: string;
}

export function useSupabaseParticipant(
  participantName: string,
  meetingCode: string
) {
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [speakingQueue, setSpeakingQueue] = useState<QueueEntry[]>([]);
  const [isInQueue, setIsInQueue] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentSpeaker, setCurrentSpeaker] = useState<QueueEntry | null>(null);

  // Enhanced connection tracking
  const [connectionQuality, setConnectionQuality] = useState<
    "excellent" | "good" | "fair" | "poor" | "disconnected"
  >("disconnected");
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

  // Load initial meeting data and join as participant
  useEffect(() => {
    const loadMeetingAndJoin = async () => {
      if (!participantName || !meetingCode) return;

      try {
        setIsConnected(false);
        setError("");

        // Load meeting data
        const { data: meeting, error: meetingError } = await supabase
          .from("meetings")
          .select("*")
          .eq("meeting_code", meetingCode.toUpperCase())
          .eq("is_active", true)
          .single();

        if (meetingError) {
          if (meetingError.code === "PGRST116") {
            setError("Meeting not found");
          } else {
            setError("Failed to load meeting");
          }
          return;
        }

        setMeetingData(meeting);

        // Join as participant
        const { error: participantError } = await supabase
          .from("participants")
          .upsert(
            {
              meeting_id: meeting.id,
              name: participantName,
              is_facilitator: false,
              is_active: true,
            },
            {
              onConflict: "meeting_id,name",
            }
          );

        if (participantError) {
          console.error("Error joining as participant:", participantError);
          setError("Failed to join meeting");
          return;
        }

        setIsConnected(true);
        setLastConnected(new Date());
        setConnectionQuality("excellent");
        setReconnectAttempts(0);

        notify("success", "Joined meeting", `Welcome to ${meeting.title}`);
      } catch (err) {
        console.error("Error joining meeting:", err);
        const errorInfo = getErrorDisplayInfo(err as AppError);
        setError(errorInfo.description);
        setConnectionQuality("disconnected");
        setReconnectAttempts(prev => prev + 1);
        notify("error", "Join failed", errorInfo.description);
      }
    };

    loadMeetingAndJoin();
  }, [participantName, meetingCode, notify]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!meetingData || !isConnected) return;

    // Subscribe to participants changes
    const participantsChannel = supabase
      .channel("participants-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `meeting_id=eq.${meetingData.id}`,
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    // Subscribe to queue changes
    const queueChannel = supabase
      .channel("queue-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "speaking_queue",
          filter: `meeting_id=eq.${meetingData.id}`,
        },
        () => {
          loadQueue();
        }
      )
      .subscribe();

    // Initial load
    loadParticipants();
    loadQueue();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(queueChannel);
    };
  }, [meetingData, isConnected]);

  const loadParticipants = async () => {
    if (!meetingData) return;

    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("meeting_id", meetingData.id)
      .eq("is_active", true)
      .order("joined_at");

    if (error) {
      console.error("Error loading participants:", error);
      return;
    }

    setParticipants(data || []);
  };

  const loadQueue = async () => {
    if (!meetingData) return;

    const { data, error } = await supabase
      .from("speaking_queue")
      .select(
        `
        *,
        participants!inner(name)
      `
      )
      .eq("meeting_id", meetingData.id)
      .order("position");

    if (error) {
      console.error("Error loading queue:", error);
      return;
    }

    const queueWithNames =
      data?.map(item => ({
        ...item,
        participantName: item.participants?.name || "Unknown",
      })) || [];

    setSpeakingQueue(queueWithNames);

    // Check if current participant is in queue
    const userInQueue = queueWithNames.find(
      item => item.participantName === participantName
    );
    setIsInQueue(!!userInQueue);

    // Find current speaker
    const currentSpeaker = queueWithNames.find(item => item.is_speaking);
    setCurrentSpeaker(currentSpeaker || null);

    // Notify when it's our turn to speak
    if (currentSpeaker && currentSpeaker.participantName === participantName) {
      notify("success", "You're up next!");
      playBeep(1200, 120);
    }
  };

  const joinQueue = useCallback(
    async (type: string = "speak") => {
      if (isInQueue || !isConnected || !meetingData) return;

      try {
        // Get current participant
        const participant = participants.find(p => p.name === participantName);
        if (!participant) {
          throw new Error("Participant not found");
        }

        // Get next position in queue
        const { data: queueData } = await supabase
          .from("speaking_queue")
          .select("position")
          .eq("meeting_id", meetingData.id)
          .order("position", { ascending: false })
          .limit(1);

        const nextPosition =
          queueData && queueData.length > 0 ? queueData[0].position + 1 : 1;

        // Add to queue
        const { error } = await supabase.from("speaking_queue").insert({
          meeting_id: meetingData.id,
          participant_id: participant.id,
          queue_type: type,
          position: nextPosition,
          is_speaking: false,
        });

        if (error) {
          throw error;
        }

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
    [isInQueue, isConnected, meetingData, participants, participantName, notify]
  );

  const leaveQueue = useCallback(async () => {
    if (!isInQueue || !isConnected || !meetingData) return;

    try {
      // Get current participant
      const participant = participants.find(p => p.name === participantName);
      if (!participant) {
        throw new Error("Participant not found");
      }

      // Remove from queue
      const { error } = await supabase
        .from("speaking_queue")
        .delete()
        .eq("meeting_id", meetingData.id)
        .eq("participant_id", participant.id);

      if (error) {
        throw error;
      }

      notify("info", "Left queue");
      playBeep(600, 100);
    } catch (err: unknown) {
      console.error("Leave queue error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
      playBeep(220, 200);
    }
  }, [
    isInQueue,
    isConnected,
    meetingData,
    participants,
    participantName,
    notify,
  ]);

  const leaveMeeting = useCallback(async () => {
    if (!meetingData) return;

    try {
      // Get current participant
      const participant = participants.find(p => p.name === participantName);
      if (participant) {
        // Mark as inactive
        await supabase
          .from("participants")
          .update({ is_active: false })
          .eq("id", participant.id);

        // Remove from queue if in queue
        await supabase
          .from("speaking_queue")
          .delete()
          .eq("meeting_id", meetingData.id)
          .eq("participant_id", participant.id);
      }

      setIsConnected(false);
      setConnectionQuality("disconnected");
    } catch (err) {
      console.error("Error leaving meeting:", err);
    }
  }, [meetingData, participants, participantName]);

  const onReconnect = useCallback(async () => {
    if (isReconnecting) return;

    setIsReconnecting(true);
    setError("");

    try {
      // Rejoin the meeting
      if (participantName && meetingCode) {
        const { data: meeting, error: meetingError } = await supabase
          .from("meetings")
          .select("*")
          .eq("meeting_code", meetingCode.toUpperCase())
          .eq("is_active", true)
          .single();

        if (meetingError) {
          throw new Error("Meeting not found");
        }

        setMeetingData(meeting);

        // Rejoin as participant
        const { error: participantError } = await supabase
          .from("participants")
          .upsert(
            {
              meeting_id: meeting.id,
              name: participantName,
              is_facilitator: false,
              is_active: true,
            },
            {
              onConflict: "meeting_id,name",
            }
          );

        if (participantError) {
          throw participantError;
        }

        setIsConnected(true);
        setLastConnected(new Date());
        setConnectionQuality("excellent");
        setReconnectAttempts(0);

        notify(
          "success",
          "Reconnected",
          "Successfully reconnected to the meeting"
        );
      }
    } catch (err: unknown) {
      console.error("Reconnection error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      setConnectionQuality("disconnected");
      setReconnectAttempts(prev => prev + 1);
      notify("error", "Reconnection failed", errorInfo.description);
    } finally {
      setIsReconnecting(false);
    }
  }, [isReconnecting, participantName, meetingCode, notify]);

  // Transform meeting data for compatibility
  const transformedMeetingData = meetingData
    ? {
        code: meetingData.meeting_code,
        title: meetingData.title,
        facilitator: meetingData.facilitator_name,
      }
    : null;

  return {
    meetingData: transformedMeetingData,
    participants: participants.map(p => ({
      id: p.id,
      name: p.name,
      isFacilitator: p.is_facilitator ?? false,
      hasRaisedHand: false, // Not used in current implementation
    })),
    speakingQueue: speakingQueue.map(entry => ({
      id: entry.id,
      participantName: entry.participantName || "Unknown",
      type: entry.queue_type,
      timestamp: new Date(entry.joined_queue_at).getTime(),
    })),
    isInQueue,
    isConnected,
    error,
    currentSpeaker: currentSpeaker
      ? {
          id: currentSpeaker.id,
          participantName: currentSpeaker.participantName || "Unknown",
          type: currentSpeaker.queue_type,
          timestamp: new Date().getTime(),
        }
      : null,
    joinQueue,
    leaveQueue,
    leaveMeeting,
    // Enhanced connection tracking
    connectionQuality,
    lastConnected,
    reconnectAttempts,
    onReconnect,
  };
}
