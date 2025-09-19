import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Users, Play, SkipForward, LogOut, Loader2, MessageCircle, Info, Settings, RotateCcw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FacilitatorHeader from '../components/FacilitatorHeader'
import ParticipantList from '../components/ParticipantList'
import CurrentSpeakerCard from '../components/CurrentSpeakerCard'
import { SpeakingDistribution } from '../components/StackKeeper/SpeakingDistribution'
import { InterventionsPanel } from '../components/StackKeeper/InterventionsPanel'
import useFacilitatorSocket from '../hooks/useFacilitatorSocket'
import { getQueueTypeDisplay, getQueueTypeColor } from '../utils/queue'
import { useMeetingCreator } from '../hooks/useMeetingCreator'

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
  const { creatorData, validateFacilitator, clearCreator } = useMeetingCreator()
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  
  const showToast = (payload: { title: string; description?: string }) => {
    toast(payload)
  }
  
  // Get facilitator data from either location state (direct navigation) or stored creator data
  const { facilitatorName, meetingName, meetingCode } = location.state || {}
  const storedCreatorData = creatorData
  
  // Use stored data if available, otherwise fall back to location state
  const effectiveMeetingCode = meetingCode || storedCreatorData?.meetingCode || meetingId
  const effectiveFacilitatorName = facilitatorName || storedCreatorData?.facilitatorName
  const effectiveMeetingName = meetingName || storedCreatorData?.meetingTitle || 'Meeting'
  const facilitatorToken = storedCreatorData?.facilitatorToken

  const meetingData = {
    code: effectiveMeetingCode,
    title: effectiveMeetingName,
    facilitator: effectiveFacilitatorName || 'Facilitator',
    isActive: true
  }

  // Validate facilitator access on component mount
  useEffect(() => {
    const validateAccess = async () => {
      if (!effectiveFacilitatorName || !effectiveMeetingCode) {
        navigate('/create')
        return
      }

      // If we have a token, validate it with the server
      if (facilitatorToken) {
        setIsValidating(true)
        setValidationError(null)
        
        try {
          const isValid = await validateFacilitator(effectiveMeetingCode, effectiveFacilitatorName, facilitatorToken)
          if (!isValid) {
            setValidationError('Invalid facilitator credentials')
            showToast({ type: 'error', title: 'Access Denied', description: 'Invalid facilitator credentials' })
            navigate('/create')
          }
        } catch (error) {
          console.error('Error validating facilitator:', error)
          setValidationError('Failed to validate facilitator access')
          showToast({ type: 'error', title: 'Validation Error', description: 'Failed to validate facilitator access' })
          navigate('/create')
        } finally {
          setIsValidating(false)
        }
      } else {
        // No token available, redirect to create
        navigate('/create')
      }
    }

    validateAccess()
  }, [effectiveFacilitatorName, effectiveMeetingCode, facilitatorToken, validateFacilitator, navigate, showToast])

  const {
    participants,
    speakingQueue,
    currentSpeaker,
    isConnected,
    error,
    nextSpeaker,
    finishSpeaking,
    disconnect,
    speakerTimer,
    elapsedTime,
    toggleSpeakerTimer,
    resetSpeakerTimer,
    formatTime,
    getSpeakingDistribution,
    clearSpeakingHistory,
    interventions,
    setInterventions,
    addIntervention,
    undoHistory,
    handleUndo
  } = useFacilitatorSocket(effectiveMeetingCode, effectiveFacilitatorName, showToast, facilitatorToken)

  const leaveMeeting = () => {
    disconnect()
    clearCreator() // Clear stored facilitator data
    navigate('/')
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isValidating) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">Validating access...</h2>
          <p className="text-gray-600 dark:text-zinc-400">Please wait while we verify your facilitator credentials.</p>
        </div>
      </div>
    )
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
        speakerTimer={speakerTimer}
        elapsedTime={elapsedTime}
        onToggleTimer={toggleSpeakerTimer}
        onResetTimer={resetSpeakerTimer}
        formatTime={formatTime}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Speaking Queue */}
        <Card className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">Speaking Queue</CardTitle>
            <div className="flex items-center gap-2">
              {undoHistory.length > 0 && (
                <Button
                  onClick={handleUndo}
                  variant="outline"
                  className="rounded-xl"
                  title={`Undo (${undoHistory.length} actions available)`}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo ({undoHistory.length})
                </Button>
              )}
              <Button
                onClick={nextSpeaker}
                disabled={speakingQueue.length === 0}
                className="floating-glow rounded-xl"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Next Speaker
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {speakingQueue.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-zinc-400 text-lg">No one in queue</p>
                <p className="text-sm text-gray-400 dark:text-zinc-500">Participants can raise their hand to join the queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {speakingQueue.map((entry, index) => {
                  const isCurrentSpeaker = index === 0;
                  const isDirect = entry.type === 'direct-response';
                  const isPointInfo = entry.type === 'point-of-info';
                  const isClarify = entry.type === 'clarification';
                  
                  return (
                    <div
                      key={entry.id}
                      className={`stack-card flex items-center justify-between p-6 rounded-xl border transition-standard ${
                        isCurrentSpeaker
                          ? 'current-speaker border-primary/40 text-primary-foreground'
                          : 'glass-card hover:bg-muted/40 border-border/60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={isCurrentSpeaker ? "default" : "secondary"}
                          className={`${
                            isCurrentSpeaker
                              ? 'animate-pulse bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                              : 'px-4 py-2 font-semibold'
                          } rounded-full text-sm ${
                            isDirect ? 'bg-primary text-primary-foreground animate-pulse' : ''
                          }`}
                        >
                          {isCurrentSpeaker 
                            ? (isDirect ? "🎤 Direct Response" : "🎤 Speaking") 
                            : `#${index + 1}`
                          }
                        </Badge>
                        <div className="flex items-center gap-2">
                          {isDirect && <MessageCircle className="h-4 w-4 text-primary" />}
                          {isPointInfo && <Info className="h-4 w-4 text-blue-600" />}
                          {isClarify && <Settings className="h-4 w-4 text-purple-600" />}
                          <span className={`font-semibold text-lg ${isCurrentSpeaker ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {entry.participantName}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isDirect ? 'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300' :
                            isPointInfo ? 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300' :
                            isClarify ? 'border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300' :
                            'border-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {getQueueTypeDisplay(entry.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isCurrentSpeaker && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => addIntervention('direct-response', entry.participantName)}
                              className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                              title="Direct Response"
                            >
                              Direct Response
                            </button>
                            <button
                              onClick={() => addIntervention('clarifying-question', entry.participantName)}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                              title="Clarifying Question"
                            >
                              Clarify
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement remove from queue functionality
                                console.log('Remove from queue:', entry.participantName)
                              }}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                              title="Remove from Queue"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        {isCurrentSpeaker && (
                          <div className="flex items-center text-primary">
                            <Play className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Next</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participants */}
        <ParticipantList
          participants={participants}
          meetingData={meetingData}
        />
      </div>

      {/* Speaking Distribution */}
      <SpeakingDistribution
        speakingData={getSpeakingDistribution(true)}
        includeDirectResponses={true}
        onToggleIncludeDirectResponses={() => {}}
      />

      {/* Interventions Panel */}
      <InterventionsPanel
        interventions={interventions}
        onClearInterventions={() => setInterventions([])}
        showInterventionsPanel={true}
      />
    </div>
  )
}

export default FacilitatorView

