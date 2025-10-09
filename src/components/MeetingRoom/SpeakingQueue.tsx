import { Hand, MessageCircle, Info, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedEditableParticipantName } from "@/components/features/meeting/EnhancedEditableParticipantName";
import { getQueueTypeDisplay } from "../../utils/queue";

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
}

export const SpeakingQueue = ({
  speakingQueue,
  participantName,
  onLeaveQueue,
  onUpdateParticipantName,
  currentUserId
}: SpeakingQueueProps) => {
  if (speakingQueue.length === 0) {
    return (
      <Card className="bg-card text-card-foreground rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-primary/20">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-card-foreground flex items-center gap-3">
            <Hand className="w-6 h-6 text-primary" />
            Speaking Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <Hand className="w-16 h-16 sm:w-20 sm:h-20 text-primary/60 mx-auto mb-4 sm:mb-6" />
            <p className="text-muted-foreground text-lg sm:text-xl font-medium mb-2">No one in queue</p>
            <p className="text-sm sm:text-base text-muted-foreground">Raise your hand to speak!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl dark:bg-zinc-900 dark:border dark:border-zinc-800 border-2 border-primary/20">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-card-foreground flex items-center gap-3">
          <Hand className="w-6 h-6 text-primary" />
          Speaking Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {speakingQueue.map((entry, index) => {
          const { type, participantName: entryName, participantId, isFacilitator } = entry;
          const isSelf = entryName === participantName;
          const isDirect = type === 'direct-response';
          const isPointInfo = type === 'point-of-info';
          const isClarify = type === 'clarification';
          const isCurrentSpeaker = index === 0;
          
          return (
            <div
              key={entry.id}
              className={`stack-card flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-xl border transition-standard gap-3 sm:gap-0 ${
                isCurrentSpeaker
                  ? 'current-speaker border-primary/40 text-primary-foreground'
                  : 'glass-card hover:bg-muted/40 border-border/60'
              } ${isSelf ? 'ring-2 ring-primary/30' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Badge
                    variant={isCurrentSpeaker ? "default" : "secondary"}
                    className={`${
                      isCurrentSpeaker
                        ? 'animate-pulse bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                        : 'px-3 sm:px-4 py-1.5 sm:py-2 font-semibold'
                    } rounded-full text-sm ${
                      isDirect ? 'bg-primary text-primary-foreground animate-pulse' : ''
                    }`}
                  >
                    {isCurrentSpeaker
                      ? (isDirect ? "🎤 Direct Response" : "🎤 Speaking")
                      : `#${index + 1}`
                    }
                  </Badge>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isDirect && <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />}
                    {isPointInfo && <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                    {isClarify && <Settings className="h-4 w-4 text-purple-600 flex-shrink-0" />}
                    {onUpdateParticipantName ? (
                      <EnhancedEditableParticipantName
                        participantId={participantId}
                        currentName={entryName}
                        isFacilitator={isFacilitator}
                        onNameUpdate={onUpdateParticipantName}
                        disabled={!isFacilitator && participantId !== currentUserId}
                        className={`font-semibold text-base sm:text-lg truncate ${isCurrentSpeaker ? 'text-primary-foreground' : 'text-foreground'}`}
                      />
                    ) : (
                      <span className={`font-semibold text-base sm:text-lg truncate ${isCurrentSpeaker ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {entryName}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs self-start sm:self-auto ${
                    isDirect ? 'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300' :
                    isPointInfo ? 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300' :
                    isClarify ? 'border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300' :
                    'border-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {getQueueTypeDisplay(type)}
                </Badge>
              </div>
              <div className="flex items-center gap-1 self-end sm:self-center">
                {isSelf && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLeaveQueue}
                    className="hover:bg-destructive/20 hover:text-destructive rounded-lg transition-fast min-h-[44px] px-3 sm:px-4 text-sm sm:text-base"
                  >
                    Leave Queue
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};