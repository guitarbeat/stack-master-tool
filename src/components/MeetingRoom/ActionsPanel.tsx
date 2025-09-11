import { useState } from "react";
import { Hand, MessageCircle } from "lucide-react";

interface ActionsPanelProps {
  isInQueue: boolean;
  onJoinQueue: (type: string) => void;
  onLeaveQueue: () => void;
  participantName: string;
}

export const ActionsPanel = ({ isInQueue, onJoinQueue, onLeaveQueue, participantName }: ActionsPanelProps) => {
  const [showDirectOptions, setShowDirectOptions] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Actions</h2>
      
      <div className="space-y-4">
        {/* Main speak button */}
        <button
          onClick={() => onJoinQueue('speak')}
          disabled={isInQueue}
          className={`w-full py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
            isInQueue
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <Hand className="w-5 h-5 mr-2" />
          {isInQueue ? 'In Queue' : 'Raise Hand to Speak'}
        </button>

        {/* Direct response options */}
        <div className="relative">
          <button
            onClick={() => setShowDirectOptions(!showDirectOptions)}
            disabled={isInQueue}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isInQueue
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Direct Response
          </button>

          {showDirectOptions && !isInQueue && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 dark:bg-zinc-900 dark:border-zinc-800">
              <button
                onClick={() => onJoinQueue('direct-response')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 dark:hover:bg-zinc-800 dark:border-zinc-800"
              >
                <div className="font-medium text-gray-900 dark:text-zinc-100">Direct Response</div>
                <div className="text-sm text-gray-600 dark:text-zinc-400">Respond directly to current speaker</div>
              </button>
              <button
                onClick={() => onJoinQueue('point-of-info')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 dark:hover:bg-zinc-800 dark:border-zinc-800"
              >
                <div className="font-medium text-gray-900 dark:text-zinc-100">Point of Information</div>
                <div className="text-sm text-gray-600 dark:text-zinc-400">Share relevant information</div>
              </button>
              <button
                onClick={() => onJoinQueue('clarification')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors dark:hover:bg-zinc-800"
              >
                <div className="font-medium text-gray-900 dark:text-zinc-100">Clarification</div>
                <div className="text-sm text-gray-600 dark:text-zinc-400">Ask for clarification</div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Participant info */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800">
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          <strong>You:</strong> {participantName}
        </p>
        <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1">
          <strong>Status:</strong> {isInQueue ? 'In speaking queue' : 'Ready to participate'}
        </p>
      </div>
    </div>
  );
};