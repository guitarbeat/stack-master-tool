import { useState, useCallback } from 'react';
import { useSupabaseFacilitator } from './useSupabaseFacilitator';
import { useStackManagement } from './useStackManagement';
import { useSimpleMeetingCreation } from './useSimpleMeetingCreation';
import { toast } from './use-toast';

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

  // Meeting creation
  const { createMeeting: createMeetingAPI, isCreating } = useSimpleMeetingCreation();

  // Remote meeting management (only when enabled)
  const remoteManagement = useSupabaseFacilitator(
    isRemoteEnabled ? meetingCode || '' : '',
    facilitatorName
  );

  const enableRemoteMode = useCallback(async (title: string): Promise<string> => {
    setIsCreatingMeeting(true);
    try {
      const result = await createMeetingAPI(facilitatorName, title);
      
      setMeetingCode(result.meetingCode);
      setMeetingTitle(title);
      setIsRemoteEnabled(true);
      
      toast({
        title: 'Remote Access Enabled',
        description: `Meeting code: ${result.meetingCode}`,
      });
      
      return result.meetingCode;
    } catch (error) {
      console.error('Error enabling remote mode:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable remote access',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsCreatingMeeting(false);
    }
  }, [createMeetingAPI, facilitatorName]);

  const disableRemoteMode = useCallback(() => {
    setIsRemoteEnabled(false);
    setMeetingCode(null);
    setMeetingTitle('');
    toast({
      title: 'Remote Access Disabled',
      description: 'Switched to manual mode',
    });
  }, []);

  // Unified actions that work with both manual and remote
  const addParticipant = useCallback((name: string) => {
    if (isRemoteEnabled) {
      // In remote mode, participants join themselves
      toast({
        title: 'Remote Mode',
        description: 'Participants can join using the meeting code',
      });
    } else {
      manualStack.addToStack(name);
    }
  }, [isRemoteEnabled, manualStack]);

  const nextSpeaker = useCallback(() => {
    if (isRemoteEnabled && remoteManagement.nextSpeaker) {
      return remoteManagement.nextSpeaker();
    } else {
      return manualStack.nextSpeaker();
    }
  }, [isRemoteEnabled, remoteManagement, manualStack]);

  const removeFromStack = useCallback((id: string) => {
    if (isRemoteEnabled && remoteManagement.removeFromQueue) {
      remoteManagement.removeFromQueue(id);
    } else {
      manualStack.removeFromStack(id);
    }
  }, [isRemoteEnabled, remoteManagement, manualStack]);

  const addIntervention = useCallback((type: 'direct-response' | 'clarifying-question', participantName: string) => {
    if (isRemoteEnabled && remoteManagement.addIntervention) {
      remoteManagement.addIntervention(type, participantName);
    } else {
      manualStack.addIntervention(type, participantName);
    }
  }, [isRemoteEnabled, remoteManagement, manualStack]);

  const clearAll = useCallback(() => {
    if (isRemoteEnabled && remoteManagement.clearQueue) {
      remoteManagement.clearQueue();
    } else {
      manualStack.clearAll();
    }
  }, [isRemoteEnabled, remoteManagement, manualStack]);

  const handleUndo = useCallback(() => {
    if (!isRemoteEnabled) {
      manualStack.handleUndo();
    }
  }, [isRemoteEnabled, manualStack]);

  const reorderStack = useCallback((dragIndex: number, targetIndex: number) => {
    if (!isRemoteEnabled) {
      manualStack.reorderStack(dragIndex, targetIndex);
    }
  }, [isRemoteEnabled, manualStack]);

  return {
    // State
    isRemoteEnabled,
    meetingCode,
    meetingTitle,
    isCreatingMeeting: isCreating || isCreatingMeeting,
    facilitatorName,

    // Current data (manual or remote)
    stack: isRemoteEnabled ? remoteManagement.queue : manualStack.stack,
    interventions: manualStack.interventions,
    participants: isRemoteEnabled ? remoteManagement.participants : [],
    currentSpeaker: isRemoteEnabled ? remoteManagement.currentSpeaker : null,
    
    // Expose underlying managers for backward compatibility
    manualStack,
    remoteManagement,
    speakingQueue: isRemoteEnabled ? remoteManagement.queue : [],
    
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
  };
};
