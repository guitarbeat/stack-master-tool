import { useState, useEffect, useCallback, useRef } from "react";
import { useSpeakerTimer } from "@/hooks/useSpeakerTimer";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { toast } from "@/hooks/use-toast";
import { Participant, SpecialIntervention, INTERVENTION_TYPES, DirectResponseState } from "@/types";
import { StackControls } from "./StackControls";
import { CurrentSpeakerDisplay } from "./CurrentSpeakerDisplay";
import { QueueList } from "./QueueList";
import { InterventionsPanel } from "./InterventionsPanel";
import { SpeakingAnalytics } from "./SpeakingAnalytics";

interface RemoveUndoAction {
  id: string;
  type: 'remove';
  data: {
    participant: Participant;
    index: number;
    previousStack: Participant[];
  };
  timestamp: Date;
  description: string;
}

interface NextUndoAction {
  id: string;
  type: 'next';
  data: {
    speaker: Participant;
    previousStack: Participant[];
  };
  timestamp: Date;
  description: string;
}

interface ClearUndoAction {
  id: string;
  type: 'clear';
  data: {
    previousStack: Participant[];
    previousInterventions: SpecialIntervention[];
  };
  timestamp: Date;
  description: string;
}

type UndoAction = RemoveUndoAction | NextUndoAction | ClearUndoAction;

interface SpeakingSegment {
  participantId: string;
  participantName: string;
  durationMs: number;
  isDirectResponse: boolean;
}

interface StackKeeperProps {
  showInterventionsPanel?: boolean;
}

export const StackKeeper = ({ showInterventionsPanel = true }: StackKeeperProps) => {
  const [stack, setStack] = useState<Participant[]>([]);
  const [interventions, setInterventions] = useState<SpecialIntervention[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [undoHistory, setUndoHistory] = useState<UndoAction[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [directResponse, setDirectResponse] = useState<DirectResponseState>({
    isActive: false,
    participantId: '',
    originalQueue: []
  });
  const [recentParticipants, setRecentParticipants] = useState<string[]>([]);
  const [showAllUpNext, setShowAllUpNext] = useState(false);
  const [includeDirectResponsesInChart, setIncludeDirectResponsesInChart] = useState(true);

  // Use the consolidated timer hook
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

  // Use the drag and drop hook
  const {
    dragIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isDragOver
  } = useDragAndDrop();

  const [speakingHistory, setSpeakingHistory] = useState<SpeakingSegment[]>([]);

  // Load recent participants from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentParticipants');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentParticipants(parsed.filter((n) => typeof n === 'string'));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save recent participants to localStorage
  useEffect(() => {
    if (recentParticipants.length > 0) {
      localStorage.setItem('recentParticipants', JSON.stringify(recentParticipants));
    }
  }, [recentParticipants]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            // Focus will be handled by the StackControls component
            break;
          case 'f':
            e.preventDefault();
            // Focus search will be handled by the StackControls component
            break;
          case 'z':
            e.preventDefault();
            if (undoHistory.length > 0) {
              handleUndo();
            }
            break;
        }
      } else {
        switch (e.key) {
          case 'Enter':
            if (stack.length > 0) {
              nextSpeaker();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stack.length, undoHistory.length]);

  const addUndoAction = useCallback((undoAction: UndoAction) => {
    setUndoHistory(prev => [...prev.slice(-4), undoAction]); // Keep last 5 actions
  }, []);

  const addToStack = () => {
    if (!recentParticipants.length) return;
    const newParticipant: Participant = { 
      id: Date.now().toString(), 
      name: recentParticipants[0], 
      addedAt: new Date() 
    };
    setStack(prev => [...prev, newParticipant]);
    
    // Add to recent participants if not already there
    setRecentParticipants(prev => {
      const name = newParticipant.name;
      if (prev.includes(name)) return prev;
      return [name, ...prev.slice(0, 9)]; // Keep last 10
    });

    // Start timer if this is the first person
    if (stack.length === 0) {
      startSpeakerTimer(newParticipant.id);
    }
  };

  const removeFromStack = (id: string) => {
    const participantIndex = stack.findIndex(p => p.id === id);
    if (participantIndex === -1) return;

    const participant = stack[participantIndex];
    const wasCurrentSpeaker = participantIndex === 0;
    
    // If removing current speaker, record their segment so far
    if (wasCurrentSpeaker && speakerTimer) {
      const durationMs = Date.now() - speakerTimer.startTime.getTime();
      if (durationMs > 0) {
        setSpeakingHistory(prev => [
          ...prev,
          {
            participantId: participant.id,
            participantName: participant.name,
            durationMs,
            isDirectResponse: directResponse.isActive && directResponse.participantId === participant.id,
          },
        ]);
      }
      stopSpeakerTimer();
    }

    // Add to undo history
    addUndoAction({
      id: Date.now().toString(),
      type: 'remove',
      data: {
        participant,
        index: participantIndex,
        previousStack: stack
      },
      timestamp: new Date(),
      description: `Removed ${participant.name} from stack`
    });

    setStack(prev => prev.filter(p => p.id !== id));

    // If this was the current speaker and there are more people, start timer for next
    if (wasCurrentSpeaker && stack.length > 1) {
      const nextSpeaker = stack[1];
      startSpeakerTimer(nextSpeaker.id);
    }
  };

  const nextSpeaker = () => {
    if (stack.length === 0) return;
    const currentSpeaker = stack[0];
    const remainingStack = stack.slice(1);
    
    // Record the finished speaking segment for the current speaker
    if (speakerTimer) {
      const durationMs = Date.now() - speakerTimer.startTime.getTime();
      if (durationMs > 0) {
        setSpeakingHistory(prev => [
          ...prev,
          {
            participantId: currentSpeaker.id,
            participantName: currentSpeaker.name,
            durationMs,
            isDirectResponse: directResponse.isActive && directResponse.participantId === currentSpeaker.id,
          },
        ]);
      }
    }

    // Add to undo history
    addUndoAction({
      id: Date.now().toString(),
      type: 'next',
      data: {
        speaker: currentSpeaker,
        previousStack: stack
      },
      timestamp: new Date(),
      description: `Moved ${currentSpeaker.name} to next speaker`
    });

    setStack(remainingStack);
    stopSpeakerTimer();

    // Start timer for next speaker if there is one
    if (remainingStack.length > 0) {
      startSpeakerTimer(remainingStack[0].id);
    }

    // Finish direct response if it was active
    if (directResponse.isActive) {
      finishDirectResponse();
    }
  };

  const addIntervention = (type: SpecialIntervention['type'], participantName: string) => {
    const intervention: SpecialIntervention = { id: Date.now().toString(), type, participant: participantName, timestamp: new Date() };
    setInterventions(prev => [...prev, intervention]);
    toast({ title: INTERVENTION_TYPES[type], description: `${participantName} - ${INTERVENTION_TYPES[type]} recorded` });
  };

  const handleInterventionSubmit = (participantName: string, type: SpecialIntervention['type']) => {
    if (type === 'direct-response') {
      // Find the participant in the stack
      const participant = stack.find(p => p.name === participantName);
      if (!participant) return;

      // Prevent multiple direct responses
      if (directResponse.isActive) {
        toast({ 
          title: "Direct Response Already Active", 
          description: "Please finish the current direct response before starting another",
          variant: "destructive"
        });
        return;
      }

      // Move participant to front
      const participantIndex = stack.findIndex(p => p.id === participant.id);
      const newStack = [participant, ...stack.filter(p => p.id !== participant.id)];
      setStack(newStack);

      // Set up direct response state
      setDirectResponse({
        isActive: true,
        participantId: participant.id,
        originalQueue: stack
      });

      // Start timer for direct response
      startSpeakerTimer(participant.id);
      
      toast({ 
        title: "Direct Response Active", 
        description: `${participantName} temporarily moved to front for direct response. Original queue will be restored when finished.` 
      });
    } else if (type === 'clarifying-question') {
      addIntervention(type, participantName);
    } else if (type === 'point-of-process') {
      addIntervention(type, participantName);
    }
  };

  const finishDirectResponse = () => {
    if (!directResponse.isActive) return;
    
    // Record the direct response segment for the person who just spoke
    if (speakerTimer) {
      const drParticipant = stack[0];
      if (drParticipant) {
        const durationMs = Date.now() - speakerTimer.startTime.getTime();
        if (durationMs > 0) {
          setSpeakingHistory(prev => [
            ...prev,
            {
              participantId: drParticipant.id,
              participantName: drParticipant.name,
              durationMs,
              isDirectResponse: true,
            },
          ]);
        }
      }
    }
    
    // Clear direct response state
    setDirectResponse({
      isActive: false,
      participantId: '',
      originalQueue: []
    });
    
    // Restore original queue order (minus the person who just spoke)
    const remainingQueue = directResponse.originalQueue.filter(p => p.id !== directResponse.participantId);
    setStack(remainingQueue);
    
    // No separate signal timer to stop anymore
    stopSpeakerTimer();
    
    toast({ 
      title: "Direct Response Complete", 
      description: `Queue restored to original order. ${remainingQueue.length > 0 ? `${remainingQueue[0].name} is now speaking` : 'No one in queue'}` 
    });
  };

  const toggleSpeakerTimer = () => {
    if (!speakerTimer) return;
    if (speakerTimer.isActive) {
      pauseSpeakerTimer();
    } else {
      resumeSpeakerTimer();
    }
  };

  const resetSpeakerTimer = () => {
    if (!speakerTimer) return;
    resetSpeakerTimer();
  };

  const handleUndo = () => {
    if (undoHistory.length === 0) return;
    
    const lastAction = undoHistory[undoHistory.length - 1];
    setUndoHistory(prev => prev.slice(0, -1));
    
    switch (lastAction.type) {
      case 'remove':
        setStack(lastAction.data.previousStack);
        break;
      case 'next':
        setStack(lastAction.data.previousStack);
        break;
      case 'clear':
        setStack(lastAction.data.previousStack);
        setInterventions(lastAction.data.previousInterventions);
        break;
    }
    
    toast({ title: "Undone", description: lastAction.description });
  };

  const clearAll = () => {
    if (stack.length === 0 && interventions.length === 0) return;
    
    // Add to undo history
    addUndoAction({
      id: Date.now().toString(),
      type: 'clear',
      data: { previousStack: stack, previousInterventions: interventions },
      description: "Cleared all participants and interventions"
    });
    
    setStack([]);
    setInterventions([]);
    stopSpeakerTimer();
    setDirectResponse({
      isActive: false,
      participantId: '',
      originalQueue: []
    });
    
    toast({ title: "Cleared", description: "All participants and interventions cleared" });
  };

  const addExistingToStack = (name: string) => {
    const newParticipant: Participant = { 
      id: Date.now().toString(), 
      name, 
      addedAt: new Date() 
    };
    setStack(prev => [...prev, newParticipant]);
    
    // Start timer if this is the first person
    if (stack.length === 0) {
      startSpeakerTimer(newParticipant.id);
    }
  };

  // Filter stack based on search query
  const filteredStack = stack.filter(participant =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <StackControls
        stack={stack}
        undoHistoryLength={undoHistory.length}
        showKeyboardShortcuts={showKeyboardShortcuts}
        onAddParticipant={addToStack}
        onUndo={handleUndo}
        onToggleKeyboardShortcuts={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        recentParticipants={recentParticipants}
        onAddExistingToStack={addExistingToStack}
      />

      {stack.length > 0 && (
        <div className="space-y-4 mb-8">
          <CurrentSpeakerDisplay
            currentSpeaker={stack[0]}
            speakerTimer={speakerTimer}
            elapsedTime={elapsedTime}
            directResponse={directResponse}
            onToggleTimer={toggleSpeakerTimer}
            onResetTimer={resetSpeakerTimer}
            onNextSpeaker={nextSpeaker}
            formatTime={formatTime}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QueueList
            stack={stack}
            filteredStack={filteredStack}
            searchQuery={searchQuery}
            showAllUpNext={showAllUpNext}
            onRemoveFromStack={removeFromStack}
            onInterventionSubmit={handleInterventionSubmit}
            onFinishDirectResponse={finishDirectResponse}
            onSetShowAllUpNext={setShowAllUpNext}
            onClearSearch={() => setSearchQuery("")}
          />
        </div>

        <div className="space-y-6">
          {showInterventionsPanel && (
            <InterventionsPanel
              interventions={interventions}
              onClearInterventions={() => setInterventions([])}
            />
          )}

          <SpeakingAnalytics
            speakingHistory={speakingHistory}
            includeDirectResponsesInChart={includeDirectResponsesInChart}
            onToggleIncludeDirectResponses={() => setIncludeDirectResponsesInChart(!includeDirectResponsesInChart)}
          />
        </div>
      </div>
    </div>
  );
};