// @ts-nocheck - Legacy API service during migration
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import apiService from '../services/api'
import { toast } from '@/hooks/use-toast'
import { playBeep } from '../utils/sound.js'
import { AppError, getErrorDisplayInfo } from '../utils/errorHandling'
import { useFacilitatorSession } from '@/hooks/useFacilitatorSession'

interface MeetingData {
  name: string
  facilitatorName: string
  meetingCode: string
  meetingId: string
  shareableLink: string
}

interface UseMeetingCreationReturn {
  step: number
  loading: boolean
  error: string
  meetingData: MeetingData
  qrCodeUrl: string
  confettiKey: number
  setStep: (step: number) => void
  setMeetingData: (data: Partial<MeetingData>) => void
  handleCreateMeeting: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  copyToClipboard: (text: string) => void
  startMeeting: () => void
}

export function useMeetingCreation(): UseMeetingCreationReturn {
  const navigate = useNavigate()
  const { saveSession } = useFacilitatorSession()
  
  const [step, setStep] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [meetingData, setMeetingDataState] = useState<MeetingData>({
    name: "",
    facilitatorName: "",
    meetingCode: "",
    meetingId: "",
    shareableLink: "",
  })
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [confettiKey, setConfettiKey] = useState<number>(0)

  const notify = (_type: 'success' | 'error' | 'info', title: string, description?: string) => {
    toast({ title, description })
  }

  const setMeetingData = (changes: Partial<MeetingData>) => {
    setMeetingDataState(prev => ({ ...prev, ...changes }))
  }

  const handleCreateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await apiService.createMeeting(
        meetingData.facilitatorName,
        meetingData.name
      )

      const shareableLink = `${window.location.origin}/join?code=${response.meetingCode}`

      // Set state and advance UI before generating QR to avoid perceived slowness
      setMeetingData({
        meetingCode: response.meetingCode,
        meetingId: response.meetingId,
        shareableLink,
      })

      // Store meeting data in localStorage for facilitate button access
      localStorage.setItem(
        "currentMeeting",
        JSON.stringify({
          meetingCode: response.meetingCode,
          meetingId: response.meetingId,
          facilitatorName: meetingData.facilitatorName,
          meetingName: meetingData.name,
        })
      )

      setStep(2)

      // Save facilitator session for persistence
      saveSession({
        meetingCode: response.meetingCode,
        facilitatorName: meetingData.facilitatorName,
        meetingTitle: meetingData.name
      })

      // Generate QR in background
      (async () => {
        try {
          const qrUrl = await QRCode.toDataURL(shareableLink)
          setQrCodeUrl(qrUrl)
        } catch (err) {
          console.error("Error generating QR code:", err)
        }
      })()

      notify("success", "Meeting created", `Code: ${response.meetingCode}`)
      playBeep(880, 140)
      setConfettiKey(k => k + 1)
    } catch (err) {
      console.error("Error creating meeting:", err)

      const errorInfo = getErrorDisplayInfo(err as AppError)
      setError(errorInfo.description)
      notify("error", errorInfo.title, errorInfo.description)
      playBeep(220, 200)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    notify("success", "Copied to clipboard")
    playBeep(1200, 80)
  }

  const startMeeting = () => {
    navigate(`/facilitate/${meetingData.meetingCode}`, {
      state: {
        facilitatorName: meetingData.facilitatorName,
        meetingName: meetingData.name,
        meetingCode: meetingData.meetingCode,
      },
    })
  }

  return {
    step,
    loading,
    error,
    meetingData,
    qrCodeUrl,
    confettiKey,
    setStep,
    setMeetingData,
    handleCreateMeeting,
    copyToClipboard,
    startMeeting,
  }
}