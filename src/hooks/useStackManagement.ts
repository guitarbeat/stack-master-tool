import { useState, useCallback } from 'react';
import { Participant, SpecialIntervention } from '@/types';
import { toast } from '@/hooks/use-toast';

interface UndoAction {
  id: string;
  type: 'remove' | 'next' | 'clear';
  data: {
    participant?: Participant;
    index?: number;
    previousStack?: Participant[];
    speaker?: Participant;
    previousInterventions?: SpecialIntervention[];
  };
  timestamp: Date;
  description: string;
}

export const useStackManagement = () => {
  const [stack, setStack] = useState<Participant[]>([]);
  const [interventions, setInterventions] = useState<SpecialIntervention[]>([]);
  const [undoHistory, setUndoHistory] = useState<UndoAction[]>([]);

  const addUndoAction = useCallback((action: Omit<UndoAction, 'id' | 'timestamp'>) => {
    const undoAction: UndoAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date()
    } as UndoAction;
    setUndoHistory(prev => [...prev.slice(-4), undoAction]); // Keep last 5 actions
  }, []);

  const addToStack = useCallback((participantName: string) => {
    if (!participantName.trim()) return;
    const newParticipant: Participant = { 
      id: Date.now().toString(), 
      name: participantName.trim(), 
      addedAt: new Date() 
    };
    setStack(prev => [...prev, newParticipant]);
    
    toast({ 
      title: "Added to stack", 
      description: `${newParticipant.name} added to speaking queue`
    });
    
    return newParticipant;
  }, []);

  const nextSpeaker = useCallback(() => {
    if (stack.length === 0) return null;
    const currentSpeaker = stack[0];
    const remainingStack = stack.slice(1);
    
    // Add to undo history
    addUndoAction({
      type: 'next',
      data: { speaker: currentSpeaker, previousStack: stack },
      description: `${currentSpeaker.name} finished speaking`
    });
    
    setStack(remainingStack);
    
    toast({ 
      title: "Next speaker", 
      description: `${currentSpeaker.name} finished speaking` + 
        (remainingStack.length > 0 ? ` • ${remainingStack[0].name} is now speaking` : '')
    });
    
    return { currentSpeaker, remainingStack };
  }, [stack, addUndoAction]);

  const removeFromStack = useCallback((id: string) => {
    const participant = stack.find(p => p.id === id);
    if (!participant) return;
    
    const participantIndex = stack.findIndex(p => p.id === id);
    
    // Add to undo history
    addUndoAction({
      type: 'remove',
      data: { participant, index: participantIndex, previousStack: stack },
      description: `Removed ${participant.name} from queue`
    });
    
    setStack(prev => prev.filter(p => p.id !== id));
    
    toast({ 
      title: "Removed from stack", 
      description: `${participant.name} removed from queue` 
    });
    
    return participant;
  }, [stack, addUndoAction]);

  const addIntervention = useCallback((type: SpecialIntervention['type'], participantName: string) => {
    const intervention: SpecialIntervention = { 
      id: Date.now().toString(), 
      type, 
      participant: participantName, 
      timestamp: new Date() 
    };
    setInterventions(prev => [...prev, intervention]);
    toast({ 
      title: "Intervention recorded", 
      description: `${participantName} - ${type} recorded` 
    });
  }, []);

  const clearAll = useCallback(() => {
    if (stack.length === 0 && interventions.length === 0) return;
    
    // Add to undo history
    addUndoAction({
      type: 'clear',
      data: { previousStack: stack, previousInterventions: interventions },
      description: "Cleared all participants and interventions"
    });
    
    setStack([]);
    setInterventions([]);
    toast({ title: "Stack cleared", description: "All participants removed from queue" });
  }, [stack, interventions, addUndoAction]);

  const handleUndo = useCallback(() => {
    const lastAction = undoHistory[undoHistory.length - 1];
    if (!lastAction) return;

    switch (lastAction.type) {
      case 'remove': {
        const { participant, index } = lastAction.data;
        setStack(prev => {
          const newStack = [...prev];
          newStack.splice(index, 0, participant);
          return newStack;
        });
        break;
      }
      case 'next': {
        setStack(lastAction.data.previousStack);
        break;
      }
      case 'clear': {
        setStack(lastAction.data.previousStack);
        setInterventions(lastAction.data.previousInterventions);
        break;
      }
    }

    setUndoHistory(prev => prev.slice(0, -1));
    toast({ title: "Action undone", description: lastAction.description });
  }, [undoHistory]);

  const reorderStack = useCallback((dragIndex: number, targetIndex: number) => {
    setStack(prev => {
      const newStack = [...prev];
      const [moved] = newStack.splice(dragIndex, 1);
      // Adjust target if removal shifted indices
      const adjustedTarget = dragIndex < targetIndex ? targetIndex - 1 : targetIndex;
      newStack.splice(adjustedTarget, 0, moved);
      return newStack;
    });
  }, []);

  return {
    stack,
    setStack,
    interventions,
    setInterventions,
    undoHistory,
    addToStack,
    nextSpeaker,
    removeFromStack,
    addIntervention,
    clearAll,
    handleUndo,
    reorderStack
  };
};