import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  addedAt: Date;
}

interface DraggableStackItemProps {
  participant: Participant;
  index: number;
  isCurrentSpeaker: boolean;
  onRemove: (id: string) => void;
}

export const DraggableStackItem = ({ 
  participant, 
  index, 
  isCurrentSpeaker, 
  onRemove 
}: DraggableStackItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: participant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`stack-card flex items-center justify-between p-4 rounded-xl border ${
        isCurrentSpeaker 
          ? 'current-speaker border-primary/30' 
          : 'bg-card hover:bg-muted/30 border-border'
      } ${isDragging ? 'drag-overlay' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing hover:text-primary transition-all duration-200 p-1 rounded hover:bg-muted/50"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <Badge 
          variant={isCurrentSpeaker ? "default" : "secondary"}
          className={`${isCurrentSpeaker ? 'animate-pulse' : ''} px-3 py-1`}
        >
          {isCurrentSpeaker ? "🎤 Speaking" : `#${index + 1}`}
        </Badge>
        <span className={`font-medium ${
          isCurrentSpeaker ? 'text-primary' : 'text-foreground'
        }`}>
          {participant.name}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(participant.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};