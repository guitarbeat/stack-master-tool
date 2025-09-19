import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, LogIn, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import apiService from '../services/api'
import socketService from '../services/socket'
import { toast } from '@/hooks/use-toast'
import { playBeep } from '../utils/sound.js'

interface FormData {
  meetingCode: string
  participantName: string
}

interface ValidationState {
  meetingCode: 'idle' | 'validating' | 'valid' | 'invalid'
  participantName: 'idle' | 'valid' | 'invalid'
}

function JoinMeeting(): JSX.Element {
  const navigate = useNavigate()
  const notify = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    toast({ title, description })
  }
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState<FormData>({
    meetingCode: searchParams.get('code') || '',
    participantName: ''
  })
  const [isJoining, setIsJoining] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [validation, setValidation] = useState<ValidationState>({
    meetingCode: 'idle',
    participantName: 'idle'
  })
  const [meetingInfo, setMeetingInfo] = useState<{ title: string; code: string; facilitator: string } | null>(null)

  // Real-time validation for meeting code
  useEffect(() => {
    const validateMeetingCode = async () => {
      if (formData.meetingCode.length === 6) {
        setValidation(prev => ({ ...prev, meetingCode: 'validating' }))
        try {
          const meeting = await apiService.getMeeting(formData.meetingCode)
          setMeetingInfo(meeting)
          setValidation(prev => ({ ...prev, meetingCode: 'valid' }))
          setError('')
        } catch (err) {
          setValidation(prev => ({ ...prev, meetingCode: 'invalid' }))
          setError('Meeting not found. Please check the code and try again.')
        }
      } else if (formData.meetingCode.length > 0) {
        setValidation(prev => ({ ...prev, meetingCode: 'idle' }))
        setError('')
      } else {
        setValidation(prev => ({ ...prev, meetingCode: 'idle' }))
        setError('')
      }
    }

    const timeoutId = setTimeout(validateMeetingCode, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.meetingCode])

  // Real-time validation for participant name
  useEffect(() => {
    if (formData.participantName.length > 0) {
      setValidation(prev => ({ ...prev, participantName: 'valid' }))
    } else {
      setValidation(prev => ({ ...prev, participantName: 'idle' }))
    }
  }, [formData.participantName])

  const handleJoinMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
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

      notify('success', 'Joined meeting', meetingInfo.title)
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
      if (err instanceof Error && err.message === 'Meeting not found') {
        setError('Meeting not found. Please check the code and try again.')
        notify('error', 'Meeting not found')
      } else {
        setError('Failed to join meeting. Please try again.')
        notify('error', 'Failed to join meeting')
      }
      playBeep(220, 200)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Go back to home page"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <div className="text-center mb-8">
            <div className="bg-sage-green/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <LogIn className="w-8 h-8 text-moss-green mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Join Meeting</h1>
            <p className="text-gray-600 dark:text-zinc-400">Enter the meeting code and your name</p>
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
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isJoining}
                  value={formData.meetingCode}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    meetingCode: e.target.value.toUpperCase() 
                  }))}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-moss-green focus:border-transparent text-center text-2xl font-bold tracking-wider disabled:bg-gray-100 dark:bg-zinc-950 dark:text-zinc-100 form-input ${
                    validation.meetingCode === 'valid' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : validation.meetingCode === 'invalid' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-zinc-800'
                  }`}
                  placeholder="ABC123"
                  maxLength={6}
                  aria-describedby="meeting-code-status"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validation.meetingCode === 'validating' && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                  {validation.meetingCode === 'valid' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {validation.meetingCode === 'invalid' && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              {validation.meetingCode === 'valid' && meetingInfo && (
                <p id="meeting-code-status" className="mt-2 text-sm text-green-600 dark:text-green-400 break-words">
                  ✓ Meeting found: {meetingInfo.title}
                </p>
              )}
              {validation.meetingCode === 'invalid' && (
                <p id="meeting-code-status" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  ✗ Meeting not found
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isJoining}
                  value={formData.participantName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    participantName: e.target.value 
                  }))}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-moss-green focus:border-transparent disabled:bg-gray-100 dark:bg-zinc-950 dark:text-zinc-100 form-input ${
                    validation.participantName === 'valid' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-300 dark:border-zinc-800'
                  }`}
                  placeholder="Enter your name"
                  aria-describedby="participant-name-status"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validation.participantName === 'valid' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              {validation.participantName === 'valid' && (
                <p id="participant-name-status" className="mt-2 text-sm text-green-600 dark:text-green-400">
                  ✓ Name entered
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isJoining || validation.meetingCode !== 'valid' || validation.participantName !== 'valid'}
              className="w-full bg-moss-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-moss-green/90 transition-colors disabled:bg-moss-green/40 disabled:cursor-not-allowed flex items-center justify-center touch-target"
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
            
            {/* Validation status message */}
            {!isJoining && (validation.meetingCode !== 'valid' || validation.participantName !== 'valid') && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-900/40">
                <div className="flex items-start sm:items-center">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                  <p className="text-sm text-amber-600 dark:text-amber-400 break-words">
                    {validation.meetingCode !== 'valid' && validation.participantName !== 'valid' 
                      ? 'Please enter a valid meeting code and your name to continue'
                      : validation.meetingCode !== 'valid' 
                      ? 'Please enter a valid meeting code to continue'
                      : 'Please enter your name to continue'
                    }
                  </p>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Don't have a meeting code?{' '}
              <button 
                onClick={() => navigate('/create')}
                className="text-moss-green hover:text-moss-green/90 font-medium"
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

