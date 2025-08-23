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
    <div className="bg-sage-green/10 border border-sage-green rounded-2xl p-6 mb-8 dark:bg-earthy-brown/10 dark:border-earthy-brown/30">
      <div className="flex items-center justify-between">
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
        <button
          onClick={finishSpeaking}
          className="bg-moss-green text-white px-4 py-2 rounded-lg font-medium hover:bg-moss-green/90 transition-colors"
        >
          Finish Speaking
        </button>
      </div>
    </div>
  )
}

