import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Hand, MessageCircle, Info, Settings, LogOut, Users, Loader2 } from 'lucide-react'
import socketService from '../services/socket'
import { useToast } from '../components/ui/ToastProvider.jsx'
import { playBeep } from '../utils/sound.js'
import { getQueueTypeDisplay, getQueueTypeColor } from '../utils/queue'

interface Participant {
  id: string
  name: string
  isFacilitator: boolean
  hasRaisedHand: boolean
}

interface MeetingData {
  code: string
  title: string
  facilitator: string
}

interface QueueItem {
  id: string
  participantName: string
  type: string
  timestamp: number
}

function MeetingRoom(): JSX.Element {
  const { meetingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { participantName, meetingInfo } = location.state || {}
  
  const [meetingData, setMeetingData] = useState<MeetingData>(meetingInfo || {
    code: meetingId || '',
    title: 'Loading...',
    facilitator: 'Loading...'
  })
  
  const [participants, setParticipants] = useState<Participant[]>([])
  const [speakingQueue, setSpeakingQueue] = useState<QueueItem[]>([])
  const [isInQueue, setIsInQueue] = useState<boolean>(false)
  const [showDirectOptions, setShowDirectOptions] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [currentSpeaker, setCurrentSpeaker] = useState<QueueItem | null>(null)

  useEffect(() => {
    if (!participantName) {
      navigate('/join')
      return
    }

    // Store callback references for proper cleanup
    const queueUpdatedCallback = (queue) => {
      setSpeakingQueue(queue)
      const userInQueue = queue.find(item => item.participantName === participantName)
      setIsInQueue(!!userInQueue)
    }

    const participantsUpdatedCallback = (participantsList) => {
      setParticipants(participantsList)
    }

    const participantJoinedCallback = (data) => {
      showToast({ type: 'info', title: `${data.participant.name} joined` })
    }

    const participantLeftCallback = (data) => {
      showToast({ type: 'info', title: `${data.participantName} left` })
    }

    const nextSpeakerCallback = (speaker) => {
      setCurrentSpeaker(speaker)
      showToast({ type: 'success', title: `${speaker.participantName} is up next` })
      playBeep(1200, 120)
      setTimeout(() => {
        setCurrentSpeaker(null)
      }, 5000)
    }

    const errorCallback = (error) => {
      setError(error.message || 'Connection error')
      showToast({ type: 'error', title: error.message || 'Connection error' })
    }

    const setupSocketListeners = () => {
      socketService.onQueueUpdated(queueUpdatedCallback)
      socketService.onParticipantsUpdated(participantsUpdatedCallback)
      socketService.onParticipantJoined(participantJoinedCallback)
      socketService.onParticipantLeft(participantLeftCallback)
      socketService.onNextSpeaker(nextSpeakerCallback)
      socketService.onError(errorCallback)
    }

    if (!socketService.isConnected) {
      try {
        socketService.connect()
        setupSocketListeners()
        setIsConnected(true)
      } catch (err) {
        console.error('Connection error:', err)
        setError(err.message || 'Failed to connect to meeting. Please check your internet connection and try again.')
      }
    } else {
      setupSocketListeners()
      setIsConnected(true)
    }

    return () => {
      // Remove specific listeners using stored callback references
      socketService.off('queue-updated', queueUpdatedCallback)
      socketService.off('participants-updated', participantsUpdatedCallback)
      socketService.off('participant-joined', participantJoinedCallback)
      socketService.off('participant-left', participantLeftCallback)
      socketService.off('next-speaker', nextSpeakerCallback)
      socketService.off('error', errorCallback)
    }
  }, [participantName, navigate, showToast])

  const joinQueue = (type: string = 'speak') => {
    if (isInQueue || !isConnected) return
    
    try {
      socketService.joinQueue(type)
      setShowDirectOptions(false)
      showToast({ type: 'success', title: 'Joined queue', description: type === 'speak' ? 'Speak' : type.replace('-', ' ') })
      playBeep(1000, 120)
    } catch (err) {
      console.error('Join queue error:', err)
      setError(err.message || 'Failed to join queue. Please try again.')
      showToast({ type: 'error', title: err.message || 'Failed to join queue' })
      playBeep(220, 200)
    }
  }

  const leaveQueue = () => {
    if (!isInQueue || !isConnected) return
    
    try {
      socketService.leaveQueue()
      showToast({ type: 'info', title: 'Left queue' })
      playBeep(600, 100)
    } catch (err) {
      console.error('Leave queue error:', err)
      setError(err.message || 'Failed to leave queue. Please try again.')
      showToast({ type: 'error', title: err.message || 'Failed to leave queue' })
      playBeep(220, 200)
    }
  }

  const leaveMeeting = () => {
    socketService.disconnect()
    navigate('/')
  }

  if (!isConnected && !error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">Connecting to meeting...</h2>
          <p className="text-gray-600 dark:text-zinc-400">Please wait while we connect you to the meeting room.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-auto dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">Connection Error</h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/join')}
            className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{meetingData.title}</h1>
            <p className="text-gray-600 dark:text-zinc-400">
              Facilitated by {meetingData.facilitator} • Code: {meetingData.code}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600 dark:text-zinc-300">
              <Users className="w-5 h-5 mr-2" />
              <span>{participants.length} participants</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(meetingData.code)}
              className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              title="Copy meeting code"
            >
              Copy Code
            </button>
            <button
              onClick={leaveMeeting}
              className="flex items-center text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Current Speaker Alert */}
      {currentSpeaker && (
        <div className="bg-sage-green/10 border border-sage-green rounded-2xl p-6 mb-8 dark:bg-earthy-brown/10 dark:border-earthy-brown/30">
          <div className="flex items-center">
            <div className="bg-sage-green/20 p-3 rounded-full mr-4">
              <MessageCircle className="w-6 h-6 text-moss-green" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-earthy-brown dark:text-sage-green">Now Speaking</h3>
              <p className="text-moss-green dark:text-sage-green">
                {currentSpeaker.participantName} - {getQueueTypeDisplay(currentSpeaker.type)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Speaking Queue */}
        <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Speaking Queue</h2>
          
          {speakingQueue.length === 0 ? (
            <div className="text-center py-8">
              <Hand className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-zinc-400">No one in queue</p>
              <p className="text-sm text-gray-400 dark:text-zinc-500">Raise your hand to speak!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {speakingQueue.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border-2 ${
                    entry.participantName === participantName
                      ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-900/30'
                      : 'border-gray-200 bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full mr-3 dark:bg-purple-900/20 dark:text-purple-300">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-100">{entry.participantName}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getQueueTypeColor(entry.type)}`}>
                          {getQueueTypeDisplay(entry.type)}
                        </span>
                      </div>
                    </div>
                    {entry.participantName === participantName && (
                      <button
                        onClick={leaveQueue}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Leave Queue
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Actions</h2>
          
          <div className="space-y-4">
            {/* Main speak button */}
            <button
              onClick={() => joinQueue('speak')}
              disabled={isInQueue}
              className={`w-full py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                isInQueue
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <Hand className="w-5 h-5 mr-2" />
              {isInQueue ? 'In Queue' : 'Raise Hand to Speak'}
            </button>

            {/* Direct response options */}
            <div className="relative">
              <button
                onClick={() => setShowDirectOptions(!showDirectOptions)}
                disabled={isInQueue}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  isInQueue
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Direct Response
              </button>

              {showDirectOptions && !isInQueue && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 dark:bg-zinc-900 dark:border-zinc-800">
                  <button
                    onClick={() => joinQueue('direct-response')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 dark:hover:bg-zinc-800 dark:border-zinc-800"
                  >
                    <div className="font-medium text-gray-900 dark:text-zinc-100">Direct Response</div>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">Respond directly to current speaker</div>
                  </button>
                  <button
                    onClick={() => joinQueue('point-of-info')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 dark:hover:bg-zinc-800 dark:border-zinc-800"
                  >
                    <div className="font-medium text-gray-900 dark:text-zinc-100">Point of Information</div>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">Share relevant information</div>
                  </button>
                  <button
                    onClick={() => joinQueue('clarification')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors dark:hover:bg-zinc-800"
                  >
                    <div className="font-medium text-gray-900 dark:text-zinc-100">Clarification</div>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">Ask for clarification</div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Participant info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800">
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              <strong>You:</strong> {participantName}
            </p>
            <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1">
              <strong>Status:</strong> {isInQueue ? 'In speaking queue' : 'Ready to participate'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingRoom

