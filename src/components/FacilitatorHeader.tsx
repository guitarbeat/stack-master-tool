import { Crown, Users, LogOut } from 'lucide-react'

interface FacilitatorHeaderProps {
  title: string
  code: string
  participantCount: number
  leaveMeeting: () => void
}

export default function FacilitatorHeader({
  title,
  code,
  participantCount,
  leaveMeeting
}: FacilitatorHeaderProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Crown className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{title}</h1>
            <p className="text-gray-600 dark:text-zinc-400">
              Facilitator View • Code: {code}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600 dark:text-zinc-300">
            <Users className="w-5 h-5 mr-2" />
            <span>{participantCount} participants</span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            title="Copy meeting code"
          >
            Copy Code
          </button>
          <button
            onClick={leaveMeeting}
            className="flex items-center text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            End Meeting
          </button>
        </div>
      </div>
    </div>
  )
}

