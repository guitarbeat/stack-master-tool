import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Users, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DraggableStackItem } from "./DraggableStackItem";
import { InterventionFAB } from "./InterventionFAB";
import { NextSpeakerCard } from "./NextSpeakerCard";
import { Participant, SpecialIntervention, INTERVENTION_TYPES } from "@/types";

export const StackKeeper = () => {
  const [stack, setStack] = useState<Participant[]>([]);
  const [interventions, setInterventions] = useState<SpecialIntervention[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addToStack = () => {
    if (!newParticipantName.trim()) return;
    const newParticipant: Participant = { id: Date.now().toString(), name: newParticipantName.trim(), addedAt: new Date() };
    setStack(prev => [...prev, newParticipant]);
    setNewParticipantName("");
    toast({ title: "Added to stack", description: `${newParticipant.name} added to speaking queue` });
  };

  const nextSpeaker = () => {
    if (stack.length === 0) return;
    const currentSpeaker = stack[0];
    setStack(prev => prev.slice(1));
    toast({ title: "Next speaker", description: `${currentSpeaker.name} finished speaking` });
  };

  const removeFromStack = (id: string) => {
    const participant = stack.find(p => p.id === id);
    setStack(prev => prev.filter(p => p.id !== id));
    if (participant) toast({ title: "Removed from stack", description: `${participant.name} removed from queue` });
  };

  const addIntervention = (type: SpecialIntervention['type'], participantName: string) => {
    const intervention: SpecialIntervention = { id: Date.now().toString(), type, participant: participantName, timestamp: new Date() };
    setInterventions(prev => [...prev, intervention]);
    toast({ title: INTERVENTION_TYPES[type], description: `${participantName} - ${INTERVENTION_TYPES[type]} recorded` });
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

  const clearAll = () => {
    setStack([]);
    setInterventions([]);
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

        {/* Add Participant */}
        <Card className="glass-card slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              Add to Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter participant name..."
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToStack()}
                className="flex-1 h-12 text-base border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl"
              />
              <Button onClick={addToStack} disabled={!newParticipantName.trim()} size="lg" className="px-8 h-12 floating-glow rounded-xl font-medium">
                Add to Stack
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Speaker Highlight */}
        {stack.length > 0 && <NextSpeakerCard currentSpeaker={stack[0]} nextSpeakers={stack.slice(1, 3)} onNextSpeaker={nextSpeaker} />}

        {/* Current Stack */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <CardTitle className="flex items-center gap-4 text-2xl font-semibold">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              Speaking Queue
              <Badge variant="secondary" className="ml-3 px-4 py-2 text-sm font-medium rounded-full">{stack.length} {stack.length === 1 ? 'person' : 'people'}</Badge>
            </CardTitle>
            {stack.length > 0 && (
              <Button variant="destructive" size="sm" onClick={clearAll} className="floating-glow rounded-xl">
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
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={stack} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {stack.map((participant, index) => (
                      <div key={participant.id} className="fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <DraggableStackItem participant={participant} index={index} isCurrentSpeaker={index === 0} onRemove={removeFromStack} />
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
          <Card className="glass-card">
            <CardHeader className="pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                  Recent Interventions
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setInterventions([])} className="hover:bg-destructive/10 hover:text-destructive rounded-xl">
                  Clear History
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {interventions.slice(-5).reverse().map((intervention, index) => (
                  <div key={intervention.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <Badge variant="outline" className="shrink-0">{intervention.type.replace('-', ' ')}</Badge>
                    <span className="font-medium">{intervention.participant}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{intervention.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Floating Action Button for Interventions */}
        <InterventionFAB participants={stack} onIntervention={addIntervention} />
      </div>
    </div>
  );
};