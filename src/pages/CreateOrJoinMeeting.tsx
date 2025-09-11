import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import QRCode from 'qrcode'
import apiService from '../services/api'
import socketService from '../services/socket'
import { toast } from '@/hooks/use-toast'
import { playBeep } from '../utils/sound.js'
import Confetti from '../components/ui/Confetti.jsx'
import ModeToggle from '../components/meeting/ModeToggle'
import CreateMeetingForm from '../components/meeting/CreateMeetingForm'
import JoinMeetingForm from '../components/meeting/JoinMeetingForm'
import CreateSuccess from '../components/meeting/CreateSuccess'

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
        <ModeToggle
          mode={mode}
          step={step}
          onSelectCreate={() => { setMode('create'); resetForm() }}
          onSelectJoin={() => { setMode('join'); resetForm() }}
        />

        {/* Create Meeting Form */}
        {mode === 'create' && step === 1 && (
          <CreateMeetingForm
            error={error}
            loading={loading}
            meetingData={{ name: meetingData.name, facilitatorName: meetingData.facilitatorName }}
            onChange={(changes) => setMeetingData(prev => ({ ...prev, ...changes }))}
            onSubmit={handleCreateMeeting}
          />
        )}

        {/* Join Meeting Form */}
        {mode === 'join' && step === 1 && (
          <JoinMeetingForm
            error={error}
            loading={loading}
            joinFormData={joinFormData}
            onChange={(changes) => setJoinFormData(prev => ({ ...prev, ...changes }))}
            onSubmit={handleJoinMeeting}
            onSwitchToCreate={() => setMode('create')}
          />
        )}

        {/* Meeting Created Success Screen */}
        {mode === 'create' && step === 2 && (
          <CreateSuccess
            meetingCode={meetingData.meetingCode}
            shareableLink={meetingData.shareableLink}
            qrCodeUrl={qrCodeUrl}
            onCopyCode={() => copyToClipboard(meetingData.meetingCode)}
            onCopyLink={() => copyToClipboard(meetingData.shareableLink)}
            onStartMeeting={startMeeting}
          />
        )}
      </div>
    </div>
  )
}

export default CreateOrJoinMeeting