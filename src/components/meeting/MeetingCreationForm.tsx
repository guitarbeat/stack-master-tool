import React from 'react'
import { Users, Loader2 } from 'lucide-react'

interface MeetingData {
  name: string
  facilitatorName: string
}

interface MeetingCreationFormProps {
  meetingData: MeetingData
  loading: boolean
  error: string
  onChange: (changes: Partial<MeetingData>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

function MeetingCreationForm({ 
  meetingData, 
  loading, 
  error, 
  onChange, 
  onSubmit 
}: MeetingCreationFormProps): JSX.Element {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <div className="text-center mb-8">
        <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
          <Users className="w-8 h-8 text-primary mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
          Create Meeting
        </h1>
        <p className="text-gray-600 dark:text-zinc-400">
          Set up your meeting and share the invitation link
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-900/40">
            <p className="text-red-600 dark:text-red-300 text-sm">
              {error}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
            Meeting Name
          </label>
          <input
            type="text"
            required
            disabled={loading}
            value={meetingData.name}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder:text-muted-foreground"
            placeholder="e.g., Weekly Team Meeting"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
            Your Name (Facilitator)
          </label>
          <input
            type="text"
            required
            disabled={loading}
            value={meetingData.facilitatorName}
            onChange={e => onChange({ facilitatorName: e.target.value })}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder:text-muted-foreground"
            placeholder="Your name"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:bg-primary/60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Meeting...
            </>
          ) : (
            "Create Meeting"
          )}
        </button>
      </form>
    </div>
  )
}

export default MeetingCreationForm