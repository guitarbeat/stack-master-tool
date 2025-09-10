import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Users, AlertTriangle, Search, Undo2, Timer, Keyboard, Filter, Clock, Play, Pause, RotateCcw, ArrowRight, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { StackItem } from "./StackItem";
import { NextSpeakerCard } from "./NextSpeakerCard";
import { ExpandableCard } from "./ExpandableCard";
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

interface SpeakerTimer {
  participantId: string;
  startTime: Date;
  isActive: boolean;
}

export const StackKeeper = () => {
  const [stack, setStack] = useState<Participant[]>([]);
  const [interventions, setInterventions] = useState<SpecialIntervention[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [undoHistory, setUndoHistory] = useState<UndoAction[]>([]);
  const [speakerTimer, setSpeakerTimer] = useState<SpeakerTimer | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [directResponse, setDirectResponse] = useState<DirectResponseState>({
    isActive: false,
    participantId: '',
    originalQueue: []
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (speakerTimer?.isActive) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - speakerTimer.startTime.getTime());
      }, 100);
    }
    return () => clearInterval(interval);
  }, [speakerTimer]);

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

  const filteredStack = stack.filter(participant =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
    
    // Start timer if this is the first person
    if (stack.length === 0) {
      startSpeakerTimer(newParticipant.id);
    }
    
    toast({ 
      title: "Added to stack", 
      description: `${newParticipant.name} added to speaking queue`
    });
  };

  const nextSpeaker = () => {
    if (stack.length === 0) return;
    const currentSpeaker = stack[0];
    const remainingStack = stack.slice(1);
    
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
      setSpeakerTimer(null);
      setElapsedTime(0);
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
        setSpeakerTimer(null);
        setElapsedTime(0);
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
      if (!participant) return;
      
      // Store original queue and move participant to front temporarily
      setDirectResponse({
        isActive: true,
        participantId: participant.id,
        originalQueue: [...stack]
      });
      
      // Move participant to front of queue
      const newStack = [participant, ...stack.filter(p => p.id !== participant.id)];
      setStack(newStack);
      
      // Start timer for direct response
      startSpeakerTimer(participant.id);
      
      toast({ 
        title: "Direct Response Active", 
        description: `${participantName} moved to speak for direct response` 
      });
    } else {
      // Handle other intervention types normally
      addIntervention(type, participantName);
    }
  };

  const finishDirectResponse = () => {
    if (!directResponse.isActive) return;
    
    // Restore original queue order (minus the person who just spoke)
    const remainingQueue = directResponse.originalQueue.filter(p => p.id !== directResponse.participantId);
    setStack(remainingQueue);
    
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
      setSpeakerTimer(null);
      setElapsedTime(0);
    }
    
    toast({ 
      title: "Direct Response Complete", 
      description: "Returned to normal speaking queue" 
    });
  };

  const startSpeakerTimer = (participantId: string) => {
    setSpeakerTimer({
      participantId,
      startTime: new Date(),
      isActive: true
    });
    setElapsedTime(0);
  };

  const toggleSpeakerTimer = () => {
    if (!speakerTimer) return;
    setSpeakerTimer(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
  };

  const resetSpeakerTimer = () => {
    if (!speakerTimer) return;
    setSpeakerTimer(prev => prev ? { ...prev, startTime: new Date() } : null);
    setElapsedTime(0);
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
    setSpeakerTimer(null);
    setElapsedTime(0);
    toast({ title: "Stack cleared", description: "All participants removed from queue" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-6 fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full floating-glow mb-6" style={{ background: 'var(--gradient-primary)' }}>
            <Users className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold gradient-text tracking-tight">Stack Facilitation</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">Democratic discussion management tool for facilitators and stack keepers</p>
        </div>

        {/* Add Participant & Controls */}
        <Card className="glass-card slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                Add to Stack
              </CardTitle>
              <div className="flex items-center gap-2">
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
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div className="mt-4 p-4 bg-muted/30 rounded-xl">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
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

        {/* Current Speaker with Timer */}
        {stack.length > 0 && (
          <Card className="glass-card next-speaker-gradient border-primary/30">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-20"></div>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Currently Speaking</span>
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
                  
                  <h3 className="text-2xl lg:text-3xl font-bold gradient-text">{stack[0].name}</h3>
                  
                  {stack.length > 1 && (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-accent/10">
                        <Clock className="h-4 w-4 text-accent" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">Up next:</span>
                      <Badge variant="outline" className="font-semibold px-3 py-1 rounded-full border-accent/30 text-accent">
                        {stack[1].name}
                      </Badge>
                      {stack.length > 2 && (
                        <span className="text-sm text-muted-foreground/70 font-medium">+{stack.length - 2} more</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    size="lg" 
                    onClick={nextSpeaker} 
                    className="floating-glow px-6 py-3 text-base font-semibold rounded-xl group whitespace-nowrap"
                  >
                    Next Speaker
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Stack */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <CardTitle className="flex items-center gap-4 text-2xl font-semibold">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              Speaking Queue
              <Badge variant="secondary" className="ml-3 px-4 py-2 text-sm font-medium rounded-full">
                {filteredStack.length} {filteredStack.length === 1 ? 'person' : 'people'}
                {searchQuery && ` (${stack.length} total)`}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3">
              {stack.length > 1 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      <X className="h-4 w-4 text-muted-foreground" />
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
          <CardContent className="pt-0">
            {stack.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No one in stack</p>
                <p className="text-sm text-muted-foreground/70">Add participants above to begin the discussion</p>
              </div>
            ) : filteredStack.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No participants match your search</p>
                <p className="text-sm text-muted-foreground/70">Try adjusting your search term</p>
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
                  return (
                    <div key={participant.id} className="fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <StackItem
                        participant={participant}
                        index={actualIndex}
                        isCurrentSpeaker={actualIndex === 0}
                        isDirectResponse={directResponse.isActive && participant.id === directResponse.participantId && actualIndex === 0}
                        onRemove={removeFromStack}
                        onIntervention={handleInterventionSubmit}
                        onFinishDirectResponse={finishDirectResponse}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interventions Section */}
        {stack.length > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                Intervention Tracking
                <Badge variant="outline" className="ml-2 text-xs">
                  Record speaking interruptions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Click intervention buttons on each participant to log activities.
                </p>
              </div>

              {interventions.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
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
                        <Badge variant="outline" className="shrink-0 text-xs px-2 py-0">
                          {intervention.type.replace('-', ' ')}
                        </Badge>
                        <span className="font-medium">{intervention.participant}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
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
      </div>
    </div>
  );
};
