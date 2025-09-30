import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, MessageCircle, HelpCircle, CheckCircle } from "lucide-react";
import { Participant } from "@/types";

interface StackItemProps {
  participant: Participant;
  index: number;
  isCurrentSpeaker: boolean;
  isDirectResponse: boolean;
  onRemove: (id: string) => void;
  onIntervention: (
    participantName: string,
    type: "direct-response" | "clarifying-question"
  ) => void;
  onFinishDirectResponse?: () => void;
}

export const StackItem = ({
  participant,
  index,
  isCurrentSpeaker,
  isDirectResponse,
  onRemove,
  onIntervention,
  onFinishDirectResponse,
}: StackItemProps) => {
  return (
    <div
      className={`stack-card flex items-center justify-between p-6 rounded-xl border transition-standard ${
        isCurrentSpeaker
          ? "current-speaker border-primary/40 text-primary-foreground"
          : "glass-card hover:bg-muted/40 border-border/60"
      }${isDirectResponse ? " direct-response" : ""}`}
    >
      <div className="flex items-center gap-4">
        <Badge
          variant={isCurrentSpeaker ? "default" : "secondary"}
          className={`${
            isCurrentSpeaker
              ? "animate-pulse bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
              : "px-4 py-2 font-semibold"
          } rounded-full text-sm ${
            isDirectResponse
              ? "bg-primary text-primary-foreground animate-pulse"
              : ""
          }`}
        >
          {isCurrentSpeaker
            ? isDirectResponse
              ? "🎤 Direct Response"
              : "🎤 Speaking"
            : `#${index + 1}`}
        </Badge>
        <span
          className={`font-semibold text-lg ${isCurrentSpeaker ? "text-primary-foreground" : "text-foreground"}`}
        >
          {participant.name}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {/* Show finish direct response button when current speaker is in direct response mode */}
        {isCurrentSpeaker && isDirectResponse && onFinishDirectResponse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFinishDirectResponse}
            className="hover:bg-accent/20 hover:text-accent rounded-lg transition-fast p-2 mr-2"
            title="Finish Direct Response"
            aria-label="Finish"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        {/* Intervention buttons - only show for non-current speakers */}
        {!isCurrentSpeaker && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onIntervention(participant.name, "direct-response")
              }
              className="hover:bg-primary/20 hover:text-primary rounded-lg transition-fast p-2"
              title="Direct Response"
              aria-label="Intervention"
            >
              <MessageCircle className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onIntervention(participant.name, "clarifying-question")
              }
              className="hover:bg-warning/20 hover:text-warning rounded-lg transition-fast p-2"
              title="Clarifying Question"
            >
              <HelpCircle className="h-3 w-3" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(participant.id)}
          className={`hover:bg-destructive/20 hover:text-destructive rounded-lg transition-fast ${
            isCurrentSpeaker
              ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
              : ""
          }`}
          aria-label="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
