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
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl border-0 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{meetingData.title}</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            Facilitated by {meetingData.facilitator} • Code: {meetingData.code}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span>{participantCount} participants</span>
          </div>
          {additionalBadge}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={copyMeetingCode}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:active:bg-slate-500 min-h-[44px] transition-colors"
              title="Copy meeting code"
              aria-label="Copy meeting code to clipboard"
            >
              Copy Code
            </button>
            <button
              onClick={onLeaveMeeting}
              className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-900/20 dark:active:bg-red-900/30 transition-colors min-h-[44px]"
              aria-label="Leave meeting and return to home"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};