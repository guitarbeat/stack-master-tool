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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Stack Facilitation
          </h1>
          <p className="text-muted-foreground">
            Democratic discussion management tool for facilitators and stack keepers
          </p>
        </div>

        {/* Add Participant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add to Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Participant name"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToStack()}
                className="flex-1"
              />
              <Button onClick={addToStack} disabled={!newParticipantName.trim()}>
                Add to Stack
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Stack */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Speaking Queue ({stack.length})
            </CardTitle>
            {stack.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={nextSpeaker}>
                  Next Speaker
                </Button>
                <Button variant="destructive" size="sm" onClick={clearStack}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {stack.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No one in stack. Add participants to begin.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={stack} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {stack.map((participant, index) => (
                      <DraggableStackItem
                        key={participant.id}
                        participant={participant}
                        index={index}
                        isCurrentSpeaker={index === 0}
                        onRemove={removeFromStack}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Special Interventions */}
        <Card>
          <CardHeader>
            <CardTitle>Special Interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <InterventionDialog
                trigger={
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-auto p-4 flex-col w-full"
                  >
                    <MessageSquare className="h-5 w-5 text-secondary" />
                    <div className="text-center">
                      <div className="font-medium">Direct Response</div>
                      <div className="text-xs text-muted-foreground">
                        Immediate correction or answer
                      </div>
                    </div>
                  </Button>
                }
                title="Direct Response"
                description="Who is making a direct response? This should only be used for corrections or immediate answers."
                onSubmit={(name) => addIntervention('direct-response', name)}
              />
              
              <InterventionDialog
                trigger={
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-auto p-4 flex-col w-full"
                  >
                    <HelpCircle className="h-5 w-5 text-accent" />
                    <div className="text-center">
                      <div className="font-medium">Clarifying Question</div>
                      <div className="text-xs text-muted-foreground">
                        Question for understanding
                      </div>
                    </div>
                  </Button>
                }
                title="Clarifying Question"
                description="Who has a clarifying question? This should only be used when you need additional information or don't understand something."
                onSubmit={(name) => addIntervention('clarifying-question', name)}
              />
              
              <InterventionDialog
                trigger={
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-auto p-4 flex-col w-full"
                  >
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <div className="text-center">
                      <div className="font-medium">Point of Process</div>
                      <div className="text-xs text-muted-foreground">
                        Procedural concern
                      </div>
                    </div>
                  </Button>
                }
                title="Point of Process"
                description="Who is raising a point of process? This should be used when the discussion is off-topic or not following procedure."
                onSubmit={(name) => addIntervention('point-of-process', name)}
              />
            </div>

            {interventions.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Recent Interventions</h4>
                  <Button variant="ghost" size="sm" onClick={clearInterventions}>
                    Clear
                  </Button>
                </div>
                {interventions.slice(-3).map((intervention) => (
                  <div key={intervention.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">
                      {intervention.type.replace('-', ' ')}
                    </Badge>
                    <span>{intervention.participant}</span>
                    <span className="text-muted-foreground">
                      {intervention.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Speakers Preview */}
        {stack.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Coming Up</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {stack.slice(1, 4).map((participant, index) => (
                  <Badge key={participant.id} variant="secondary">
                    Next {index + 1}: {participant.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};