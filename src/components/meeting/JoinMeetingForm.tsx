import React from 'react'
import { LogIn, Loader2 } from 'lucide-react'

interface JoinFormData {
  meetingCode: string
  participantName: string
}

interface JoinMeetingFormProps {
  error: string
  loading: boolean
  joinFormData: JoinFormData
  onChange: (changes: Partial<JoinFormData>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onSwitchToCreate: () => void
}

function JoinMeetingForm({ error, loading, joinFormData, onChange, onSubmit, onSwitchToCreate }: JoinMeetingFormProps): JSX.Element {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <div className="text-center mb-8">
        <div className="bg-sage-green/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
          <LogIn className="w-8 h-8 text-moss-green mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Join Meeting</h1>
        <p className="text-gray-600 dark:text-zinc-400">Enter the meeting code and your name</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-900/40">
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
            Meeting Code
          </label>
          <input
            type="text"
            required
            disabled={loading}
            value={joinFormData.meetingCode}
            onChange={(e) => onChange({ meetingCode: e.target.value.toUpperCase() })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moss-green focus:border-transparent text-center text-2xl font-bold tracking-wider disabled:bg-gray-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
            placeholder="ABC123"
            maxLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            required
            disabled={loading}
            value={joinFormData.participantName}
            onChange={(e) => onChange({ participantName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moss-green focus:border-transparent disabled:bg-gray-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
            placeholder="Enter your name"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-moss-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-moss-green/90 transition-colors disabled:bg-moss-green/40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Joining Meeting...
            </>
          ) : (
            'Join Meeting'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Don't have a meeting code?{' '}
          <button 
            onClick={onSwitchToCreate}
            className="text-moss-green hover:text-moss-green/90 font-medium"
          >
            Host a meeting
          </button>
        </p>
      </div>
    </div>
  )
}

export default JoinMeetingForm

