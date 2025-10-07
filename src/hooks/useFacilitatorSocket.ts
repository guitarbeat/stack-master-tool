import { useState, useEffect, useCallback } from "react";
import socketService from "@/services/socket";
import { playBeep } from "@/utils/sound";
import { useSpeakerTimer } from "./useSpeakerTimer";
import { useSpeakingHistory } from "./useSpeakingHistory";
import { useStackManagement } from "./useStackManagement";

type Speaker = {
  participantName: string;
  type: string;
  [key: string]: unknown;
};

interface Participant {
  id: string;
  name: string;
  isFacilitator?: boolean;
  isInQueue?: boolean;
  [key: string]: unknown;
}

interface QueueEntry {
  id: string;
  participantName: string;
  type: string;
  timestamp: number;
  [key: string]: unknown;
}

type ToastFn = (opts: { type: string; title: string }) => void;

export function useFacilitatorSocket(
  meetingCode?: string,
  facilitatorName?: string,
  showToast?: ToastFn
) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [speakingQueue, setSpeakingQueue] = useState<QueueEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);

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

  useEffect(() => {
    if (!meetingCode || !facilitatorName) return;

    const setupSocketListeners = () => {
      socketService.onQueueUpdated((queue: QueueEntry[]) => {
        setSpeakingQueue(queue);
      });

      socketService.onParticipantsUpdated((participantsList: Participant[]) => {
        setParticipants(participantsList);
      });

      socketService.onParticipantJoined(
        (data: { participant: { name: string } }) => {
          showToast?.({
            type: "info",
            title: `${data.participant.name} joined`,
          });
        }
      );

      socketService.onParticipantLeft((data: { participantName: string }) => {
        showToast?.({ type: "info", title: `${data.participantName} left` });
      });

      socketService.onNextSpeaker((speaker: Speaker) => {
        setCurrentSpeaker(speaker);
        showToast?.({
          type: "success",
          title: `Next: ${speaker.participantName}`,
        });
        playBeep(1200, 120);
        setTimeout(() => {
          setCurrentSpeaker(null);
        }, 10000);
      });

      socketService.onError((err: Error) => {
        setError(err.message || "Connection error");
        showToast?.({
          type: "error",
          title: err.message || "Connection error",
        });
      });
    };

    const connectAsFacilitator = async () => {
      try {
        socketService.connect();
        setupSocketListeners();
        await socketService.joinMeeting(meetingCode, facilitatorName, true);
        setIsConnected(true);
      } catch (err: unknown) {
        const error = err as Error;
        if (
          error.message &&
          error.message.includes(
            "Only the meeting creator can join as facilitator"
          )
        ) {
          setError(
            "You are not authorized to facilitate this meeting. Only the meeting creator can facilitate."
          );
        } else {
          setError("Failed to connect to meeting");
        }
      }
    };

    connectAsFacilitator();

    return () => {
      // Clean up listeners to prevent memory leaks
      socketService.removeAllListeners();
    };
  }, [meetingCode, facilitatorName, showToast]);

  const nextSpeaker = useCallback(() => {
    if (speakingQueue.length === 0 || !isConnected) return;

    // Record speaking segment for current speaker if timer is active
    if (speakerTimer && currentSpeaker) {
      const durationMs = Date.now() - speakerTimer.startTime.getTime();
      addSpeakingSegment(
        currentSpeaker.participantName,
        currentSpeaker.participantName,
        durationMs,
        currentSpeaker.type === "direct-response"
      );
    }

    try {
      socketService.nextSpeaker();

      // Start timer for next speaker
      if (speakingQueue.length > 1) {
        const nextSpeakerName = speakingQueue[1].participantName;
        startSpeakerTimer(nextSpeakerName);
      } else {
        stopSpeakerTimer();
      }
    } catch (err) {
      setError("Failed to call next speaker");
      showToast?.({ type: "error", title: "Failed to call next speaker" });
      playBeep(220, 200);
    }
  }, [
    speakingQueue,
    isConnected,
    speakerTimer,
    currentSpeaker,
    addSpeakingSegment,
    startSpeakerTimer,
    stopSpeakerTimer,
    showToast,
  ]);

  const finishSpeaking = useCallback(() => {
    // Record speaking segment for current speaker if timer is active
    if (speakerTimer && currentSpeaker) {
      const durationMs = Date.now() - speakerTimer.startTime.getTime();
      addSpeakingSegment(
        currentSpeaker.participantName,
        currentSpeaker.participantName,
        durationMs,
        currentSpeaker.type === "direct-response"
      );
    }

    setCurrentSpeaker(null);
    stopSpeakerTimer();
  }, [speakerTimer, currentSpeaker, addSpeakingSegment, stopSpeakerTimer]);

  // Timer controls
  const toggleSpeakerTimer = useCallback(() => {
    if (!speakerTimer) return;
    if (speakerTimer.isActive) {
      pauseSpeakerTimer();
    } else {
      resumeSpeakerTimer();
    }
  }, [speakerTimer, pauseSpeakerTimer, resumeSpeakerTimer]);

  const disconnect = () => {
    socketService.disconnect();
  };

  return {
    participants,
    speakingQueue,
    currentSpeaker,
    isConnected,
    error,
    nextSpeaker,
    finishSpeaking,
    disconnect,
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

export default useFacilitatorSocket;
