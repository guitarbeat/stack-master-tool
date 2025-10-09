import { useState } from "react";
import { Hand, MessageCircle } from "lucide-react";

interface ActionsPanelProps {
  isInQueue: boolean;
  onJoinQueue: (type: string) => void;
  onLeaveQueue: () => void;
  participantName: string;
}

export const ActionsPanel = ({ isInQueue, onJoinQueue, participantName }: ActionsPanelProps) => {
  const [showDirectOptions, setShowDirectOptions] = useState(false);

  return (
    <div className="bg-card text-card-foreground rounded-2xl p-4 sm:p-6 shadow-lg border">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-zinc-100 mb-4 sm:mb-6">Actions</h2>
      
      <div className="space-y-4">
        {/* Main speak button */}
        <button
          onClick={() => onJoinQueue('speak')}
          disabled={isInQueue}
          className={`w-full py-4 sm:py-5 px-4 sm:px-6 rounded-lg font-semibold transition-colors flex items-center justify-center min-h-[48px] text-base sm:text-lg ${
            isInQueue
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
          }`}
        >
          <Hand className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
          {isInQueue ? 'In Queue' : 'Raise Hand to Speak'}
        </button>

        {/* Direct response options */}
        <div className="space-y-2">
          <button
            onClick={() => setShowDirectOptions(!showDirectOptions)}
            disabled={isInQueue}
            className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-medium transition-colors flex items-center justify-center min-h-[44px] text-sm sm:text-base ${
              isInQueue
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:active:bg-zinc-600'
            }`}
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            Direct Response {showDirectOptions ? '▼' : '▶'}
          </button>

          {showDirectOptions && !isInQueue && (
            <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  onJoinQueue('direct-response');
                  setShowDirectOptions(false);
                }}
                className="w-full text-left px-4 py-4 sm:py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:border-zinc-800 min-h-[48px]"
              >
                <div className="font-medium text-gray-900 dark:text-zinc-100 text-sm sm:text-base">Direct Response</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">Respond directly to current speaker</div>
              </button>
              <button
                onClick={() => {
                  onJoinQueue('point-of-info');
                  setShowDirectOptions(false);
                }}
                className="w-full text-left px-4 py-4 sm:py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:border-zinc-800 min-h-[48px]"
              >
                <div className="font-medium text-gray-900 dark:text-zinc-100 text-sm sm:text-base">Point of Information</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">Share relevant information</div>
              </button>
              <button
                onClick={() => {
                  onJoinQueue('clarification');
                  setShowDirectOptions(false);
                }}
                className="w-full text-left px-4 py-4 sm:py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors dark:hover:bg-zinc-800 dark:active:bg-zinc-700 min-h-[48px]"
              >
                <div className="font-medium text-gray-900 dark:text-zinc-100 text-sm sm:text-base">Clarification</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">Ask for clarification</div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Participant info */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-zinc-800">
        <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-300">
          <strong>You:</strong> {participantName}
        </p>
        <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-300 mt-1">
          <strong>Status:</strong> {isInQueue ? 'In speaking queue' : 'Ready to participate'}
        </p>
      </div>
    </div>
  );
};