import { Users, Crown } from 'lucide-react'

interface Participant {
  id: string
  name: string
  isFacilitator?: boolean
  isInQueue?: boolean
}

interface MeetingData {
  code: string
  facilitator: string
}

interface ParticipantListProps {
  participants: Participant[]
  meetingData: MeetingData
}

export default function ParticipantList({
  participants,
  meetingData
}: ParticipantListProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Participants</h2>

      {participants.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-zinc-400">No participants yet</p>
          <p className="text-sm text-gray-400 dark:text-zinc-500">Share the meeting code to invite people</p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-950"
            >
              <div className="flex items-center">
                {participant.isFacilitator && <Crown className="w-4 h-4 text-yellow-600 mr-2" />}
                <div>
                  <p className="font-medium text-gray-900 dark:text-zinc-100">{participant.name}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {participant.isFacilitator ? 'Facilitator' : 'Participant'}
                  </p>
                </div>
              </div>
              {participant.isInQueue && (
                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full dark:bg-purple-900/20 dark:text-purple-300">
                  In Queue
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800">
        <div className="space-y-2 text-sm text-gray-600 dark:text-zinc-400">
          <p><strong>Meeting Code:</strong> {meetingData.code}</p>
          <p><strong>Facilitator:</strong> {meetingData.facilitator}</p>
          <p><strong>Status:</strong> Active</p>
        </div>
      </div>
    </div>
  )
}

