import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Users, LogIn, Copy, QrCode as QrCodeIcon, Loader2, Plus, UserPlus } from 'lucide-react'
import QRCode from 'qrcode'
import apiService from '../services/api'
import socketService from '../services/socket'
import { toast } from '@/hooks/use-toast'
import { playBeep } from '../utils/sound.js'
import Confetti from '../components/ui/Confetti.jsx'

interface MeetingData {
  name: string
  facilitatorName: string
  meetingCode: string
  meetingId: string
  shareableLink: string
}

interface JoinFormData {
  meetingCode: string
  participantName: string
}

function CreateOrJoinMeeting(): JSX.Element {
  const navigate = useNavigate()
  const notify = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    toast({ title, description })
  }
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [step, setStep] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [meetingData, setMeetingData] = useState<MeetingData>({
    name: '',
    facilitatorName: '',
    meetingCode: '',
    meetingId: '',
    shareableLink: ''
  })
  const [joinFormData, setJoinFormData] = useState<JoinFormData>({
    meetingCode: searchParams.get('code') || '',
    participantName: ''
  })
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [confettiKey, setConfettiKey] = useState<number>(0)

  const handleCreateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await apiService.createMeeting(
        meetingData.facilitatorName,
        meetingData.name
      )
      
      const shareableLink = `${window.location.origin}/join?code=${response.meetingCode}`

      // Update UI first; generate QR asynchronously to keep flow snappy
      setMeetingData(prev => ({
        ...prev,
        meetingCode: response.meetingCode,
        meetingId: response.meetingId,
        shareableLink
      }))
      setStep(2)

      ;(async () => {
        try {
          const qrUrl = await QRCode.toDataURL(shareableLink)
          setQrCodeUrl(qrUrl)
        } catch (err) {
          console.error('Error generating QR code:', err)
        }
      })()

      notify('success', 'Meeting created', `Code: ${response.meetingCode}`)
      playBeep(880, 140)
      setConfettiKey((k) => k + 1)
    } catch (err) {
      console.error('Error creating meeting:', err)
      setError('Failed to create meeting. Please try again.')
      notify('error', 'Failed to create meeting')
      playBeep(220, 200)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const meetingInfo = await apiService.getMeeting(joinFormData.meetingCode)
      socketService.connect()
      const joinResult = await socketService.joinMeeting(
        joinFormData.meetingCode,
        joinFormData.participantName,
        false
      )

      notify('success', 'Joined meeting', meetingInfo.title)
      playBeep(1000, 120)

      navigate(`/meeting/${joinFormData.meetingCode}`, {
        state: { 
          participantName: joinFormData.participantName,
          meetingInfo: joinResult.meeting,
          isParticipant: true 
        }
      })
    } catch (err) {
      console.error('Error joining meeting:', err)
      if ((err as any).message === 'Meeting not found') {
        setError('Meeting not found. Please check the code and try again.')
        notify('error', 'Meeting not found')
      } else {
        setError('Failed to join meeting. Please try again.')
        notify('error', 'Failed to join meeting')
      }
      playBeep(220, 200)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    notify('success', 'Copied to clipboard')
    playBeep(1200, 80)
  }

  const startMeeting = () => {
    navigate(`/facilitate/${meetingData.meetingCode}`, {
      state: { 
        facilitatorName: meetingData.facilitatorName,
        meetingName: meetingData.name,
        meetingCode: meetingData.meetingCode
      }
    })
  }

  const resetForm = () => {
    setStep(1)
    setError('')
    setMeetingData({
      name: '',
      facilitatorName: '',
      meetingCode: '',
      meetingId: '',
      shareableLink: ''
    })
    setJoinFormData({
      meetingCode: '',
      participantName: ''
    })
    setQrCodeUrl('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Confetti triggerKey={confettiKey} />
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => step === 1 ? navigate('/') : resetForm()}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Mode Toggle */}
        {step === 1 && (
          <div className="flex justify-center mb-8 px-4">
            <div className="relative bg-gradient-to-r from-muted/50 to-muted/30 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-xl p-1.5 flex backdrop-blur-sm border border-border/50 shadow-elegant w-full max-w-md">
              {/* Animated background indicator */}
              <div 
                className={`toggle-indicator ${
                  mode === 'create' 
                    ? 'left-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-primary to-accent' 
                    : 'left-[calc(50%+3px)] w-[calc(50%-6px)] bg-gradient-to-r from-moss-green to-sage-green'
                }`}
              />
              
              <button
                onClick={() => {
                  setMode('create')
                  resetForm()
                }}
                className={`toggle-button relative z-10 px-4 sm:px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
                  mode === 'create'
                    ? 'text-white shadow-sm transform scale-[1.02]'
                    : 'text-foreground/70 hover:text-foreground hover:scale-[1.01] dark:text-zinc-300 dark:hover:text-zinc-100'
                }`}
              >
                <Plus className={`w-4 h-4 mr-2 transition-all duration-300 ${
                  mode === 'create' ? 'text-white' : 'text-primary'
                }`} />
                <span className="hidden sm:inline">Create Meeting</span>
                <span className="sm:hidden">Create</span>
              </button>
              
              <button
                onClick={() => {
                  setMode('join')
                  resetForm()
                }}
                className={`toggle-button relative z-10 px-4 sm:px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
                  mode === 'join'
                    ? 'text-white shadow-sm transform scale-[1.02]'
                    : 'text-foreground/70 hover:text-foreground hover:scale-[1.01] dark:text-zinc-300 dark:hover:text-zinc-100'
                }`}
              >
                <UserPlus className={`w-4 h-4 mr-2 transition-all duration-300 ${
                  mode === 'join' ? 'text-white' : 'text-moss-green'
                }`} />
                <span className="hidden sm:inline">Join Meeting</span>
                <span className="sm:hidden">Join</span>
              </button>
            </div>
          </div>
        )}

        {/* Create Meeting Form */}
        {mode === 'create' && step === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <div className="text-center mb-8">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Users className="w-8 h-8 text-primary mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Create Meeting</h1>
              <p className="text-gray-600 dark:text-zinc-400">Set up your meeting and share the invitation link</p>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-6">
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
                  onChange={(e) => setMeetingData(prev => ({ ...prev, name: e.target.value }))}
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
                  onChange={(e) => setMeetingData(prev => ({ ...prev, facilitatorName: e.target.value }))}
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
                    Creating Meeting...
                  </>
                ) : (
                  'Create Meeting'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Join Meeting Form */}
        {mode === 'join' && step === 1 && (
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
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={joinFormData.meetingCode}
                  onChange={(e) => setJoinFormData(prev => ({ 
                    ...prev, 
                    meetingCode: e.target.value.toUpperCase() 
                  }))}
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
                  onChange={(e) => setJoinFormData(prev => ({ 
                    ...prev, 
                    participantName: e.target.value 
                  }))}
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
                  onClick={() => setMode('create')}
                  className="text-moss-green hover:text-moss-green/90 font-medium"
                >
                  Create a meeting
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Meeting Created Success Screen */}
        {mode === 'create' && step === 2 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <div className="text-center mb-8">
              <div className="bg-accent/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <QrCodeIcon className="w-8 h-8 text-accent mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Your meeting is ready!</h1>
              <p className="text-gray-600 dark:text-zinc-400">Share this code or link with participants</p>
            </div>

            <div className="space-y-6">
              {/* Meeting Code */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Meeting Code
                </label>
                <div className="bg-gray-50 dark:bg-zinc-950 border-2 border-dashed border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {meetingData.meetingCode}
                  </div>
                  <button
                    onClick={() => copyToClipboard(meetingData.meetingCode)}
                    className="flex items-center justify-center mx-auto text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Code
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                    QR Code
                  </label>
                  <div className="flex justify-center">
                    <img
                      src={qrCodeUrl}
                      alt="QR code to join meeting"
                      className="w-48 h-48 border border-gray-200 dark:border-zinc-800 rounded bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Shareable Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Shareable Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={meetingData.shareableLink}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
                  />
                  <button
                    onClick={() => copyToClipboard(meetingData.shareableLink)}
                    className="px-4 py-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300 transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={startMeeting}
                className="w-full bg-accent text-white py-3 px-6 rounded-lg font-semibold hover:bg-accent-hover transition-colors"
              >
                Start meeting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateOrJoinMeeting