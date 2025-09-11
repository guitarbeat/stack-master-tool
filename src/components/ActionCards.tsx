import { Link } from 'react-router-dom'
import { MessageSquare, QrCode, ArrowRight, Users } from 'lucide-react'
import useTiltEffect from '@/hooks/use-tilt'

export const ActionCards = () => {
  const cardsRef = useTiltEffect()

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
      {/* Create Meeting */}
      <div ref={(el) => (cardsRef.current[0] = el)} className="tilt-card group">
        <Link to="/create" className="block h-full">
          <div className="liquid-glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-full transition-all duration-500 group-hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-primary/10 organic-blob opacity-50"></div>

            <div className="relative z-10">
              <div className="mb-6">
                <div className="liquid-glass p-3 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-3">Cultivate Meeting</h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Plant the seed for meaningful dialogue. Generate a shareable space where voices can flourish.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="liquid-glass px-3 sm:px-4 py-2 rounded-2xl text-primary font-semibold flex items-center text-sm">
                  Start Growing
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-2xl sm:text-3xl opacity-20">🌱</div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Join Meeting */}
      <div ref={(el) => (cardsRef.current[1] = el)} className="tilt-card group">
        <Link to="/join" className="block h-full">
          <div className="liquid-glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-full transition-all duration-500 group-hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 bg-accent/10 organic-blob opacity-50" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10">
              <div className="mb-6">
                <div className="liquid-glass p-3 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-3">Join the Grove</h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Connect with an existing circle. Enter a meeting code and add your voice to the collective wisdom.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="liquid-glass px-3 sm:px-4 py-2 rounded-2xl text-accent font-semibold flex items-center text-sm">
                  Enter Circle
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-2xl sm:text-3xl opacity-20">🌿</div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Manual Stack */}
      <div ref={(el) => (cardsRef.current[2] = el)} className="tilt-card group">
        <Link to="/manual" className="block h-full">
          <div className="liquid-glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-full transition-all duration-500 group-hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-16 sm:w-20 h-16 sm:h-20 bg-primary/10 organic-blob opacity-50" style={{ animationDelay: '3s' }}></div>

            <div className="relative z-10">
              <div className="mb-6">
                <div className="liquid-glass p-3 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-3">Manual Stack</h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Manage speaking queues offline. Perfect for in-person meetings and direct facilitation.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="liquid-glass px-3 sm:px-4 py-2 rounded-2xl text-primary font-semibold flex items-center text-sm">
                  Start Facilitating
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-2xl sm:text-3xl opacity-20">📝</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default ActionCards
