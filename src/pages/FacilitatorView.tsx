import React, { useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Users, Play, SkipForward, LogOut, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import FacilitatorHeader from '../components/FacilitatorHeader'
import ParticipantList from '../components/ParticipantList'
import CurrentSpeakerCard from '../components/CurrentSpeakerCard'
import useFacilitatorSocket from '../hooks/useFacilitatorSocket'
import { getQueueTypeDisplay, getQueueTypeColor } from '../utils/queue'

interface MeetingData {
  code: string
  title: string
  facilitator: string
  isActive: boolean
}

function FacilitatorView(): JSX.Element {
  const { meetingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const showToast = (payload: { title: string; description?: string }) => {
    toast(payload)
  }
  const { facilitatorName, meetingName, meetingCode } = location.state || {}

  const meetingData = {
    code: meetingCode || meetingId,
    title: meetingName || 'Meeting',
    facilitator: facilitatorName || 'Facilitator',
    isActive: true
  }

  useEffect(() => {
    if (!facilitatorName || !meetingCode) {
      navigate('/create')
    }
  }, [facilitatorName, meetingCode, navigate])

  const {
    participants,
    speakingQueue,
    currentSpeaker,
    isConnected,
    error,
    nextSpeaker,
    finishSpeaking,
    disconnect
  } = useFacilitatorSocket(meetingCode, facilitatorName, showToast)

  const leaveMeeting = () => {
    disconnect()
    navigate('/')
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isConnected && !error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">Setting up meeting...</h2>
          <p className="text-gray-600 dark:text-zinc-400">Please wait while we prepare your facilitator view.</p>
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
            onClick={() => navigate('/create')}
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
      <FacilitatorHeader
        title={meetingData.title}
        code={meetingData.code}
        participantCount={participants.length}
        leaveMeeting={leaveMeeting}
      />

      <CurrentSpeakerCard
        currentSpeaker={currentSpeaker}
        finishSpeaking={finishSpeaking}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Speaking Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Speaking Queue</h2>
            <button
              onClick={nextSpeaker}
              disabled={speakingQueue.length === 0}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                speakingQueue.length === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Next Speaker
            </button>
          </div>
          
          {speakingQueue.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-zinc-400 text-lg">No one in queue</p>
              <p className="text-sm text-gray-400 dark:text-zinc-500">Participants can raise their hand to join the queue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {speakingQueue.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border-2 ${
                    index === 0
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/30'
                      : 'border-gray-200 bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`text-sm font-semibold px-3 py-1 rounded-full mr-3 ${
                        index === 0
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-200'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-100">{entry.participantName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getQueueTypeColor(entry.type)}`}>
                            {getQueueTypeDisplay(entry.type)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-zinc-400">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="flex items-center text-blue-600 dark:text-blue-400">
                        <Play className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Next</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Participants */}
        <ParticipantList
          participants={participants}
          meetingData={meetingData}
        />
      </div>
    </div>
  )
}

export default FacilitatorView

