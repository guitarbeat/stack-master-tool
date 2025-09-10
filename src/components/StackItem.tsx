import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, MessageCircle, HelpCircle, Settings } from "lucide-react";
import { Participant } from "@/types";

interface StackItemProps {
  participant: Participant;
  index: number;
  isCurrentSpeaker: boolean;
  onRemove: (id: string) => void;
  onIntervention: (participantName: string, type: 'direct-response' | 'clarifying-question' | 'point-of-process') => void;
}

export const StackItem = ({ participant, index, isCurrentSpeaker, onRemove, onIntervention }: StackItemProps) => {
  return (
    <div
      className={`stack-card flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
        isCurrentSpeaker
          ? 'current-speaker border-primary/40 text-white'
          : 'glass-card hover:bg-muted/40 border-border/60'
      }`}
    >
      <div className="flex items-center gap-4">
        <Badge
          variant={isCurrentSpeaker ? "default" : "secondary"}
          className={`${
            isCurrentSpeaker
              ? 'animate-pulse bg-white/20 text-white border-white/30'
              : 'px-4 py-2 font-semibold'
          } rounded-full text-sm`}
        >
          {isCurrentSpeaker ? "🎤 Speaking" : `#${index + 1}`}
        </Badge>
        <span className={`font-semibold text-lg ${isCurrentSpeaker ? 'text-white' : 'text-foreground'}`}>
          {participant.name}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {/* Intervention buttons - only show for non-current speakers */}
        {!isCurrentSpeaker && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onIntervention(participant.name, 'direct-response')}
              className="hover:bg-blue-500/20 hover:text-blue-600 rounded-xl transition-all duration-200 p-2"
              title="Direct Response"
            >
              <MessageCircle className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onIntervention(participant.name, 'clarifying-question')}
              className="hover:bg-yellow-500/20 hover:text-yellow-600 rounded-xl transition-all duration-200 p-2"
              title="Clarifying Question"
            >
              <HelpCircle className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onIntervention(participant.name, 'point-of-process')}
              className="hover:bg-purple-500/20 hover:text-purple-600 rounded-xl transition-all duration-200 p-2"
              title="Point of Process"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(participant.id)}
          className={`hover:bg-destructive/20 hover:text-destructive rounded-xl transition-all duration-200 ${
            isCurrentSpeaker ? 'text-white/80 hover:text-white hover:bg-white/20' : ''
          }`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
