import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, HelpCircle, AlertTriangle, Plus, X } from "lucide-react";
import { InterventionDialog } from "./InterventionDialog";
import { cn } from "@/lib/utils";

interface InterventionFABProps {
  onIntervention: (type: 'direct-response' | 'clarifying-question' | 'point-of-process', name: string) => void;
}

export const InterventionFAB = ({ onIntervention }: InterventionFABProps) => {
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

  return (
    <div className="intervention-fab">
      {isOpen && (
        <div className="flex flex-col gap-2 mb-2">
          {interventions.map((intervention, index) => (
            <InterventionDialog
              key={intervention.type}
              trigger={
                <Button
                  size="sm"
                  variant="secondary"
                  className={cn(
                    "shadow-lg hover:shadow-xl transition-all duration-200 w-12 h-12 rounded-full",
                    "slide-up opacity-0 animate-in fade-in-0 slide-in-from-bottom-2"
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