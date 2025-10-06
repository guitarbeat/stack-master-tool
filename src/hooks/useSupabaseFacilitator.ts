import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSpeakerTimer } from "./useSpeakerTimer";
import { useSpeakingHistory } from "./useSpeakingHistory";
import { useStackManagement } from "./useStackManagement";

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

export function useSupabaseFacilitator(
  meetingCode?: string,
  facilitatorName?: string
) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [speakingQueue, setSpeakingQueue] = useState<QueueEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState<QueueEntry | null>(null);
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);

  // Timer and speaking history hooks
  const {
    speakerTimer,
    elapsedTime,
    startTimer: startSpeakerTimer,
    pauseTimer: pauseSpeakerTimer,
    resumeTimer: resumeSpeakerTimer,
    resetTimer: resetSpeakerTimer,
    stopTimer: stopSpeakerTimer,
    formatTime,
  } = useSpeakerTimer();

  const { addSpeakingSegment, clearSpeakingHistory, getSpeakingDistribution } =
    useSpeakingHistory();

  const {
    interventions,
    setInterventions,
    addIntervention,
    undoHistory,
    handleUndo,
  } = useStackManagement();

  // Load initial meeting data
  useEffect(() => {
    const loadMeetingData = async () => {
      if (!meetingCode) return;

      try {
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

        // Check if user is authorized as facilitator
        // Allow any facilitator to join if they have the meeting code
        // This enables facilitators to join meetings that have already started
        if (facilitatorName && meeting.facilitator_name !== facilitatorName) {
          // Log the attempt for debugging but don't block access
          console.log(
            `Facilitator ${facilitatorName} joining meeting originally created by ${meeting.facilitator_name}`
          );
        }

        setMeetingData(meeting);

        // Create or update facilitator participant record
        if (facilitatorName) {
          const { error: participantError } = await supabase
            .from("participants")
            .upsert(
              {
                meeting_id: meeting.id,
                name: facilitatorName,
                is_facilitator: true,
                is_active: true,
              },
              {
                onConflict: "meeting_id,name",
              }
            );

          if (participantError) {
            console.error(
              "Error creating facilitator participant:",
              participantError
            );
          }
        }

        setIsConnected(true);
      } catch (err) {
        console.error("Error loading meeting:", err);
        setError("Failed to connect to meeting");
      }
    };

    loadMeetingData();
  }, [meetingCode, facilitatorName]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!meetingData) return;

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
          // Reload participants
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
          // Reload queue
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
  }, [meetingData]);

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

    // Find current speaker
    const currentSpeaker = queueWithNames.find(item => item.is_speaking);
    setCurrentSpeaker(currentSpeaker || null);
  };

  const nextSpeaker = useCallback(async () => {
    if (!meetingData || speakingQueue.length === 0) return;

    try {
      // Record speaking segment for current speaker if timer is active
      if (speakerTimer && currentSpeaker) {
        const durationMs = Date.now() - speakerTimer.startTime.getTime();
        addSpeakingSegment(
          currentSpeaker.participantName || "Unknown",
          currentSpeaker.participantName || "Unknown",
          durationMs,
          currentSpeaker.queue_type === "direct-response"
        );
      }

      // Stop current speaker
      if (currentSpeaker) {
        await supabase
          .from("speaking_queue")
          .update({ is_speaking: false })
          .eq("id", currentSpeaker.id);
      }

      // Get the first person in queue
      const nextInQueue = speakingQueue.find(item => !item.is_speaking);
      if (!nextInQueue) {
        stopSpeakerTimer();
        return;
      }

      // Mark them as speaking
      await supabase
        .from("speaking_queue")
        .update({ is_speaking: true })
        .eq("id", nextInQueue.id);

      // Start timer for new speaker
      startSpeakerTimer(nextInQueue.participantName || "Unknown");

      toast({
        title: `Next Speaker: ${nextInQueue.participantName}`,
      });
    } catch (err) {
      console.error("Error calling next speaker:", err);
      toast({
        title: "Error",
        description: "Failed to call next speaker",
        variant: "destructive",
      });
    }
  }, [
    meetingData,
    speakingQueue,
    currentSpeaker,
    speakerTimer,
    addSpeakingSegment,
    startSpeakerTimer,
    stopSpeakerTimer,
  ]);

  const finishSpeaking = useCallback(async () => {
    if (!currentSpeaker) return;

    try {
      // Record speaking segment for current speaker if timer is active
      if (speakerTimer && currentSpeaker) {
        const durationMs = Date.now() - speakerTimer.startTime.getTime();
        addSpeakingSegment(
          currentSpeaker.participantName || "Unknown",
          currentSpeaker.participantName || "Unknown",
          durationMs,
          currentSpeaker.queue_type === "direct-response"
        );
      }

      // Remove from queue
      await supabase
        .from("speaking_queue")
        .delete()
        .eq("id", currentSpeaker.id);

      stopSpeakerTimer();
    } catch (err) {
      console.error("Error finishing speaker:", err);
    }
  }, [currentSpeaker, speakerTimer, addSpeakingSegment, stopSpeakerTimer]);

  // Timer controls
  const toggleSpeakerTimer = useCallback(() => {
    if (!speakerTimer) return;
    if (speakerTimer.isActive) {
      pauseSpeakerTimer();
    } else {
      resumeSpeakerTimer();
    }
  }, [speakerTimer, pauseSpeakerTimer, resumeSpeakerTimer]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const removeFromQueue = useCallback(async (entryId: string) => {
    if (!meetingData) return;
    
    try {
      await supabase
        .from("speaking_queue")
        .delete()
        .eq("id", entryId);
      
      toast({
        title: "Removed from queue",
      });
    } catch (err) {
      console.error("Error removing from queue:", err);
    }
  }, [meetingData]);

  const clearQueue = useCallback(async () => {
    if (!meetingData) return;
    
    try {
      await supabase
        .from("speaking_queue")
        .delete()
        .eq("meeting_id", meetingData.id);
      
      toast({
        title: "Queue cleared",
      });
    } catch (err) {
      console.error("Error clearing queue:", err);
    }
  }, [meetingData]);

  const updateParticipantName = useCallback(async (participantId: string, newName: string) => {
    if (!meetingData) return;
    
    try {
      const { error } = await supabase
        .from("participants")
        .update({ name: newName })
        .eq("id", participantId)
        .eq("meeting_id", meetingData.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Name updated",
        description: `Participant name changed to ${newName}`,
      });
    } catch (err) {
      console.error("Error updating participant name:", err);
      toast({
        title: "Error",
        description: "Failed to update participant name",
        variant: "destructive",
      });
      throw err;
    }
  }, [meetingData]);

  return {
    participants,
    speakingQueue,
    queue: speakingQueue, // Alias for compatibility
    currentSpeaker,
    isConnected,
    error,
    meetingData,
    nextSpeaker,
    finishSpeaking,
    removeFromQueue,
    clearQueue,
    disconnect,
    updateParticipantName,
    // Timer functionality
    speakerTimer,
    elapsedTime,
    toggleSpeakerTimer,
    resetSpeakerTimer,
    formatTime,
    // Speaking history
    getSpeakingDistribution,
    clearSpeakingHistory,
    // Interventions
    interventions,
    setInterventions,
    addIntervention,
    // Undo functionality
    undoHistory,
    handleUndo,
  };
}
