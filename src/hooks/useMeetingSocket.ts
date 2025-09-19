import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socket';
import { toast } from '@/hooks/use-toast';
import { playBeep } from '../utils/sound.js';

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

export const useMeetingSocket = (participantName: string, meetingInfo: MeetingData) => {
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

    const errorCallback = (error: { message?: string }) => {
      setError(error.message || 'Connection error');
      notify('error', error.message || 'Connection error');
    };

    const setupSocketListeners = () => {
      socketService.onQueueUpdated(queueUpdatedCallback);
      socketService.onParticipantsUpdated(participantsUpdatedCallback);
      socketService.onParticipantJoined(participantJoinedCallback);
      socketService.onParticipantLeft(participantLeftCallback);
      socketService.onNextSpeaker(nextSpeakerCallback);
      socketService.onError(errorCallback);
    };

    if (!socketService.isConnected) {
      try {
        socketService.connect();
        setupSocketListeners();
        setIsConnected(true);
      } catch (err: unknown) {
        console.error('Connection error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect to meeting. Please check your internet connection and try again.';
        setError(errorMessage);
      }
    } else {
      setupSocketListeners();
      setIsConnected(true);
    }

    return () => {
      // Remove specific listeners using stored callback references
      socketService.off('queue-updated', queueUpdatedCallback);
      socketService.off('participants-updated', participantsUpdatedCallback);
      socketService.off('participant-joined', participantJoinedCallback);
      socketService.off('participant-left', participantLeftCallback);
      socketService.off('next-speaker', nextSpeakerCallback);
      socketService.off('error', errorCallback);
    };
  }, [participantName, navigate, notify]);

  const joinQueue = useCallback((type: string = 'speak') => {
    if (isInQueue || !isConnected) return;
    
    try {
      socketService.joinQueue(type);
      notify('success', 'Joined queue', type === 'speak' ? 'Speak' : type.replace('-', ' '));
      playBeep(1000, 120);
    } catch (err: unknown) {
      console.error('Join queue error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to join queue. Please try again.';
      setError(errorMessage);
      notify('error', errorMessage);
      playBeep(220, 200);
    }
  }, [isInQueue, isConnected, notify]);

  const leaveQueue = useCallback(() => {
    if (!isInQueue || !isConnected) return;
    
    try {
      socketService.leaveQueue();
      notify('info', 'Left queue');
      playBeep(600, 100);
    } catch (err: unknown) {
      console.error('Leave queue error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave queue. Please try again.';
      setError(errorMessage);
      notify('error', errorMessage);
      playBeep(220, 200);
    }
  }, [isInQueue, isConnected, notify]);

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