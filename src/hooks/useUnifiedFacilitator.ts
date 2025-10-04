import { useState, useCallback } from 'react';
import { useSupabaseFacilitator } from './useSupabaseFacilitator';
import { useStackManagement } from './useStackManagement';
// @ts-ignore
import apiService from '../services/api.js';
import { toast } from './use-toast';
// @ts-ignore
import { playBeep } from '../utils/sound.js';

interface Participant {
  id: string;
  name: string;
  is_facilitator: boolean;
  joined_at: string;
  is_active: boolean;
}

export const useUnifiedFacilitator = (facilitatorName: string) => {
  const [isRemoteEnabled, setIsRemoteEnabled] = useState(false);
  const [meetingCode, setMeetingCode] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);

  // Manual stack management (always available)
  const manualStack = useStackManagement();

  // Remote meeting management (only when enabled)
  const remoteManagement = useSupabaseFacilitator(
    isRemoteEnabled ? meetingCode || '' : '',
    facilitatorName
  );

  const enableRemoteMode = useCallback(async (title: string) => {
    setIsCreatingMeeting(true);
    try {
      const response = await apiService.createMeeting(facilitatorName, title);
      setMeetingCode(response.meetingCode);
      setMeetingTitle(title);
      setIsRemoteEnabled(true);
      
      toast({
        title: 'Remote access enabled',
        description: `Meeting code: ${response.meetingCode}`,
      });
      playBeep(1000, 120);
      
      return response.meetingCode;
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable remote access',
        variant: 'destructive',
      });
      playBeep(220, 200);
      throw error;
    } finally {
      setIsCreatingMeeting(false);
    }
  }, [facilitatorName]);

  const disableRemoteMode = useCallback(() => {
    if (remoteManagement.disconnect) {
      remoteManagement.disconnect();
    }
    setIsRemoteEnabled(false);
    setMeetingCode(null);
    
    toast({
      title: 'Remote access disabled',
      description: 'Meeting is now local only',
    });
  }, [remoteManagement]);

  // Unified participant list (manual + remote)
  const allParticipants = isRemoteEnabled
    ? remoteManagement.participants
    : manualStack.stack.map((p): Participant => ({
        id: p.id,
        name: p.name,
        is_facilitator: false,
        joined_at: new Date().toISOString(),
        is_active: true,
      }));

  // Unified speaking queue
  const speakingQueue = isRemoteEnabled
    ? remoteManagement.speakingQueue
    : manualStack.stack.map((p, index) => ({
        id: p.id,
        participantName: p.name,
        queue_type: 'speak' as const,
        position: index + 1,
        joined_queue_at: new Date().toISOString(),
        is_speaking: index === 0,
        participant_id: p.id,
        meeting_id: '',
      }));

  // Unified current speaker
  const currentSpeaker = isRemoteEnabled
    ? remoteManagement.currentSpeaker
    : manualStack.stack.length > 0
      ? {
          id: manualStack.stack[0].id,
          participantName: manualStack.stack[0].name,
          queue_type: 'speak' as const,
          participant_id: manualStack.stack[0].id,
          meeting_id: '',
        }
      : null;

  // Unified next speaker action
  const nextSpeaker = useCallback(() => {
    if (isRemoteEnabled) {
      remoteManagement.nextSpeaker();
    } else {
      manualStack.removeFromStack(manualStack.stack[0]?.id);
    }
  }, [isRemoteEnabled, remoteManagement, manualStack]);

  // Unified add participant
  const addParticipant = useCallback((name: string) => {
    if (isRemoteEnabled) {
      // Remote participants join via their own interface
      toast({
        title: 'Remote Mode',
        description: 'Participants join using the meeting code',
      });
    } else {
      manualStack.addToStack(name);
    }
  }, [isRemoteEnabled, manualStack]);

  return {
    // Mode state
    isRemoteEnabled,
    meetingCode,
    meetingTitle,
    isCreatingMeeting,
    
    // Mode actions
    enableRemoteMode,
    disableRemoteMode,
    
    // Unified data
    participants: allParticipants,
    speakingQueue,
    currentSpeaker,
    
    // Unified actions
    nextSpeaker,
    addParticipant,
    
    // Manual stack actions (when in manual mode)
    manualStack,
    
    // Remote management (when in remote mode)
    remoteManagement,
    
    // Connection state
    isConnected: isRemoteEnabled ? remoteManagement.isConnected : true,
    error: isRemoteEnabled ? remoteManagement.error : null,
  };
};
