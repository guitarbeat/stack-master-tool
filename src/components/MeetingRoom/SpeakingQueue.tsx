import { memo } from "react";
import { Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { ParticipantAvatar } from "@/components/ui/participant-avatar";
import type { QueueItem } from "@/types/meeting";

interface SpeakingQueueProps {
  speakingQueue: QueueItem[];
  participantName: string;
  onLeaveQueue: () => void;
  currentUserId?: string;
  isFacilitator?: boolean;
  onReorderQueue?: (dragIndex: number, targetIndex: number) => void;
}

export const SpeakingQueue = memo(({
  speakingQueue,
  participantName,
  onLeaveQueue,
  currentUserId: _currentUserId,
  isFacilitator = false,
  onReorderQueue
}: SpeakingQueueProps) => {
  const { dragIndex, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd, isDragOver } = useDragAndDrop({ isFacilitator });
  if (speakingQueue.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Hand className="w-6 h-6" />
            Speaking Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Hand className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready for discussion
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              No one is currently in the speaking queue. Participants can raise their hand to join the discussion.
            </p>
            <div className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 inline-block">
              💡 Tip: Use keyboard shortcuts for faster facilitation
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Hand className="w-6 h-6" />
          Speaking Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {speakingQueue.map((entry, index) => {
          const { type, participantName: entryName, participantId: _participantId } = entry;
          const isSelf = entryName === participantName;
          const isDirect = type === 'direct-response';
          const isPointInfo = type === 'point-of-info';
          const isClarify = type === 'clarification';
          const isCurrentSpeaker = index === 0;
          const canDrag = index !== 0 && (isFacilitator || isSelf);
          const isDragging = dragIndex === index;
          const isDragOverItem = isDragOver(index);
          
          return (
            <div
              key={entry.id}
              draggable={canDrag}
              onDragStart={() => canDrag && handleDragStart(index)}
              onDragOver={(e) => canDrag && handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={() => canDrag && onReorderQueue && handleDrop(index, onReorderQueue)}
              onDragEnd={handleDragEnd}
              className={`p-4 rounded-lg border-l-4 transition-all slide-up-fade card-hover-lift ${
                isCurrentSpeaker
                  ? 'bg-primary/5 border-primary shadow-sm dark:bg-primary/15'
                  : isDirect
                  ? 'bg-warning/10 border-warning dark:bg-warning/20'
                  : isPointInfo
                  ? 'bg-info/10 border-info dark:bg-info/20'
                  : isClarify
                  ? 'bg-accent/10 border-accent dark:bg-accent/20'
                  : 'bg-muted border-border dark:bg-muted/60'
              } ${isSelf ? 'ring-2 ring-primary/20 bg-primary/5' : ''} ${
                canDrag ? 'draggable-item cursor-grab' : ''
              } ${isDragging ? 'dragging opacity-50 cursor-grabbing' : ''} ${
                isDragOverItem ? 'drag-over border-2 border-dashed border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar with position overlay */}
                  <div className="relative">
                    <ParticipantAvatar
                      name={entryName}
                      size="md"
                      isSpeaking={isCurrentSpeaker}
                    />
                    {!isCurrentSpeaker && (
                      <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-card/90 text-muted-foreground text-[10px] font-bold border-2 border-card shadow-sm">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Name and type indicator */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`font-semibold text-lg truncate ${
                      isCurrentSpeaker
                        ? 'text-primary'
                        : isSelf
                        ? 'text-primary font-bold'
                        : 'text-foreground'
                    }`}>
                      {entryName}
                    </span>

                    {/* Compact type indicator */}
                    {type !== 'speak' && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isDirect ? 'bg-warning/20 text-warning-foreground' :
                        isPointInfo ? 'bg-info/20 text-info-foreground' :
                        isClarify ? 'bg-accent/20 text-accent-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {type === 'direct-response' ? 'Direct' :
                         type === 'point-of-info' ? 'Info' :
                         type === 'clarification' ? 'Q&A' : type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isSelf && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onLeaveQueue}
                      className="hover:bg-destructive/20 hover:text-destructive rounded-lg transition-fast px-3 text-sm"
                    >
                      Leave
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});

SpeakingQueue.displayName = "SpeakingQueue";
