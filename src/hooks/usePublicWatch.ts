import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";

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

export const usePublicWatch = (meetingCode: string) => {
  const [meetingData, setMeetingData] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [speakingQueue, setSpeakingQueue] = useState<QueueEntry[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<QueueEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadMeetingData = async () => {
      if (!meetingCode) return;

      try {
        setIsLoading(true);
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

        setMeetingData({
          code: meeting.meeting_code,
          title: meeting.title,
          facilitator: meeting.facilitator_name,
        });

        // Load participants
        const { data: participantsData, error: participantsError } =
          await supabase
            .from("participants")
            .select("*")
            .eq("meeting_id", meeting.id)
            .eq("is_active", true)
            .order("joined_at");

        if (participantsError) {
          console.error("Error loading participants:", participantsError);
        } else {
          setParticipants(
            (participantsData || []).map(p => ({
              id: p.id,
              name: p.name,
              isFacilitator: p.is_facilitator ?? false,
            }))
          );
        }

        // Load speaking queue
        const { data: queueData, error: queueError } = await supabase
          .from("speaking_queue")
          .select(
            `
            *,
            participants!inner(name)
          `
          )
          .eq("meeting_id", meeting.id)
          .order("position");

        if (queueError) {
          console.error("Error loading queue:", queueError);
        } else {
          const queueWithNames =
            queueData?.map(item => ({
              id: item.id,
              participantName: item.participants?.name || "Unknown",
              type: item.queue_type,
              timestamp: new Date(item.joined_queue_at).getTime(),
            })) || [];

          setSpeakingQueue(queueWithNames);

          // Find current speaker
          const currentSpeaker = queueWithNames.find(item => item.is_speaking);
          setCurrentSpeaker(currentSpeaker || null);
        }

        // Set up real-time subscriptions
        const participantsChannel = supabase
          .channel("participants-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "participants",
              filter: `meeting_id=eq.${meeting.id}`,
            },
            async () => {
              // Reload participants
              const { data: participantsData } = await supabase
                .from("participants")
                .select("*")
                .eq("meeting_id", meeting.id)
                .eq("is_active", true)
                .order("joined_at");

              if (participantsData) {
                setParticipants(
                  participantsData.map(p => ({
                    id: p.id,
                    name: p.name,
                    isFacilitator: p.is_facilitator ?? false,
                  }))
                );
              }
            }
          )
          .subscribe();

        const queueChannel = supabase
          .channel("queue-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "speaking_queue",
              filter: `meeting_id=eq.${meeting.id}`,
            },
            async () => {
              // Reload queue
              const { data: queueData } = await supabase
                .from("speaking_queue")
                .select(
                  `
                  *,
                  participants!inner(name)
                `
                )
                .eq("meeting_id", meeting.id)
                .order("position");

              if (queueData) {
                const queueWithNames = queueData.map(item => ({
                  id: item.id,
                  participantName: item.participants?.name || "Unknown",
                  type: item.queue_type,
                  timestamp: new Date(item.joined_queue_at).getTime(),
                }));

                setSpeakingQueue(queueWithNames);

                // Find current speaker
                const currentSpeaker = queueWithNames.find(
                  item => item.is_speaking
                );
                setCurrentSpeaker(currentSpeaker || null);
              }
            }
          )
          .subscribe();

        // Cleanup function
        return () => {
          supabase.removeChannel(participantsChannel);
          supabase.removeChannel(queueChannel);
        };
      } catch (err) {
        console.error("Error loading meeting:", err);
        const errorInfo = getErrorDisplayInfo(err as AppError);
        setError(errorInfo.description);
      } finally {
        setIsLoading(false);
      }
    };

    const cleanup = loadMeetingData();
    return cleanup;
  }, [meetingCode]);

  return {
    meetingData,
    participants,
    speakingQueue,
    currentSpeaker,
    isLoading,
    error,
  };
};
