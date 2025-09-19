import { MessageCircle, Play, Pause, RotateCcw } from 'lucide-react'
import { getQueueTypeDisplay } from '@/utils/queue'

interface Speaker {
  participantName: string
  type: string
}

interface SpeakerTimer {
  participantId: string;
  startTime: Date;
  isActive: boolean;
  pausedTime?: number;
}

interface CurrentSpeakerCardProps {
  currentSpeaker: Speaker | null
  finishSpeaking: () => void
  speakerTimer?: SpeakerTimer | null
  elapsedTime: number
  onToggleTimer?: () => void
  onResetTimer?: () => void
  formatTime?: (ms: number) => string
}

export default function CurrentSpeakerCard({
  currentSpeaker,
  finishSpeaking,
  speakerTimer,
  elapsedTime,
  onToggleTimer,
  onResetTimer,
  formatTime
}: CurrentSpeakerCardProps) {
  if (!currentSpeaker) return null

  const defaultFormatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const timeFormatter = formatTime || defaultFormatTime

  return (
    <div className="bg-accent/10 border border-accent rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-accent/20 p-3 rounded-full mr-4">
            <MessageCircle className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Now Speaking</h3>
            <p className="text-muted-foreground">
              {currentSpeaker.participantName} - {getQueueTypeDisplay(currentSpeaker.type)}
            </p>
            {speakerTimer && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-mono text-accent">
                  {timeFormatter(elapsedTime)}
                </span>
                {onToggleTimer && (
                  <button
                    onClick={onToggleTimer}
                    className="p-1 hover:bg-accent/20 rounded transition-colors"
                    title={speakerTimer.isActive ? "Pause timer" : "Resume timer"}
                  >
                    {speakerTimer.isActive ? (
                      <Pause className="w-4 h-4 text-accent" />
                    ) : (
                      <Play className="w-4 h-4 text-accent" />
                    )}
                  </button>
                )}
                {onResetTimer && (
                  <button
                    onClick={onResetTimer}
                    className="p-1 hover:bg-accent/20 rounded transition-colors"
                    title="Reset timer"
                  >
                    <RotateCcw className="w-4 h-4 text-accent" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={finishSpeaking}
          className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-medium hover:bg-accent-hover transition-colors"
        >
          Finish Speaking
        </button>
      </div>
    </div>
  )
}

