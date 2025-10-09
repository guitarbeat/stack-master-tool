import React from "react";
import { Hand, MessageCircle, Info, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedEditableParticipantName } from "@/components/features/meeting/EnhancedEditableParticipantName";
import { getQueueTypeDisplay } from "../../utils/queue";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

interface QueueItem {
  id: string;
  participantName: string;
  participantId: string;
  isFacilitator: boolean;
  type: string;
  timestamp: number;
}

interface SpeakingQueueProps {
  speakingQueue: QueueItem[];
  participantName: string;
  onLeaveQueue: () => void;
  onUpdateParticipantName?: (participantId: string, newName: string) => void;
  currentUserId?: string;
  isFacilitator?: boolean;
  onReorderQueue?: (dragIndex: number, targetIndex: number) => void;
}

export const SpeakingQueue = ({
  speakingQueue,
  participantName,
  onLeaveQueue,
  onUpdateParticipantName,
  currentUserId,
  isFacilitator = false,
  onReorderQueue
}: SpeakingQueueProps) => {
  const { dragIndex, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd, isDragOver } = useDragAndDrop({ isFacilitator });
  if (speakingQueue.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Hand className="w-6 h-6" />
            Speaking Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Hand className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Ready for discussion
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              No one is currently in the speaking queue. Participants can raise their hand to join the discussion.
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 inline-block">
              💡 Tip: Use keyboard shortcuts for faster facilitation
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-xl border-0">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Hand className="w-6 h-6" />
          Speaking Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {speakingQueue.map((entry, index) => {
          const { type, participantName: entryName, participantId, isFacilitator: entryIsFacilitator } = entry;
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
              className={`p-4 rounded-lg border-l-4 transition-all ${
                isCurrentSpeaker
                  ? 'bg-primary/5 border-primary shadow-sm'
                  : isDirect
                  ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-400'
                  : isPointInfo
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400'
                  : isClarify
                  ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-400'
                  : 'bg-slate-50 dark:bg-slate-700 border-slate-300'
              } ${isSelf ? 'ring-2 ring-primary/20 bg-primary/5' : ''} ${
                canDrag ? 'draggable-item cursor-grab' : ''
              } ${isDragging ? 'dragging opacity-50 cursor-grabbing' : ''} ${
                isDragOverItem ? 'drag-over border-2 border-dashed border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Position/Speaker indicator */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    isCurrentSpeaker
                      ? 'bg-primary text-white animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}>
                    {isCurrentSpeaker ? '🎤' : index + 1}
                  </div>

                  {/* Name and type indicator */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {onUpdateParticipantName ? (
                      <EnhancedEditableParticipantName
                        participantId={participantId}
                        currentName={entryName}
                        isFacilitator={isFacilitator}
                        onNameUpdate={onUpdateParticipantName}
                        disabled={!isFacilitator && participantId !== currentUserId}
                        className={`font-semibold text-lg truncate ${
                          isCurrentSpeaker
                            ? 'text-primary'
                            : isSelf
                            ? 'text-primary font-bold'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    ) : (
                      <span className={`font-semibold text-lg truncate ${
                        isCurrentSpeaker
                          ? 'text-primary'
                          : isSelf
                          ? 'text-primary font-bold'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {entryName}
                      </span>
                    )}

                    {/* Compact type indicator */}
                    {type !== 'speak' && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isDirect ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                        isPointInfo ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                        isClarify ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
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
};