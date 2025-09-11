import { MessageCircle } from 'lucide-react'
import { getQueueTypeDisplay } from '@/utils/queue'

interface Speaker {
  participantName: string
  type: string
}

interface CurrentSpeakerCardProps {
  currentSpeaker: Speaker | null
  finishSpeaking: () => void
}

export default function CurrentSpeakerCard({
  currentSpeaker,
  finishSpeaking
}: CurrentSpeakerCardProps) {
  if (!currentSpeaker) return null

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

