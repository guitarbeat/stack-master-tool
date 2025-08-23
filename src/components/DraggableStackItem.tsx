import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical } from "lucide-react";
import { Participant } from "@/types";

interface DraggableStackItemProps {
  participant: Participant;
  index: number;
  isCurrentSpeaker: boolean;
  onRemove: (id: string) => void;
}

export const DraggableStackItem = ({ participant, index, isCurrentSpeaker, onRemove }: DraggableStackItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: participant.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`stack-card flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
        isCurrentSpeaker 
          ? 'current-speaker border-primary/40 text-white' 
          : 'glass-card hover:bg-muted/40 border-border/60'
      } ${isDragging ? 'drag-overlay' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing hover:text-primary transition-all duration-300 p-2 rounded-lg hover:bg-muted/60 group"
        >
          <GripVertical className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </div>
        <Badge 
          variant={isCurrentSpeaker ? "default" : "secondary"} 
          className={`${isCurrentSpeaker ? 'animate-pulse bg-white/20 text-white border-white/30' : 'px-4 py-2 font-semibold'} rounded-full text-sm`}
        >
          {isCurrentSpeaker ? "🎤 Speaking" : `#${index + 1}`}
        </Badge>
        <span className={`font-semibold text-lg ${isCurrentSpeaker ? 'text-white' : 'text-foreground'}`}>
          {participant.name}
        </span>
      </div>
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
  );
};