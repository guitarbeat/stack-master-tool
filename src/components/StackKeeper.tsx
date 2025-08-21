import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Users, MessageSquare, HelpCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DraggableStackItem } from "./DraggableStackItem";
import { InterventionDialog } from "./InterventionDialog";
import { InterventionFAB } from "./InterventionFAB";
import { NextSpeakerCard } from "./NextSpeakerCard";

interface Participant {
  id: string;
  name: string;
  addedAt: Date;
}

interface SpecialIntervention {
  id: string;
  type: 'direct-response' | 'clarifying-question' | 'point-of-process';
  participant: string;
  timestamp: Date;
}

export const StackKeeper = () => {
  const [stack, setStack] = useState<Participant[]>([]);
  const [interventions, setInterventions] = useState<SpecialIntervention[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addToStack = () => {
    if (!newParticipantName.trim()) return;
    
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newParticipantName.trim(),
      addedAt: new Date()
    };
    
    setStack(prev => [...prev, newParticipant]);
    setNewParticipantName("");
    toast({
      title: "Added to stack",
      description: `${newParticipant.name} added to speaking queue`,
    });
  };

  const nextSpeaker = () => {
    if (stack.length === 0) return;
    
    const currentSpeaker = stack[0];
    setStack(prev => prev.slice(1));
    toast({
      title: "Next speaker",
      description: `${currentSpeaker.name} finished speaking`,
    });
  };

  const removeFromStack = (id: string) => {
    const participant = stack.find(p => p.id === id);
    setStack(prev => prev.filter(p => p.id !== id));
    if (participant) {
      toast({
        title: "Removed from stack",
        description: `${participant.name} removed from queue`,
      });
    }
  };

  const addIntervention = (type: SpecialIntervention['type'], participantName: string) => {
    const intervention: SpecialIntervention = {
      id: Date.now().toString(),
      type,
      participant: participantName,
      timestamp: new Date()
    };

    setInterventions(prev => [...prev, intervention]);
    
    const typeLabels = {
      'direct-response': 'Direct Response',
      'clarifying-question': 'Clarifying Question', 
      'point-of-process': 'Point of Process'
    };

    toast({
      title: typeLabels[type],
      description: `${participantName} - ${typeLabels[type]} recorded`,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStack((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const clearInterventions = () => {
    setInterventions([]);
  };

  const clearStack = () => {
    setStack([]);
    setInterventions([]);
    toast({
      title: "Stack cleared",
      description: "All participants removed from queue",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Stack Facilitation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Democratic discussion management tool for facilitators and stack keepers
          </p>
        </div>

        {/* Add Participant */}
        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-primary" />
              Add to Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter participant name..."
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToStack()}
                className="flex-1 h-11 text-base border-border/50 focus:border-primary transition-colors"
              />
              <Button 
                onClick={addToStack} 
                disabled={!newParticipantName.trim()}
                size="lg"
                className="px-6 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Add to Stack
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Speaker Highlight */}
        {stack.length > 0 && (
          <NextSpeakerCard
            currentSpeaker={stack[0]}
            nextSpeakers={stack.slice(1, 3)}
            onNextSpeaker={nextSpeaker}
          />
        )}

        {/* Current Stack */}
        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Users className="h-6 w-6 text-primary" />
              Speaking Queue
              <Badge variant="secondary" className="ml-2 px-3 py-1">
                {stack.length} {stack.length === 1 ? 'person' : 'people'}
              </Badge>
            </CardTitle>
            {stack.length > 0 && (
              <Button variant="destructive" size="sm" onClick={clearStack} className="shadow-md">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {stack.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No one in stack</p>
                <p className="text-sm text-muted-foreground/70">Add participants above to begin the discussion</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={stack} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {stack.map((participant, index) => (
                      <div key={participant.id} className="fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <DraggableStackItem
                          participant={participant}
                          index={index}
                          isCurrentSpeaker={index === 0}
                          onRemove={removeFromStack}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Recent Interventions */}
        {interventions.length > 0 && (
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Recent Interventions
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={clearInterventions} className="hover:bg-destructive/10 hover:text-destructive">
                  Clear History
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {interventions.slice(-5).reverse().map((intervention, index) => (
                  <div key={intervention.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <Badge variant="outline" className="shrink-0">
                      {intervention.type.replace('-', ' ')}
                    </Badge>
                    <span className="font-medium">{intervention.participant}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {intervention.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Floating Action Button for Interventions */}
        <InterventionFAB onIntervention={addIntervention} />
      </div>
    </div>
  );
};