import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, HelpCircle, AlertTriangle, Plus, X } from "lucide-react";
import { InterventionDialog } from "./InterventionDialog";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  addedAt: Date;
}

interface InterventionFABProps {
  participants: Participant[];
  onIntervention: (type: 'direct-response' | 'clarifying-question' | 'point-of-process', name: string) => void;
}

export const InterventionFAB = ({ participants, onIntervention }: InterventionFABProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const interventions = [
    {
      type: 'direct-response' as const,
      icon: MessageSquare,
      label: 'Direct Response',
      description: 'Immediate correction or answer',
      color: 'text-blue-500',
    },
    {
      type: 'clarifying-question' as const,
      icon: HelpCircle,
      label: 'Clarifying Question',
      description: 'Question for understanding',
      color: 'text-amber-500',
    },
    {
      type: 'point-of-process' as const,
      icon: AlertTriangle,
      label: 'Point of Process',
      description: 'Procedural concern',
      color: 'text-red-500',
    },
  ];

  const hasParticipants = participants.length > 0;

  return (
    <div className="intervention-fab">
      {isOpen && (
        <div className="flex flex-col gap-2 mb-2">
          {!hasParticipants && (
            <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mb-2">
              Add participants to the queue first to record interventions
            </div>
          )}
          {interventions.map((intervention, index) => (
            <InterventionDialog
              key={intervention.type}
              trigger={
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!hasParticipants}
                  className={cn(
                    "shadow-lg hover:shadow-xl transition-all duration-200 w-12 h-12 rounded-full",
                    "slide-up opacity-0 animate-in fade-in-0 slide-in-from-bottom-2",
                    !hasParticipants && "opacity-50 cursor-not-allowed"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <intervention.icon className={cn("h-5 w-5", intervention.color)} />
                </Button>
              }
              title={intervention.label}
              description={intervention.description}
              participants={participants}
              onSubmit={(name) => onIntervention(intervention.type, name)}
            />
          ))}
        </div>
      )}
      
      <Button
        size="lg"
        className="shadow-lg hover:shadow-xl transition-all duration-200 w-14 h-14 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform duration-200" />
        ) : (
          <Plus className="h-6 w-6 transition-transform duration-200 hover:rotate-90" />
        )}
      </Button>
    </div>
  );
};