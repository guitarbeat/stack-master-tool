import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Users, LogIn, Loader2 } from 'lucide-react'
import apiService from '../services/api'
import socketService from '../services/socket'
import { useToast } from '../components/ui/ToastProvider.jsx'
import { playBeep } from '../utils/sound.js'

function JoinMeeting() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    meetingCode: searchParams.get('code') || '',
    participantName: ''
  })
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  const handleJoinMeeting = async (e) => {
    e.preventDefault()
    setIsJoining(true)
    setError('')

    try {
      const meetingInfo = await apiService.getMeeting(formData.meetingCode)
      socketService.connect()
      const joinResult = await socketService.joinMeeting(
        formData.meetingCode,
        formData.participantName,
        false
      )

      showToast({ type: 'success', title: 'Joined meeting', description: meetingInfo.title })
      playBeep(1000, 120)

      navigate(`/meeting/${formData.meetingCode}`, {
        state: { 
          participantName: formData.participantName,
          meetingInfo: joinResult.meeting,
          isParticipant: true 
        }
      })
    } catch (err) {
      console.error('Error joining meeting:', err)
      if (err.message === 'Meeting not found') {
        setError('Meeting not found. Please check the code and try again.')
        showToast({ type: 'error', title: 'Meeting not found' })
      } else {
        setError('Failed to join meeting. Please try again.')
        showToast({ type: 'error', title: 'Failed to join meeting' })
      }
      playBeep(220, 200)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-earthy-brown text-sage-green">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-sage-green hover:text-moss-green transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-earthy-brown rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="bg-moss-green/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <LogIn className="w-8 h-8 text-moss-green mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-moss-green mb-2">Join Meeting</h1>
            <p className="text-sage-green">Enter the meeting code and your name</p>
          </div>

          <form onSubmit={handleJoinMeeting} className="space-y-6">
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
                disabled={isJoining}
                value={formData.meetingCode}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  meetingCode: e.target.value.toUpperCase() 
                }))}
                className="w-full px-4 py-3 border border-sage-green rounded-lg focus:ring-2 focus:ring-moss-green focus:border-transparent text-center text-2xl font-bold tracking-wider disabled:bg-earthy-brown/50"
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
                disabled={isJoining}
                value={formData.participantName}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  participantName: e.target.value 
                }))}
                className="w-full px-4 py-3 border border-sage-green rounded-lg focus:ring-2 focus:ring-moss-green focus:border-transparent disabled:bg-earthy-brown/50"
                placeholder="Enter your name"
              />
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full bg-moss-green text-earthy-brown py-3 px-6 rounded-lg font-semibold hover:bg-sage-green transition-colors disabled:bg-moss-green/50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isJoining ? (
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
                onClick={() => navigate('/create')}
                className="text-moss-green hover:text-sage-green font-medium"
              >
                Create a meeting
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinMeeting

