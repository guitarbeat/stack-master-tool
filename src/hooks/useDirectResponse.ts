import { useState, useCallback } from 'react';
import { Participant, DirectResponseState } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useDirectResponse = () => {
  const [directResponse, setDirectResponse] = useState<DirectResponseState>({
    isActive: false,
    participantId: '',
    originalQueue: []
  });

  const startDirectResponse = useCallback((participant: Participant, currentStack: Participant[]) => {
    // Prevent multiple direct responses
    if (directResponse.isActive) {
      toast({ 
        title: "Direct Response Already Active", 
        description: "Please finish the current direct response before starting another",
        variant: "destructive"
      });
      return false;
    }
    
    // Store original queue and move participant to front temporarily
    setDirectResponse({
      isActive: true,
      participantId: participant.id,
      originalQueue: [...currentStack]
    });
    
    toast({ 
      title: "Direct Response Active", 
      description: `${participant.name} temporarily moved to front for direct response. Original queue will be restored when finished.` 
    });
    
    return true;
  }, [directResponse.isActive]);

  const finishDirectResponse = useCallback(() => {
    if (!directResponse.isActive) return null;
    
    // Restore original queue order (minus the person who just spoke)
    const remainingQueue = directResponse.originalQueue.filter(p => p.id !== directResponse.participantId);
    
    // Reset direct response state
    setDirectResponse({
      isActive: false,
      participantId: '',
      originalQueue: []
    });
    
    toast({ 
      title: "Direct Response Complete", 
      description: `Queue restored to original order. ${remainingQueue.length > 0 ? `${remainingQueue[0].name} is now speaking` : 'No one in queue'}` 
    });
    
    return remainingQueue;
  }, [directResponse]);

  const isDirectResponseActive = directResponse.isActive;
  const directResponseParticipantId = directResponse.participantId;

  return {
    directResponse,
    startDirectResponse,
    finishDirectResponse,
    isDirectResponseActive,
    directResponseParticipantId
  };
};