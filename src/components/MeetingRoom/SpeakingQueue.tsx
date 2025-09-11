import { Hand, MessageCircle, Info, Settings } from "lucide-react";
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
      <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Speaking Queue</h2>
        <div className="text-center py-8">
          <Hand className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-zinc-400">No one in queue</p>
          <p className="text-sm text-gray-400 dark:text-zinc-500">Raise your hand to speak!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Speaking Queue</h2>
      <div className="space-y-3">
        {speakingQueue.map((entry, index) => {
          const type = entry.type;
          const isSelf = entry.participantName === participantName;
          const isDirect = type === 'direct-response';
          const isPointInfo = type === 'point-of-info';
          const isClarify = type === 'clarification';
          const containerColor = isDirect
            ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/30'
            : isPointInfo
            ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/30'
            : isClarify
            ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-900/30'
            : 'border-gray-200 bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800';
          const leftAccent = isDirect
            ? 'bg-orange-400'
            : isPointInfo
            ? 'bg-blue-400'
            : isClarify
            ? 'bg-purple-400'
            : 'bg-gray-300';
          const iconClass = isDirect
            ? 'text-orange-600'
            : isPointInfo
            ? 'text-blue-600'
            : isClarify
            ? 'text-purple-600'
            : 'text-gray-600';
          
          return (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border-2 relative overflow-hidden ${containerColor} ${
                isSelf ? 'ring-2 ring-purple-300/60 dark:ring-purple-800/50' : ''
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${leftAccent}`} />
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full mr-3 dark:bg-purple-900/20 dark:text-purple-300">
                    #{index + 1}
                  </div>
                  <div className="flex items-center">
                    {isDirect && <MessageCircle className={`w-4 h-4 mr-2 ${iconClass}`} />}
                    {isPointInfo && <Info className={`w-4 h-4 mr-2 ${iconClass}`} />}
                    {isClarify && <Settings className={`w-4 h-4 mr-2 ${iconClass}`} />}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-zinc-100">{entry.participantName}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getQueueTypeColor(type)}`}>
                        {getQueueTypeDisplay(type)}
                      </span>
                    </div>
                  </div>
                </div>
                {isSelf && (
                  <button
                    onClick={onLeaveQueue}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Leave Queue
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};