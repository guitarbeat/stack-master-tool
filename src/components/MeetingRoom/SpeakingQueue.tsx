import { Hand, MessageCircle, Info, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueueTypeDisplay, getQueueTypeColor } from "../../utils/queue";

interface QueueItem {
  id: string;
  participantName: string;
  type: string;
  timestamp: number;
}

interface SpeakingQueueProps {
  speakingQueue: QueueItem[];
  participantName: string;
  onLeaveQueue: () => void;
}

export const SpeakingQueue = ({ speakingQueue, participantName, onLeaveQueue }: SpeakingQueueProps) => {
  if (speakingQueue.length === 0) {
    return (
      <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">Speaking Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Hand className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-zinc-400">No one in queue</p>
            <p className="text-sm text-gray-400 dark:text-zinc-500">Raise your hand to speak!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">Speaking Queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {speakingQueue.map((entry, index) => {
          const type = entry.type;
          const isSelf = entry.participantName === participantName;
          const isDirect = type === 'direct-response';
          const isPointInfo = type === 'point-of-info';
          const isClarify = type === 'clarification';
          const isCurrentSpeaker = index === 0;
          
          return (
            <div
              key={entry.id}
              className={`stack-card flex items-center justify-between p-6 rounded-xl border transition-standard ${
                isCurrentSpeaker
                  ? 'current-speaker border-primary/40 text-primary-foreground'
                  : 'glass-card hover:bg-muted/40 border-border/60'
              } ${isSelf ? 'ring-2 ring-primary/30' : ''}`}
            >
              <div className="flex items-center gap-4">
                <Badge
                  variant={isCurrentSpeaker ? "default" : "secondary"}
                  className={`${
                    isCurrentSpeaker
                      ? 'animate-pulse bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                      : 'px-4 py-2 font-semibold'
                  } rounded-full text-sm ${
                    isDirect ? 'bg-primary text-primary-foreground animate-pulse' : ''
                  }`}
                >
                  {isCurrentSpeaker 
                    ? (isDirect ? "🎤 Direct Response" : "🎤 Speaking") 
                    : `#${index + 1}`
                  }
                </Badge>
                <div className="flex items-center gap-2">
                  {isDirect && <MessageCircle className="h-4 w-4 text-primary" />}
                  {isPointInfo && <Info className="h-4 w-4 text-blue-600" />}
                  {isClarify && <Settings className="h-4 w-4 text-purple-600" />}
                  <span className={`font-semibold text-lg ${isCurrentSpeaker ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {entry.participantName}
                  </span>
                </div>
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
              </div>
              <div className="flex items-center gap-1">
                {isSelf && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLeaveQueue}
                    className="hover:bg-destructive/20 hover:text-destructive rounded-lg transition-fast"
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