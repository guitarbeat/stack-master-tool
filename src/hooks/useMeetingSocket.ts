import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socket';
import { toast } from '@/hooks/use-toast';
import { playBeep } from '../utils/sound.js';
import { AppError, getErrorDisplayInfo } from '../utils/errorHandling';

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

export const useMeetingSocket = (participantName: string, meetingInfo: MeetingData, isWatcher: boolean = false) => {
  const navigate = useNavigate();
  const [meetingData, setMeetingData] = useState<MeetingData>(meetingInfo);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [speakingQueue, setSpeakingQueue] = useState<QueueItem[]>([]);
  const [isInQueue, setIsInQueue] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentSpeaker, setCurrentSpeaker] = useState<QueueItem | null>(null);

  const notify = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    toast({ title, description });
  }, []);

  useEffect(() => {
    if (!participantName) {
      navigate('/join');
      return;
    }

    // Store callback references for proper cleanup
    const queueUpdatedCallback = (queue: QueueItem[]) => {
      setSpeakingQueue(queue);
      const userInQueue = queue.find(item => item.participantName === participantName);
      setIsInQueue(!!userInQueue);
    };

    const participantsUpdatedCallback = (participantsList: Participant[]) => {
      setParticipants(participantsList);
    };

    const participantJoinedCallback = (data: { participant: { name: string } }) => {
      notify('info', `${data.participant.name} joined`);
    };

    const participantLeftCallback = (data: { participantName: string }) => {
      notify('info', `${data.participantName} left`);
    };

    const nextSpeakerCallback = (speaker: QueueItem) => {
      setCurrentSpeaker(speaker);
      notify('success', `${speaker.participantName} is up next`);
      playBeep(1200, 120);
      setTimeout(() => {
        setCurrentSpeaker(null);
      }, 5000);
    };

    const participantLeftQueueCallback = (data: { participantName: string; queueLength: number }) => {
      notify('info', `${data.participantName} left the queue`);
      // Update local state to reflect queue changes
      setIsInQueue(prev => {
        // If we're the one who left, update our state
        if (data.participantName === participantName) {
          return false;
        }
        return prev;
      });
    };

    const speakerChangedCallback = (data: { previousSpeaker: QueueItem; currentQueue: QueueItem[]; queueLength: number }) => {
      // Update queue state to ensure consistency
      setSpeakingQueue(data.currentQueue);
      // Update our queue status if we're in the queue
      const userInQueue = data.currentQueue.find(item => item.participantName === participantName);
      setIsInQueue(!!userInQueue);
    };

    const errorCallback = (error: { message?: string; code?: string }) => {
      const errorInfo = getErrorDisplayInfo(new AppError(error.code as any || 'UNKNOWN', undefined, error.message || 'Connection error'));
      setError(errorInfo.description);
      notify('error', errorInfo.title, errorInfo.description);
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
        socketService.socket.on('participant-left-queue', participantLeftQueueCallback);
        socketService.socket.on('speaker-changed', speakerChangedCallback);
      }
    };

    if (!socketService.isConnected) {
      try {
        socketService.connect();
        setupSocketListeners();
        setIsConnected(true);
      } catch (err: unknown) {
        console.error('Connection error:', err);
        const errorInfo = getErrorDisplayInfo(err as AppError);
        setError(errorInfo.description);
      }
    } else {
      setupSocketListeners();
      setIsConnected(true);
    }

    // Join the meeting with the appropriate role
    if (isConnected && participantName) {
      try {
        socketService.joinMeeting(meetingInfo.code, participantName, false, isWatcher);
      } catch (err: unknown) {
        console.error('Join meeting error:', err);
        const errorInfo = getErrorDisplayInfo(err as AppError);
        setError(errorInfo.description);
      }
    }

    return () => {
      // Remove specific listeners using stored callback references
      if (socketService.socket) {
        socketService.off('queue-updated', queueUpdatedCallback);
        socketService.off('participants-updated', participantsUpdatedCallback);
        socketService.off('participant-joined', participantJoinedCallback);
        socketService.off('participant-left', participantLeftCallback);
        socketService.off('next-speaker', nextSpeakerCallback);
        socketService.off('error', errorCallback);
        socketService.socket.off('participant-left-queue', participantLeftQueueCallback);
        socketService.socket.off('speaker-changed', speakerChangedCallback);
      }
    };
  }, [participantName, navigate, notify]);

  const joinQueue = useCallback((type: string = 'speak') => {
    if (isInQueue || !isConnected) return;
    
    // Watchers cannot join the queue
    if (isWatcher) {
      notify('error', 'Read-Only Access', 'Watchers cannot join the speaking queue');
      return;
    }
    
    try {
      socketService.joinQueue(type);
      notify('success', 'Joined queue', type === 'speak' ? 'Speak' : type.replace('-', ' '));
      playBeep(1000, 120);
    } catch (err: unknown) {
      console.error('Join queue error:', err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify('error', errorInfo.title, errorInfo.description);
      playBeep(220, 200);
    }
  }, [isInQueue, isConnected, isWatcher, notify]);

  const leaveQueue = useCallback(() => {
    if (!isInQueue || !isConnected) return;
    
    // Watchers cannot leave the queue (they can't be in it)
    if (isWatcher) {
      notify('error', 'Read-Only Access', 'Watchers cannot leave the speaking queue');
      return;
    }
    
    try {
      socketService.leaveQueue();
      notify('info', 'Left queue');
      playBeep(600, 100);
    } catch (err: unknown) {
      console.error('Leave queue error:', err);
      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify('error', errorInfo.title, errorInfo.description);
      playBeep(220, 200);
    }
  }, [isInQueue, isConnected, isWatcher, notify]);

  const leaveMeeting = useCallback(() => {
    socketService.disconnect();
    navigate('/');
  }, [navigate]);

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
    leaveMeeting
  };
};