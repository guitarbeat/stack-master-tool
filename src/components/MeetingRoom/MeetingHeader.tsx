import { Users, LogOut } from "lucide-react";

interface MeetingHeaderProps {
  meetingData: {
    code: string;
    title: string;
    facilitator: string;
  };
  participantCount: number;
  onLeaveMeeting: () => void;
  additionalBadge?: React.ReactElement;
}

export const MeetingHeader = ({ meetingData, participantCount, onLeaveMeeting, additionalBadge }: MeetingHeaderProps) => {
  const copyMeetingCode = () => {
    navigator.clipboard.writeText(meetingData.code);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{meetingData.title}</h1>
          <p className="text-gray-600 dark:text-zinc-400">
            Facilitated by {meetingData.facilitator} • Code: {meetingData.code}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600 dark:text-zinc-300">
            <Users className="w-5 h-5 mr-2" />
            <span>{participantCount} participants</span>
          </div>
          {additionalBadge}
          <button
            onClick={copyMeetingCode}
            className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            title="Copy meeting code"
          >
            Copy Code
          </button>
          <button
            onClick={onLeaveMeeting}
            className="flex items-center text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};