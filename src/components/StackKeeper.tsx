import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Users, AlertTriangle, Search, Undo2, Timer, Keyboard, Filter, Clock, Play, Pause, RotateCcw, ArrowRight, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSpeakerTimer } from "@/hooks/useSpeakerTimer";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { StackItem } from "./StackItem";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { Participant, SpecialIntervention, INTERVENTION_TYPES, DirectResponseState } from "@/types";

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


interface StackKeeperProps {
  showInterventionsPanel?: boolean;
}

export const StackKeeper = ({ showInterventionsPanel = true }: StackKeeperProps) => {
  const [stack, setStack] = useState<Participant[]>([]);
  const [interventions, setInterventions] = useState<SpecialIntervention[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [undoHistory, setUndoHistory] = useState<UndoAction[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [directResponse, setDirectResponse] = useState<DirectResponseState>({
    isActive: false,
    participantId: '',
    originalQueue: []
  });
  const [recentParticipants, setRecentParticipants] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
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

  interface SpeakingSegment {
    participantId: string;
    participantName: string;
    durationMs: number;
    isDirectResponse: boolean;
  }
  const [speakingHistory, setSpeakingHistory] = useState<SpeakingSegment[]>([]);

  // Removed per simplification: separate signal timers for direct/question/clarify

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case 'n':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            inputRef.current?.focus();
          }
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            searchRef.current?.focus();
          }
          break;
        case 'Enter':
          if (stack.length > 0) {
            nextSpeaker();
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
        case '?':
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stack.length, showKeyboardShortcuts]);

  // Load recent participants from localStorage (persist across page reloads)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('manualStackRecentParticipants');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentParticipants(parsed.filter((n) => typeof n === 'string'));
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem('manualStackRecentParticipants', JSON.stringify(recentParticipants));
    } catch {
      // ignore storage failures
    }
  }, [recentParticipants]);

  const filteredStack = stack.filter(participant =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Removed per simplification: signal helpers (toggle/reset)

  const addUndoAction = useCallback((action: Omit<RemoveUndoAction, 'id' | 'timestamp'> | Omit<NextUndoAction, 'id' | 'timestamp'> | Omit<ClearUndoAction, 'id' | 'timestamp'>) => {
    const undoAction: UndoAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date()
    } as UndoAction;
    setUndoHistory(prev => [...prev.slice(-4), undoAction]); // Keep last 5 actions
  }, []);

  const addToStack = () => {
    if (!newParticipantName.trim()) return;
    const newParticipant: Participant = { id: Date.now().toString(), name: newParticipantName.trim(), addedAt: new Date() };
    setStack(prev => [...prev, newParticipant]);
    setNewParticipantName("");

    // Track in recent participants (persist across queue clears)
    setRecentParticipants(prev => {
      const name = newParticipant.name;
      const without = prev.filter(n => n.toLowerCase() !== name.toLowerCase());
      return [...without, name];
    });
    
    // Start timer if this is the first person
    if (stack.length === 0) {
      startSpeakerTimer(newParticipant.id);
    }
    
    toast({ 
      title: "Added to stack", 
      description: `${newParticipant.name} added to speaking queue`
    });
  };

  const addExistingToStack = (name: string) => {
    const participant: Participant = { id: Date.now().toString(), name, addedAt: new Date() };
    setStack(prev => [...prev, participant]);

    // Maintain MRU ordering in recent list
    setRecentParticipants(prev => {
      const without = prev.filter(n => n.toLowerCase() !== name.toLowerCase());
      return [...without, name];
    });

    if (stack.length === 0) {
      startSpeakerTimer(participant.id);
    }

    toast({
      title: "Added to stack",
      description: `${name} added to speaking queue again`
    });
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
      type: 'next',
      data: { speaker: currentSpeaker, previousStack: stack },
      description: `${currentSpeaker.name} finished speaking`
    });
    
    setStack(remainingStack);
    
    // Start timer for next speaker
    if (remainingStack.length > 0) {
      startSpeakerTimer(remainingStack[0].id);
    } else {
      stopSpeakerTimer();
    }
    
    toast({ 
      title: "Next speaker", 
      description: `${currentSpeaker.name} finished speaking` + 
        (remainingStack.length > 0 ? ` • ${remainingStack[0].name} is now speaking` : '')
    });
  };

  const removeFromStack = (id: string) => {
    const participant = stack.find(p => p.id === id);
    if (!participant) return;
    
    const participantIndex = stack.findIndex(p => p.id === id);
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
    }

    // Add to undo history
    addUndoAction({
      type: 'remove',
      data: { participant, index: participantIndex, previousStack: stack },
      description: `Removed ${participant.name} from queue`
    });
    
    setStack(prev => prev.filter(p => p.id !== id));
    
    // Handle timer if current speaker was removed
    if (wasCurrentSpeaker) {
      const newStack = stack.filter(p => p.id !== id);
      if (newStack.length > 0) {
        startSpeakerTimer(newStack[0].id);
      } else {
        stopSpeakerTimer();
      }
    }
    
    toast({ 
      title: "Removed from stack", 
      description: `${participant.name} removed from queue` 
    });
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
      if (!participant) {
        toast({ 
          title: "Participant not found", 
          description: `Could not find ${participantName} in the queue`,
          variant: "destructive"
        });
        return;
      }
      
      // Prevent multiple direct responses
      if (directResponse.isActive) {
        toast({ 
          title: "Direct Response Already Active", 
          description: "Please finish the current direct response before starting another",
          variant: "destructive"
        });
        return;
      }
      
      // Store original queue and move participant to front temporarily
      setDirectResponse({
        isActive: true,
        participantId: participant.id,
        originalQueue: [...stack]
      });
      
      // Move participant to front of queue
      const newStack = [participant, ...stack.filter(p => p.id !== participant.id)];
      setStack(newStack);
      
      // Start timer for direct response speaker
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
    
    // Restore original queue order (minus the person who just spoke)
    const remainingQueue = directResponse.originalQueue.filter(p => p.id !== directResponse.participantId);
    setStack(remainingQueue);
    
    // No separate signal timer to stop anymore
    
    // Reset direct response state
    setDirectResponse({
      isActive: false,
      participantId: '',
      originalQueue: []
    });
    
    // Start timer for next person if queue exists
    if (remainingQueue.length > 0) {
      startSpeakerTimer(remainingQueue[0].id);
    } else {
      stopSpeakerTimer();
    }
    
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

  const handleUndo = () => {
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
        if (lastAction.data.previousStack.length > 0) {
          startSpeakerTimer(lastAction.data.previousStack[0].id);
        } else {
          stopSpeakerTimer();
        }
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
  };

  const clearAll = () => {
    if (stack.length === 0 && interventions.length === 0) return;
    
    // Add to undo history
    addUndoAction({
      type: 'clear',
      data: { previousStack: stack, previousInterventions: interventions },
      description: "Cleared all participants and interventions"
    });
    
    setStack([]);
    setInterventions([]);
    stopSpeakerTimer();
    setSpeakingHistory([]);
    toast({ title: "Stack cleared", description: "All participants removed from queue" });
  };

  // Reorder function for drag and drop
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

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header + Add Participant & Controls (consolidated) */}
        <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800 mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Stack Facilitation</h1>
                <p className="text-gray-600 dark:text-zinc-400">
                  Democratic discussion management tool for facilitators and stack keepers
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center text-gray-600 dark:text-zinc-300">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{stack.length} participants</span>
                </div>
                {undoHistory.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUndo}
                    className="gap-2 hover-scale"
                    title="Undo last action (Ctrl+Z)"
                  >
                    <Undo2 className="h-4 w-4" />
                    Undo
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                  className="gap-2"
                  title="Show keyboard shortcuts"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-gray-600 dark:text-zinc-300 sm:hidden">
              <Users className="w-5 h-5" />
              <span>{stack.length} participants</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-zinc-100">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                Add to Stack
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Input
                ref={inputRef}
                placeholder="Enter participant name... (Ctrl+N)"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToStack()}
                className="flex-1 h-12 text-base border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl"
              />
              <Button onClick={addToStack} disabled={!newParticipantName.trim()} size="lg" className="px-4 sm:px-8 h-12 floating-glow rounded-xl font-medium w-full sm:w-auto">
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add to Stack</span>
              </Button>
            </div>
            {showKeyboardShortcuts && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-zinc-100">
                  <Keyboard className="h-4 w-4" />
                  Keyboard Shortcuts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><kbd className="kbd">Ctrl+N</kbd> Focus add input</div>
                  <div><kbd className="kbd">Ctrl+F</kbd> Focus search</div>
                  <div><kbd className="kbd">Enter</kbd> Next speaker</div>
                  <div><kbd className="kbd">Ctrl+Z</kbd> Undo last action</div>
                  <div><kbd className="kbd">?</kbd> Show/hide shortcuts</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        

        {/* Current Stack */}
        <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800 mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-4 text-2xl font-semibold text-gray-900 dark:text-zinc-100">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              Speaking Queue
              <span className="ml-3 inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium">
                {filteredStack.length} {filteredStack.length === 1 ? 'person' : 'people'}
                {searchQuery && ` (${stack.length} total)`}
              </span>
            </CardTitle>
            <div className="flex items-center gap-3">
              {stack.length > 0 && (
                <span className="hidden md:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-accent border-accent/30">
                  <span role="img" aria-label="mic">🎤</span>
                  <span>Speaking</span>
                  <span className="text-foreground">{stack[0].name}</span>
                </span>
              )}
              {stack.length > 1 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={searchRef}
                    placeholder="Search participants... (Ctrl+F)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-8 w-48 h-9 text-sm rounded-xl"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full p-0"
                      title="Clear search"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </Button>
                  )}
                </div>
              )}
              {stack.length > 0 && (
                <Button variant="destructive" size="sm" onClick={clearAll} className="floating-glow rounded-xl">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            {/* Signal timers removed per request */}
            {recentParticipants.length > 0 && (
              <div className="-mt-1">
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 whitespace-nowrap">Recent Participants</span>
                  {recentParticipants.slice().reverse().map((name) => (
                    <Button
                      key={name}
                      variant="outline"
                      size="sm"
                      className="rounded-full h-7 px-2 text-xs"
                      onClick={() => addExistingToStack(name)}
                      title={`Add ${name} to stack`}
                    >
                      <Plus className="h-3 w-3 mr-1" /> {name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {stack.length > 0 && (
              <div className="space-y-4">
                {/* Current Speaker - Enhanced display integrated into queue */}
                <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 shadow-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                          <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-20"></div>
                        </div>
                        <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                          {directResponse.isActive ? "Direct Response" : "Currently Speaking"}
                        </span>
                        {directResponse.isActive && (
                          <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs font-semibold rounded-full border border-orange-200 dark:border-orange-800">
                            Responding
                          </div>
                        )}
                        {speakerTimer && (
                          <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                            <Timer className="h-4 w-4 text-accent" />
                            <span className="font-mono text-lg font-bold text-accent">
                              {formatTime(elapsedTime)}
                            </span>
                            <div className="flex gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleSpeakerTimer}
                                className="h-7 w-7 p-0 hover:bg-accent/20"
                                title={speakerTimer.isActive ? "Pause timer" : "Resume timer"}
                              >
                                {speakerTimer.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetSpeakerTimer}
                                className="h-7 w-7 p-0 hover:bg-accent/20"
                                title="Reset timer"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-primary">{stack[0].name}</h3>
                      {stack.length > 1 && (
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-accent/10">
                            <Clock className="h-4 w-4 text-accent" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Up next:</span>
                          {!showAllUpNext ? (
                            <>
                              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold border-accent/30 text-accent">
                                {stack[1].name}
                              </span>
                              {stack.length > 2 && (
                                <>
                                  <span className="text-sm text-muted-foreground font-medium">+{stack.length - 2} more</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => setShowAllUpNext(true)}
                                  >
                                    Show more
                                  </Button>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {stack.slice(1).map((p) => (
                                <span key={p.id} className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold border-accent/30 text-accent">
                                  {p.name}
                                </span>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => setShowAllUpNext(false)}
                              >
                                Show less
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        size="lg" 
                        onClick={nextSpeaker} 
                        className="floating-glow px-6 py-3 text-base font-semibold rounded-xl group whitespace-nowrap bg-primary hover:bg-primary/90"
                      >
                        Next Speaker
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Queue separator */}
                {stack.length > 1 && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-sm font-medium text-muted-foreground px-3">Speaking Queue</span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                )}
              </div>
            )}
            {stack.length > 0 && <Separator className="my-2" />}
            {stack.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-zinc-400 text-lg mb-2">No one in stack</p>
                <p className="text-sm text-gray-400 dark:text-zinc-500">Add participants above to begin the discussion</p>
              </div>
            ) : filteredStack.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-zinc-400 text-lg mb-2">No participants match your search</p>
                <p className="text-sm text-gray-400 dark:text-zinc-500">Try adjusting your search term</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSearchQuery("")} 
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStack.map((participant, index) => {
                  const actualIndex = stack.findIndex(p => p.id === participant.id);
                  const isCurrentSpeaker = actualIndex === 0;
                  
                  // Skip rendering the current speaker here since it's shown in the enhanced display above
                  if (isCurrentSpeaker) return null;
                  
                  return (
                    <div
                      key={participant.id}
                      className={`fade-in ${isDragOver(actualIndex) ? 'ring-2 ring-primary/40 rounded-xl' : ''}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      draggable
                      onDragStart={() => handleDragStart(actualIndex)}
                      onDragOver={(e) => handleDragOver(e, actualIndex)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDrop(actualIndex, reorderStack)}
                      onDragEnd={handleDragEnd}
                    >
                      <StackItem
                        participant={participant}
                        index={actualIndex}
                        isCurrentSpeaker={false}
                        isDirectResponse={false}
                        onRemove={removeFromStack}
                        onIntervention={handleInterventionSubmit}
                        onFinishDirectResponse={finishDirectResponse}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            {/* Recent participants moved to compact header row above */}
          </CardContent>
        </Card>

        {/* Interventions Section */}
        {showInterventionsPanel && stack.length > 0 && (
          <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-zinc-100">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                Intervention Tracking
                <span className="ml-2 text-xs inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold">
                  Record speaking interruptions
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  Click intervention buttons on each participant to log activities.
                </p>
              </div>

              {interventions.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                      Recent Activity ({interventions.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInterventions([])}
                      className="hover:bg-destructive/10 hover:text-destructive rounded-xl h-8 px-3 text-xs"
                    >
                      Clear History
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {interventions.slice(-5).reverse().map((intervention, index) => (
                      <div
                        key={intervention.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 text-sm fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <span className="shrink-0 text-xs px-2 py-0 inline-flex items-center rounded-full border font-semibold">
                          {intervention.type.replace('-', ' ')}
                        </span>
                        <span className="font-medium">{intervention.participant}</span>
                        <span className="text-xs text-gray-500 dark:text-zinc-500 ml-auto">
                          {intervention.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Speaking Distribution (hidden collapsible at bottom) */}
        <div className="mt-8">
          <ExpandableCard
            className="bg-white rounded-2xl p-0 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800"
            trigger={
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-zinc-100">Speaking Distribution</h3>
                    <p className="text-xs text-muted-foreground">Pie chart of who has talked the most</p>
                  </div>
                </div>
                <Button
                  variant={includeDirectResponsesInChart ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl"
                  onClick={(e) => {
                    e.preventDefault();
                    setIncludeDirectResponsesInChart(v => !v);
                  }}
                  title="Toggle including direct responses"
                >
                  {includeDirectResponsesInChart ? "Including Direct Responses" : "Excluding Direct Responses"}
                </Button>
              </div>
            }
            contentClassName="p-0"
          >
            <div className="p-4 sm:p-6">
              {(() => {
                // Aggregate data by participant
                const totals = new Map<string, { name: string; ms: number }>();
                // Include finished segments
                for (const seg of speakingHistory) {
                  if (!includeDirectResponsesInChart && seg.isDirectResponse) continue;
                  const key = seg.participantId;
                  const prev = totals.get(key) || { name: seg.participantName, ms: 0 };
                  prev.ms += seg.durationMs;
                  totals.set(key, prev);
                }
                // Include current speaker ongoing time
                if (speakerTimer && stack[0]) {
                  const isDR = directResponse.isActive && directResponse.participantId === stack[0].id;
                  if (includeDirectResponsesInChart || !isDR) {
                    const key = stack[0].id;
                    const prev = totals.get(key) || { name: stack[0].name, ms: 0 };
                    prev.ms += Math.max(0, Date.now() - speakerTimer.startTime.getTime());
                    totals.set(key, prev);
                  }
                }
                interface ChartDataPoint {
                  name: string;
                  value: number;
                }
                
                const data: ChartDataPoint[] = Array.from(totals.values())
                  .sort((a, b) => b.ms - a.ms)
                  .map((d) => ({ name: d.name, value: Math.round(d.ms / 1000) })); // seconds

                const COLORS = [
                  "#6366F1","#10B981","#F59E0B","#EF4444","#3B82F6","#8B5CF6","#14B8A6","#F97316","#22C55E","#E11D48"
                ];

                return (
                  <div className="w-full">
                    <ChartContainer
                      config={{}}
                      className="w-full h-72"
                    >
                      <PieChart>
                        <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={90} label>
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ChartContainer>
                  </div>
                );
              })()}
            </div>
          </ExpandableCard>
        </div>
    </div>
  );
};
