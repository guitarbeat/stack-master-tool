import { Shield, Clock, Users2, Zap, Heart, Globe } from 'lucide-react'
import useTiltEffect from '@/hooks/use-tilt'

export const Features = () => {
  const { setCardRef, handleMouseMove, handleMouseEnter, handleMouseLeave } = useTiltEffect({
    maxTilt: 12,
    scale: 1.02,
    speed: 150,
    followMouse: true,
    mouseFollowSmoothness: 0.15
  })

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Democratic Process",
      description: "Every voice matters with equal opportunity to contribute",
      benefits: ["Equal speaking time", "Transparent queue", "Fair rotation"]
    },
    {
      icon: <Clock className="w-6 h-6 text-accent" />,
      title: "Sustainable Flow",
      description: "Natural conversation rhythm that respects all participants",
      benefits: ["Organic pacing", "Respectful timing", "Natural breaks"]
    },
    {
      icon: <Users2 className="w-6 h-6 text-primary" />,
      title: "Inclusive Design",
      description: "Accessible to all participants regardless of background",
      benefits: ["Universal access", "Cultural sensitivity", "Language support"]
    },
    {
      icon: <Zap className="w-6 h-6 text-accent" />,
      title: "Real-time Sync",
      description: "Instant updates keep everyone connected and informed",
      benefits: ["Live updates", "Instant notifications", "Seamless sync"]
    },
    {
      icon: <Heart className="w-6 h-6 text-primary" />,
      title: "Human-centered",
      description: "Designed with empathy and human needs at the core",
      benefits: ["Emotional intelligence", "Compassionate design", "Wellness focus"]
    },
    {
      icon: <Globe className="w-6 h-6 text-accent" />,
      title: "Global Reach",
      description: "Connect participants from anywhere in the world",
      benefits: ["Remote access", "Time zone friendly", "Cross-cultural"]
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base mb-4">
          <Heart className="w-4 h-4" />
          <span>Platform Features</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-4">
          Three-Mode
          <span className="text-primary"> Platform</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
          HOST, JOIN, and WATCH modes designed for different roles in democratic meeting facilitation. Each mode provides tailored functionality for facilitators, participants, and observers.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            ref={setCardRef(index)}
            onMouseMove={handleMouseMove(index)}
            onMouseEnter={handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave(index)}
            className="tilt-card group"
          >
            <div className="liquid-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full transition-all duration-500 group-hover:scale-105 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 organic-blob opacity-50"></div>
              
              <div className="relative z-10 space-y-4">
                {/* Icon and Title */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="liquid-glass p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold gradient-text">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12 sm:mt-16">
        <div className="liquid-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-3">
            Choose Your Mode
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            HOST to facilitate, JOIN to participate, or WATCH to observe - each mode is designed for your specific role in democratic discussions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="text-2xl sm:text-3xl">🎯</div>
            <div className="text-2xl sm:text-3xl">🌿</div>
            <div className="text-2xl sm:text-3xl">👁️</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Features