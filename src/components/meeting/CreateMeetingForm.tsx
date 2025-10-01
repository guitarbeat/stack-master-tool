import React, { useState } from 'react'
import { Users, Loader2 } from 'lucide-react'
import apiService from '../../services/api'
import { toast } from '@/hooks/use-toast'
import { playBeep } from '../../utils/sound.js'
import { AppError, getErrorDisplayInfo } from '../../utils/errorHandling'

interface MeetingData {
  name: string
  facilitatorName: string
}

interface CreateMeetingFormProps {
  onSuccess: (meetingData: any) => void
}

function CreateMeetingForm({ onSuccess }: CreateMeetingFormProps): JSX.Element {
  const [meetingData, setMeetingData] = useState<MeetingData>({
    name: '',
    facilitatorName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const notify = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    toast({ title, description })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiService.createMeeting(
        meetingData.facilitatorName.trim(),
        meetingData.name.trim()
      )

      notify('success', 'Meeting created', `Code: ${response.meetingCode}`)
      playBeep(880, 140)
      onSuccess(response)
    } catch (err) {
      console.error('Error creating meeting:', err)
      const errorInfo = getErrorDisplayInfo(err as AppError)
      setError(errorInfo.description)
      notify('error', errorInfo.title, errorInfo.description)
      playBeep(220, 200)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (changes: Partial<MeetingData>) => {
    setMeetingData(prev => ({ ...prev, ...changes }))
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <div className="text-center mb-8">
        <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
          <Users className="w-8 h-8 text-primary mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Host Meeting</h1>
        <p className="text-gray-600 dark:text-zinc-400">Set up your meeting and share the invitation link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-900/40">
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
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
            onChange={(e) => handleChange({ name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
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
            onChange={(e) => handleChange({ facilitatorName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
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
              Hosting Meeting...
            </>
          ) : (
            'Host Meeting'
          )}
        </button>
      </form>
    </div>
  )
}

export { CreateMeetingForm }
export default CreateMeetingForm