import { Users, Crown, UserPlus } from 'lucide-react'
import { EnhancedEditableParticipantName } from './EnhancedEditableParticipantName'
import { QuickAddParticipant } from './QuickAddParticipant'

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
  onParticipantNameUpdate?: (participantId: string, newName: string) => void
  onAddParticipant?: (name: string) => void
  isHost?: boolean
  showQuickAdd?: boolean
}

export default function ParticipantList({
  participants,
  meetingData,
  onParticipantNameUpdate,
  onAddParticipant,
  isHost = false,
  showQuickAdd = false
}: ParticipantListProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Participants</h2>
        {showQuickAdd && onAddParticipant && (
          <QuickAddParticipant
            onAddParticipant={onAddParticipant}
            placeholder="Add participants..."
            className="ml-4"
          />
        )}
      </div>

      {participants.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-zinc-400 mb-2">No participants yet</p>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mb-4">
            {showQuickAdd ? 'Use the Quick Add button above or share the meeting code' : 'Share the meeting code to invite people'}
          </p>
          {showQuickAdd && onAddParticipant && (
            <div className="flex justify-center">
              <QuickAddParticipant
                onAddParticipant={onAddParticipant}
                placeholder="Type names separated by commas..."
                className="max-w-sm"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center flex-1 min-w-0">
                {participant.isFacilitator && <Crown className="w-4 h-4 text-yellow-600 mr-2 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <EnhancedEditableParticipantName
                    participantId={participant.id}
                    currentName={participant.name}
                    isFacilitator={isHost}
                    onNameUpdate={onParticipantNameUpdate || (() => {})}
                    disabled={!onParticipantNameUpdate}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                    {participant.isFacilitator ? 'Facilitator' : 'Participant'}
                  </p>
                </div>
              </div>
              {participant.isInQueue && (
                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full dark:bg-purple-900/20 dark:text-purple-300 shrink-0">
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

