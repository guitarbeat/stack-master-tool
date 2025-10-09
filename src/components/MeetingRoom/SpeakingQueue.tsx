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
      <Card className="bg-white dark:bg-slate-800 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Hand className="w-6 h-6" />
            Speaking Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Hand className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No one in queue</p>
            <p className="text-sm">Raise your hand to speak!</p>
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
          const { type, participantName: entryName, participantId, isFacilitator } = entry;
          const isSelf = entryName === participantName;
          const isDirect = type === 'direct-response';
          const isPointInfo = type === 'point-of-info';
          const isClarify = type === 'clarification';
          const isCurrentSpeaker = index === 0;
          
          return (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCurrentSpeaker
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
              } ${isSelf ? 'ring-2 ring-primary/30' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge
                    variant={isCurrentSpeaker ? "default" : "secondary"}
                    className={`${
                      isCurrentSpeaker
                        ? 'animate-pulse'
                        : ''
                    } ${isDirect ? 'bg-orange-500 text-white animate-pulse' : ''}`}
                  >
                    {isCurrentSpeaker
                      ? (isDirect ? "🎤 Direct Response" : "🎤 Speaking")
                      : `#${index + 1}`
                    }
                  </Badge>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isDirect && <MessageCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />}
                    {isPointInfo && <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                    {isClarify && <Settings className="h-4 w-4 text-purple-600 flex-shrink-0" />}
                    {onUpdateParticipantName ? (
                      <EnhancedEditableParticipantName
                        participantId={participantId}
                        currentName={entryName}
                        isFacilitator={isFacilitator}
                        onNameUpdate={onUpdateParticipantName}
                        disabled={!isFacilitator && participantId !== currentUserId}
                        className={`font-semibold text-lg truncate ${isCurrentSpeaker ? 'text-primary' : 'text-slate-900 dark:text-slate-100'}`}
                      />
                    ) : (
                      <span className={`font-semibold text-lg truncate ${isCurrentSpeaker ? 'text-primary' : 'text-slate-900 dark:text-slate-100'}`}>
                        {entryName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      isDirect ? 'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300' :
                      isPointInfo ? 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300' :
                      isClarify ? 'border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300' :
                      'border-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {getQueueTypeDisplay(type)}
                  </Badge>
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