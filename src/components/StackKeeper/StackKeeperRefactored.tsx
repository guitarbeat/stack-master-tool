import { useState, useRef, useCallback, useMemo } from "react";
import { useSpeakerTimer } from "@/hooks/useSpeakerTimer";
import { useStackManagement } from "@/hooks/useStackManagement";
import { useParticipantManagement } from "@/hooks/useParticipantManagement";
import { useDirectResponse } from "@/hooks/useDirectResponse";
import { useSpeakingHistory } from "@/hooks/useSpeakingHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { StackHeader } from "./StackHeader";
import { AddParticipant } from "./AddParticipant";
import { CurrentSpeaker } from "./CurrentSpeaker";
import { SpeakingQueue } from "./SpeakingQueue";
import { InterventionsPanel } from "./InterventionsPanel";
import { SpeakingDistribution } from "./SpeakingDistribution";
import { Participant, SpecialIntervention, INTERVENTION_TYPES } from "@/types";

interface StackKeeperProps {
  showInterventionsPanel?: boolean;
}

export const StackKeeperRefactored = ({ showInterventionsPanel = true }: StackKeeperProps) => {
  const [newParticipantName, setNewParticipantName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllUpNext, setShowAllUpNext] = useState(false);
  const [includeDirectResponsesInChart, setIncludeDirectResponsesInChart] = useState(true);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Custom hooks
  const {
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
  } = useStackManagement();

  const {
    recentParticipants,
    addRecentParticipant,
    addExistingToStack
  } = useParticipantManagement();

  const {
    directResponse,
    startDirectResponse,
    finishDirectResponse,
    isDirectResponseActive,
    directResponseParticipantId
  } = useDirectResponse();

  const {
    addSpeakingSegment,
    clearSpeakingHistory,
    getSpeakingDistribution
  } = useSpeakingHistory();

  const {
    speakerTimer,
    elapsedTime,
    startTimer: startSpeakerTimer,
    pauseTimer: pauseSpeakerTimer,
    resumeTimer: resumeSpeakerTimer,
    resetTimer: resetSpeakerTimer,
    stopTimer: stopSpeakerTimer,
    formatTime
  } = useSpeakerTimer();

  // Keyboard shortcuts with stable references
  const keyboardShortcuts = useMemo(() => ({
    onFocusAddInput: () => inputRef.current?.focus(),
    onFocusSearch: () => searchRef.current?.focus(),
    onNextSpeaker: () => {
      if (stack.length > 0) {
        const currentSpeaker = stack[0];
        if (speakerTimer) {
          const durationMs = Date.now() - speakerTimer.startTime.getTime();
          addSpeakingSegment(
            currentSpeaker.id,
            currentSpeaker.name,
            durationMs,
            isDirectResponseActive && directResponseParticipantId === currentSpeaker.id
          );
        }
        const result = nextSpeaker();
        if (result?.remainingStack.length > 0) {
          startSpeakerTimer(result.remainingStack[0].id);
        } else {
          stopSpeakerTimer();
        }
      }
    },
    onUndo: handleUndo,
  }), [stack, speakerTimer, addSpeakingSegment, isDirectResponseActive, directResponseParticipantId, nextSpeaker, startSpeakerTimer, stopSpeakerTimer, handleUndo]);

  const { showKeyboardShortcuts, toggleShortcuts } = useKeyboardShortcuts(keyboardShortcuts);

  // Enhanced add to stack function
  const handleAddToStack = useCallback(() => {
    if (!newParticipantName.trim()) return;
    
    const newParticipant = addToStack(newParticipantName);
    if (newParticipant) {
      addRecentParticipant(newParticipant.name);
      setNewParticipantName("");
      
      // Start timer if this is the first person
      if (stack.length === 0) {
        startSpeakerTimer(newParticipant.id);
      }
    }
  }, [newParticipantName, addToStack, addRecentParticipant, stack.length, startSpeakerTimer]);

  // Enhanced next speaker function
  const handleNextSpeaker = useCallback(() => {
    if (stack.length === 0) return;
    
    const currentSpeaker = stack[0];
    
    // Record the finished speaking segment for the current speaker
    if (speakerTimer) {
      const durationMs = Date.now() - speakerTimer.startTime.getTime();
      addSpeakingSegment(
        currentSpeaker.id,
        currentSpeaker.name,
        durationMs,
        isDirectResponseActive && directResponseParticipantId === currentSpeaker.id
      );
    }
    
    const result = nextSpeaker();
    if (result) {
      const { remainingStack } = result;
      
      // Start timer for next speaker
      if (remainingStack.length > 0) {
        startSpeakerTimer(remainingStack[0].id);
      } else {
        stopSpeakerTimer();
      }
    }
  }, [stack, speakerTimer, addSpeakingSegment, isDirectResponseActive, directResponseParticipantId, nextSpeaker, startSpeakerTimer, stopSpeakerTimer]);

  // Enhanced remove from stack function
  const handleRemoveFromStack = useCallback((id: string) => {
    const participant = stack.find(p => p.id === id);
    if (!participant) return;
    
    const wasCurrentSpeaker = stack.findIndex(p => p.id === id) === 0;
    
    // If removing current speaker, record their segment so far
    if (wasCurrentSpeaker && speakerTimer) {
      const durationMs = Date.now() - speakerTimer.startTime.getTime();
      addSpeakingSegment(
        participant.id,
        participant.name,
        durationMs,
        isDirectResponseActive && directResponseParticipantId === participant.id
      );
    }
    
    removeFromStack(id);
    
    // Handle timer if current speaker was removed
    if (wasCurrentSpeaker) {
      const newStack = stack.filter(p => p.id !== id);
      if (newStack.length > 0) {
        startSpeakerTimer(newStack[0].id);
      } else {
        stopSpeakerTimer();
      }
    }
  }, [stack, speakerTimer, addSpeakingSegment, isDirectResponseActive, directResponseParticipantId, removeFromStack, startSpeakerTimer, stopSpeakerTimer]);

  // Enhanced intervention handling
  const handleInterventionSubmit = useCallback((participantName: string, type: SpecialIntervention['type']) => {
    if (type === 'direct-response') {
      // Find the participant in the stack
      const participant = stack.find(p => p.name === participantName);
      if (!participant) {
        return;
      }
      
      if (startDirectResponse(participant, stack)) {
        // Move participant to front of queue
        const newStack = [participant, ...stack.filter(p => p.id !== participant.id)];
        setStack(newStack);
        
        // Start timer for direct response speaker
        startSpeakerTimer(participant.id);
      }
    } else if (type === 'clarifying-question') {
      addIntervention(type, participantName);
    }
  }, [stack, startDirectResponse, setStack, startSpeakerTimer, addIntervention]);

  // Enhanced finish direct response
  const handleFinishDirectResponse = useCallback(() => {
    if (!isDirectResponseActive) return;
    
    // Record the direct response segment for the person who just spoke
    if (speakerTimer) {
      const drParticipant = stack[0];
      if (drParticipant) {
        const durationMs = Date.now() - speakerTimer.startTime.getTime();
        addSpeakingSegment(drParticipant.id, drParticipant.name, durationMs, true);
      }
    }
    
    const remainingQueue = finishDirectResponse();
    if (remainingQueue) {
      setStack(remainingQueue);
      
      // Start timer for next person if queue exists
      if (remainingQueue.length > 0) {
        startSpeakerTimer(remainingQueue[0].id);
      } else {
        stopSpeakerTimer();
      }
    }
  }, [isDirectResponseActive, speakerTimer, stack, addSpeakingSegment, finishDirectResponse, setStack, startSpeakerTimer, stopSpeakerTimer]);

  // Enhanced clear all function
  const handleClearAll = useCallback(() => {
    clearAll();
    stopSpeakerTimer();
    clearSpeakingHistory();
  }, [clearAll, stopSpeakerTimer, clearSpeakingHistory]);

  // Timer controls
  const toggleSpeakerTimer = useCallback(() => {
    if (!speakerTimer) return;
    if (speakerTimer.isActive) {
      pauseSpeakerTimer();
    } else {
      resumeSpeakerTimer();
    }
  }, [speakerTimer, pauseSpeakerTimer, resumeSpeakerTimer]);

  // Get speaking distribution data
  const speakingData = getSpeakingDistribution(includeDirectResponsesInChart);

  return (
    <div className="container mx-auto px-4 py-8">
      <StackHeader
        stackLength={stack.length}
        undoHistoryLength={undoHistory.length}
        onUndo={handleUndo}
        onToggleShortcuts={toggleShortcuts}
        showKeyboardShortcuts={showKeyboardShortcuts}
      />

      <AddParticipant
        newParticipantName={newParticipantName}
        onNameChange={setNewParticipantName}
        onAddToStack={handleAddToStack}
        onFocusAddInput={() => inputRef.current?.focus()}
        showKeyboardShortcuts={showKeyboardShortcuts}
      />

      <SpeakingQueue
        stack={stack}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRemoveFromStack={handleRemoveFromStack}
        onIntervention={handleInterventionSubmit}
        onFinishDirectResponse={handleFinishDirectResponse}
        onClearAll={handleClearAll}
        onReorderStack={reorderStack}
        recentParticipants={recentParticipants}
        onAddExistingToStack={(name) => addExistingToStack(name, addToStack)}
        directResponseParticipantId={directResponseParticipantId}
      />

      {stack.length > 0 && (
        <CurrentSpeaker
          currentSpeaker={stack[0]}
          stack={stack}
          showAllUpNext={showAllUpNext}
          onToggleShowAllUpNext={() => setShowAllUpNext(!showAllUpNext)}
          onNextSpeaker={handleNextSpeaker}
          speakerTimer={speakerTimer}
          elapsedTime={elapsedTime}
          onToggleTimer={toggleSpeakerTimer}
          onResetTimer={resetSpeakerTimer}
          formatTime={formatTime}
          isDirectResponse={isDirectResponseActive}
        />
      )}

      <InterventionsPanel
        interventions={interventions}
        onClearInterventions={() => setInterventions([])}
        showInterventionsPanel={showInterventionsPanel}
      />

      <SpeakingDistribution
        speakingData={speakingData}
        includeDirectResponses={includeDirectResponsesInChart}
        onToggleIncludeDirectResponses={() => setIncludeDirectResponsesInChart(!includeDirectResponsesInChart)}
      />
    </div>
  );
};