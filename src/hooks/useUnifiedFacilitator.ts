import { useState, useCallback } from "react";
import { useSupabaseFacilitator } from "./useSupabaseFacilitator";
import { useStackManagement } from "./useStackManagement";
import { useSimpleMeetingCreation } from "./useSimpleMeetingCreation";
import { useSpeakingHistory } from "./useSpeakingHistory";
import { useSpeakerTimer } from "./useSpeakerTimer";
import { toast } from "./use-toast";

export const useUnifiedFacilitator = (facilitatorName: string) => {
  const [isRemoteEnabled, setIsRemoteEnabled] = useState(false);
  const [meetingCode, setMeetingCode] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>("");
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);

  // Manual stack management (always available)
  const manualStack = useStackManagement();

  // Speaking history and timer for local meetings
  const { addSpeakingSegment, clearSpeakingHistory, getSpeakingDistribution } =
    useSpeakingHistory();

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

  // Meeting creation
  const { createMeeting: createMeetingAPI, isCreating } =
    useSimpleMeetingCreation();

  // Remote meeting management (only when enabled)
  const remoteManagement = useSupabaseFacilitator(
    isRemoteEnabled ? meetingCode || "" : "",
    facilitatorName
  );

  const enableRemoteMode = useCallback(
    async (title: string): Promise<string> => {
      setIsCreatingMeeting(true);
      try {
        const result = await createMeetingAPI(facilitatorName, title);

        setMeetingCode(result.meetingCode);
        setMeetingTitle(title);
        setIsRemoteEnabled(true);

        toast({
          title: "Remote Access Enabled",
          description: `Meeting code: ${result.meetingCode}`,
        });

        return result.meetingCode;
      } catch (error) {
        console.error("Error enabling remote mode:", error);
        toast({
          title: "Error",
          description: "Failed to enable remote access",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsCreatingMeeting(false);
      }
    },
    [createMeetingAPI, facilitatorName]
  );

  const disableRemoteMode = useCallback(() => {
    setIsRemoteEnabled(false);
    setMeetingCode(null);
    setMeetingTitle("");
    toast({
      title: "Remote Access Disabled",
      description: "Switched to manual mode",
    });
  }, []);

  // Unified actions that work with both manual and remote
  const addParticipant = useCallback(
    (name: string) => {
      if (isRemoteEnabled) {
        // In remote mode, participants join themselves
        toast({
          title: "Remote Mode",
          description: "Participants can join using the meeting code",
        });
      } else {
        const wasEmpty = manualStack.stack.length === 0;
        const newParticipant = manualStack.addToStack(name);

        // Start timer if this is the first participant
        if (wasEmpty && newParticipant) {
          startSpeakerTimer(newParticipant.id);
        }
      }
    },
    [isRemoteEnabled, manualStack, startSpeakerTimer]
  );

  const nextSpeaker = useCallback(() => {
    if (isRemoteEnabled && remoteManagement.nextSpeaker) {
      return remoteManagement.nextSpeaker();
    } else {
      // For local meetings, track speaking time before moving to next speaker
      const currentSpeaker = manualStack.stack[0];
      if (currentSpeaker && speakerTimer) {
        const durationMs = Date.now() - speakerTimer.startTime.getTime();
        addSpeakingSegment(
          currentSpeaker.id,
          currentSpeaker.name,
          durationMs,
          false // Local meetings don't have direct responses in this context
        );
      }

      const result = manualStack.nextSpeaker();

      // Start timer for next speaker if there is one
      if (result && result.remainingStack.length > 0) {
        startSpeakerTimer(result.remainingStack[0].id);
      } else {
        stopSpeakerTimer();
      }

      return result;
    }
  }, [
    isRemoteEnabled,
    remoteManagement,
    manualStack,
    speakerTimer,
    addSpeakingSegment,
    startSpeakerTimer,
    stopSpeakerTimer,
  ]);

  const removeFromStack = useCallback(
    (id: string) => {
      if (isRemoteEnabled && remoteManagement.removeFromQueue) {
        remoteManagement.removeFromQueue(id);
      } else {
        const participant = manualStack.stack.find(p => p.id === id);
        const wasCurrentSpeaker =
          manualStack.stack.findIndex(p => p.id === id) === 0;

        // If removing current speaker, record their segment so far
        if (wasCurrentSpeaker && speakerTimer && participant) {
          const durationMs = Date.now() - speakerTimer.startTime.getTime();
          addSpeakingSegment(
            participant.id,
            participant.name,
            durationMs,
            false
          );
        }

        manualStack.removeFromStack(id);

        // Handle timer if current speaker was removed
        if (wasCurrentSpeaker) {
          const newStack = manualStack.stack.filter(p => p.id !== id);
          if (newStack.length > 0) {
            startSpeakerTimer(newStack[0].id);
          } else {
            stopSpeakerTimer();
          }
        }
      }
    },
    [
      isRemoteEnabled,
      remoteManagement,
      manualStack,
      speakerTimer,
      addSpeakingSegment,
      startSpeakerTimer,
      stopSpeakerTimer,
    ]
  );

  const addIntervention = useCallback(
    (
      type: "direct-response" | "clarifying-question",
      participantName: string
    ) => {
      if (isRemoteEnabled && remoteManagement.addIntervention) {
        remoteManagement.addIntervention(type, participantName);
      } else {
        manualStack.addIntervention(type, participantName);
      }
    },
    [isRemoteEnabled, remoteManagement, manualStack]
  );

  const clearAll = useCallback(() => {
    if (isRemoteEnabled && remoteManagement.clearQueue) {
      remoteManagement.clearQueue();
    } else {
      manualStack.clearAll();
      stopSpeakerTimer();
      clearSpeakingHistory();
    }
  }, [
    isRemoteEnabled,
    remoteManagement,
    manualStack,
    stopSpeakerTimer,
    clearSpeakingHistory,
  ]);

  const handleUndo = useCallback(() => {
    if (!isRemoteEnabled) {
      manualStack.handleUndo();
    }
  }, [isRemoteEnabled, manualStack]);

  const reorderStack = useCallback(
    (dragIndex: number, targetIndex: number) => {
      if (!isRemoteEnabled) {
        manualStack.reorderStack(dragIndex, targetIndex);
      }
    },
    [isRemoteEnabled, manualStack]
  );

  // Timer controls for local meetings
  const toggleSpeakerTimer = useCallback(() => {
    if (!isRemoteEnabled && speakerTimer) {
      if (speakerTimer.isActive) {
        pauseSpeakerTimer();
      } else {
        resumeSpeakerTimer();
      }
    }
  }, [isRemoteEnabled, speakerTimer, pauseSpeakerTimer, resumeSpeakerTimer]);

  // Get speaking distribution data
  const getLocalSpeakingDistribution = useCallback(
    (includeDirectResponses: boolean = true) => {
      if (isRemoteEnabled) {
        return (
          remoteManagement.getSpeakingDistribution?.(includeDirectResponses) ||
          []
        );
      } else {
        return getSpeakingDistribution(includeDirectResponses);
      }
    },
    [isRemoteEnabled, remoteManagement, getSpeakingDistribution]
  );

  return {
    // State
    isRemoteEnabled,
    meetingCode,
    meetingTitle,
    isCreatingMeeting: isCreating || isCreatingMeeting,
    facilitatorName,
    isConnected: isRemoteEnabled ? remoteManagement.isConnected : false,

    // Current data (manual or remote)
    stack: isRemoteEnabled ? remoteManagement.queue : manualStack.stack,
    interventions: isRemoteEnabled
      ? remoteManagement.interventions || []
      : manualStack.interventions,
    participants: isRemoteEnabled ? remoteManagement.participants : [],
    currentSpeaker: isRemoteEnabled
      ? remoteManagement.currentSpeaker
      : manualStack.stack[0]
        ? {
            participantName: manualStack.stack[0].name,
            queue_type: "speak",
            participant_id: manualStack.stack[0].id,
            id: manualStack.stack[0].id,
            is_speaking: true,
          }
        : null,

    // Expose underlying managers for backward compatibility
    manualStack,
    remoteManagement,
    speakingQueue: isRemoteEnabled
      ? remoteManagement.queue
      : manualStack.stack.map((p, index) => ({
          id: p.id,
          participantName: p.name,
          queue_type: "speak",
          position: index + 1,
          joined_queue_at: p.addedAt?.toISOString() || new Date().toISOString(),
          is_speaking: index === 0,
          participant_id: p.id,
        })),

    // Speaking history and timer (for local meetings)
    speakerTimer: isRemoteEnabled
      ? remoteManagement.speakerTimer
      : speakerTimer,
    elapsedTime: isRemoteEnabled ? remoteManagement.elapsedTime : elapsedTime,
    formatTime: isRemoteEnabled ? remoteManagement.formatTime : formatTime,
    getSpeakingDistribution: getLocalSpeakingDistribution,
    clearSpeakingHistory: isRemoteEnabled
      ? remoteManagement.clearSpeakingHistory
      : clearSpeakingHistory,

    // Actions
    enableRemoteMode,
    disableRemoteMode,
    addParticipant,
    nextSpeaker,
    removeFromStack,
    addIntervention,
    clearAll,
    handleUndo,
    reorderStack,

    // Timer controls (for local meetings)
    toggleSpeakerTimer: isRemoteEnabled
      ? remoteManagement.toggleSpeakerTimer
      : toggleSpeakerTimer,
    resetSpeakerTimer: isRemoteEnabled
      ? remoteManagement.resetSpeakerTimer
      : resetSpeakerTimer,

    // Additional properties for HostView compatibility
    undoHistory: isRemoteEnabled ? remoteManagement.undoHistory || [] : [],
    setInterventions: isRemoteEnabled
      ? remoteManagement.setInterventions
      : undefined,
  };
};
