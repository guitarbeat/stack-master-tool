import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import socketService from "../services/socket.js";
import { toast } from "@/hooks/use-toast";
import { playBeep } from "../utils/sound.js";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";

interface Participant {
  id: string;
  name: string;
  isFacilitator: boolean;
  hasRaisedHand: boolean;
}

interface MeetingData {
  code: string;
  title: string;
  facilitator: string;
}

interface QueueItem {
  id: string;
  participantName: string;
  type: string;
  timestamp: number;
}

export const useMeetingSocket = (
  participantName: string,
  meetingInfo: MeetingData | null
) => {
  const navigate = useNavigate();
  const [meetingData] = useState<MeetingData | null>(meetingInfo);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [speakingQueue, setSpeakingQueue] = useState<QueueItem[]>([]);
  const [isInQueue, setIsInQueue] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentSpeaker, setCurrentSpeaker] = useState<QueueItem | null>(null);
  
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

  useEffect(() => {
    if (!participantName || !meetingInfo) {
      return;
    }

    // Store callback references for proper cleanup
    const queueUpdatedCallback = (queue: QueueItem[]) => {
      setSpeakingQueue(queue);
      const userInQueue = queue.find(
        item => item.participantName === participantName
      );
      setIsInQueue(!!userInQueue);
    };

    const participantsUpdatedCallback = (participantsList: Participant[]) => {
      setParticipants(participantsList);
    };

    const participantJoinedCallback = (data: {
      participant: { name: string };
    }) => {
      notify("info", `${data.participant.name} joined`);
    };

    const participantLeftCallback = (data: { participantName: string }) => {
      notify("info", `${data.participantName} left`);
    };

    const nextSpeakerCallback = (speaker: QueueItem) => {
      setCurrentSpeaker(speaker);
      notify("success", `${speaker.participantName} is up next`);
      playBeep(1200, 120);
      setTimeout(() => {
        setCurrentSpeaker(null);
      }, 5000);
    };

    const participantLeftQueueCallback = (data: {
      participantName: string;
      queueLength: number;
    }) => {
      notify("info", `${data.participantName} left the queue`);
      // Update local state to reflect queue changes
      setIsInQueue(prev => {
        // If we're the one who left, update our state
        if (data.participantName === participantName) {
          return false;
        }
        return prev;
      });
    };

    const speakerChangedCallback = (data: {
      previousSpeaker: QueueItem;
      currentQueue: QueueItem[];
      queueLength: number;
    }) => {
      // Update queue state to ensure consistency
      setSpeakingQueue(data.currentQueue);
      // Update our queue status if we're in the queue
      const userInQueue = data.currentQueue.find(
        item => item.participantName === participantName
      );
      setIsInQueue(!!userInQueue);
    };

    const errorCallback = (error: { message?: string; code?: string }) => {
      const errorInfo = getErrorDisplayInfo(
        new AppError(
          (error.code as any) || "UNKNOWN",
          undefined,
          error.message || "Connection error"
        )
      );
      setError(errorInfo.description);
      setConnectionQuality('disconnected');
      setIsConnected(false);
      setReconnectAttempts(prev => prev + 1);
      notify("error", errorInfo.title, errorInfo.description);
    };

    const setupSocketListeners = () => {
      socketService.onQueueUpdated(queueUpdatedCallback);
      socketService.onParticipantsUpdated(participantsUpdatedCallback);
      socketService.onParticipantJoined(participantJoinedCallback);
      socketService.onParticipantLeft(participantLeftCallback);
      socketService.onNextSpeaker(nextSpeakerCallback);
      socketService.onError(errorCallback);

      // Add new event listeners for better state synchronization
      if (socketService.socket) {
        socketService.socket.on(
          "participant-left-queue",
          participantLeftQueueCallback
        );
        socketService.socket.on("speaker-changed", speakerChangedCallback);
      }
    };

    if (!socketService.isConnected) {
      try {
        socketService.connect();
        setupSocketListeners();
        setIsConnected(true);
        setLastConnected(new Date());
        setConnectionQuality('excellent');
        setReconnectAttempts(0);
      } catch (err: unknown) {
        console.error("Connection error:", err);
        const errorInfo = getErrorDisplayInfo(err as AppError);
        setError(errorInfo.description);
        setConnectionQuality('disconnected');
        setReconnectAttempts(prev => prev + 1);
      }
    } else {
      setupSocketListeners();
      setIsConnected(true);
      setLastConnected(new Date());
      setConnectionQuality('excellent');
    }

    // Join the meeting as a participant
    if (isConnected && participantName) {
      try {
        socketService.joinMeeting(meetingInfo.code, participantName, false);
      } catch (err: unknown) {
        console.error("Join meeting error:", err);
        const errorInfo = getErrorDisplayInfo(err as AppError);
        setError(errorInfo.description);
      }
    }

    return () => {
      // Remove specific listeners using stored callback references
      if (socketService.socket) {
        socketService.off("queue-updated", queueUpdatedCallback);
        socketService.off("participants-updated", participantsUpdatedCallback);
        socketService.off("participant-joined", participantJoinedCallback);
        socketService.off("participant-left", participantLeftCallback);
        socketService.off("next-speaker", nextSpeakerCallback);
        socketService.off("error", errorCallback);
        socketService.socket.off(
          "participant-left-queue",
          participantLeftQueueCallback
        );
        socketService.socket.off("speaker-changed", speakerChangedCallback);
      }
    };
  }, [participantName, navigate, notify]);

  const joinQueue = useCallback(
    (type: string = "speak") => {
      if (isInQueue || !isConnected) return;

      try {
        socketService.joinQueue(type);
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
    [isInQueue, isConnected, notify]
  );

  const leaveQueue = useCallback(() => {
    if (!isInQueue || !isConnected) return;

    try {
      socketService.leaveQueue();
      notify("info", "Left queue");
      playBeep(600, 100);
    } catch (err: unknown) {
      console.error("Leave queue error:", err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
      playBeep(220, 200);
    }
  }, [isInQueue, isConnected, notify]);

  const leaveMeeting = useCallback(() => {
    socketService.disconnect();
    navigate("/");
  }, [navigate]);

  const onReconnect = useCallback(async () => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    setError("");
    
    try {
      if (socketService.isConnected) {
        socketService.disconnect();
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      socketService.connect();
      // setupSocketListeners is defined in the useEffect above
      const listeners = () => {
        socketService.onQueueUpdated(queueUpdatedCallback);
        socketService.onParticipantsUpdated(participantsUpdatedCallback);
      };
      listeners();
      setIsConnected(true);
      setLastConnected(new Date());
      setConnectionQuality('excellent');
      setReconnectAttempts(0);
      
      // Rejoin the meeting
      if (participantName && meetingInfo) {
        socketService.joinMeeting(meetingInfo.code, participantName, false);
      }
      
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
  }, [isReconnecting, participantName, meetingInfo, notify]);

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
