import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, HelpCircle, AlertTriangle, Plus, X } from "lucide-react";
import { InterventionDialog } from "./InterventionDialog";
import { cn } from "@/lib/utils";
import { Participant } from "@/types";

interface InterventionFABProps {
  participants: Participant[];
  onIntervention: (type: 'direct-response' | 'clarifying-question' | 'point-of-process', name: string) => void;
}

const interventions = [
  { type: 'direct-response' as const, icon: MessageSquare, label: 'Direct Response', description: 'Immediate correction or answer', color: 'text-blue-500' },
  { type: 'clarifying-question' as const, icon: HelpCircle, label: 'Clarifying Question', description: 'Question for understanding', color: 'text-amber-500' },
  { type: 'point-of-process' as const, icon: AlertTriangle, label: 'Point of Process', description: 'Procedural concern', color: 'text-red-500' }
];

export const InterventionFAB = ({ participants, onIntervention }: InterventionFABProps) => {
  const hasParticipants = participants.length > 0;

  return (
    <>
      {interventions.map((intervention, index) => (
        <InterventionDialog
          key={intervention.type}
          trigger={
            <Button
              variant="outline"
              disabled={!hasParticipants}
              className={cn(
                "h-12 px-4 flex items-center gap-3 justify-start hover-scale transition-all duration-200",
                !hasParticipants && "opacity-50 cursor-not-allowed"
              )}
            >
              <intervention.icon className={cn("h-4 w-4", intervention.color)} />
              <div className="text-left">
                <div className="font-medium text-sm">{intervention.label}</div>
                <div className="text-xs text-muted-foreground">{intervention.description}</div>
              </div>
            </Button>
          }
          title={intervention.label}
          description={intervention.description}
          participants={participants}
          onSubmit={(name) => onIntervention(intervention.type, name)}
        />
      ))}
    </>
  );
};
