import { useState, useEffect } from 'react'
import socketService from '@/services/socket'
import { playBeep } from '@/utils/sound'

type Speaker = {
  participantName: string
  type: string
  [key: string]: unknown
}

interface Participant {
  id: string
  name: string
  isFacilitator?: boolean
  isInQueue?: boolean
  [key: string]: unknown
}

interface QueueEntry {
  id: string
  participantName: string
  type: string
  timestamp: number
  [key: string]: unknown
}

type ToastFn = (opts: { type: string; title: string }) => void

export function useFacilitatorSocket(
  meetingCode?: string,
  facilitatorName?: string,
  showToast?: ToastFn
) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [speakingQueue, setSpeakingQueue] = useState<QueueEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState('')
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null)

  useEffect(() => {
    if (!meetingCode || !facilitatorName) return

      const setupSocketListeners = () => {
        socketService.onQueueUpdated((queue: QueueEntry[]) => {
          setSpeakingQueue(queue)
        })

        socketService.onParticipantsUpdated((participantsList: Participant[]) => {
          setParticipants(participantsList)
        })

        socketService.onParticipantJoined((data: { participant: { name: string } }) => {
          showToast?.({ type: 'info', title: `${data.participant.name} joined` })
        })

        socketService.onParticipantLeft((data: { participantName: string }) => {
          showToast?.({ type: 'info', title: `${data.participantName} left` })
        })

        socketService.onNextSpeaker((speaker: Speaker) => {
          setCurrentSpeaker(speaker)
          showToast?.({ type: 'success', title: `Next: ${speaker.participantName}` })
          playBeep(1200, 120)
          setTimeout(() => {
            setCurrentSpeaker(null)
          }, 10000)
        })

        socketService.onError((err: Error) => {
          setError(err.message || 'Connection error')
          showToast?.({ type: 'error', title: err.message || 'Connection error' })
        })
      }

    const connectAsFacilitator = async () => {
      try {
        if (!socketService.isConnected) {
          socketService.connect()
        }
        setupSocketListeners()
        await socketService.joinMeeting(meetingCode, facilitatorName, true)
        setIsConnected(true)
      } catch (err) {
        if (err.message && err.message.includes('Only the meeting creator can join as facilitator')) {
          setError('You are not authorized to facilitate this meeting. Only the meeting creator can facilitate.')
        } else {
          setError('Failed to connect to meeting')
        }
      }
    }

    connectAsFacilitator()

    return () => {
      socketService.removeAllListeners()
    }
  }, [meetingCode, facilitatorName, showToast])

  const nextSpeaker = () => {
    if (speakingQueue.length === 0 || !isConnected) return
    try {
      socketService.nextSpeaker()
    } catch (err) {
      setError('Failed to call next speaker')
      showToast?.({ type: 'error', title: 'Failed to call next speaker' })
      playBeep(220, 200)
    }
  }

  const finishSpeaking = () => {
    setCurrentSpeaker(null)
  }

  const disconnect = () => {
    socketService.disconnect()
  }

  return {
    participants,
    speakingQueue,
    currentSpeaker,
    isConnected,
    error,
    nextSpeaker,
    finishSpeaking,
    disconnect
  }
}

export default useFacilitatorSocket

