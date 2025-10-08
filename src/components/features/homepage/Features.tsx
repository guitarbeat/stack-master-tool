import { Heart } from 'lucide-react'
import useTiltEffect from '@/hooks/use-tilt'
import { PLATFORM_FEATURES } from './constants'
import { SectionHeader, SectionCTA } from './SectionHeader'

export const Features = () => {
  const { setCardRef, handleMouseMove, handleMouseEnter, handleMouseLeave } = useTiltEffect({
    maxTilt: 12,
    scale: 1.02,
    speed: 150,
    followMouse: true,
    mouseFollowSmoothness: 0.15
  })

  const features = PLATFORM_FEATURES.map(feature => ({
    icon: <feature.icon className="w-6 h-6 text-primary" />,
    title: feature.title,
    description: feature.description,
    benefits: feature.benefits
  }))

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        icon={Heart}
        badge="Platform Features"
        title="Three-Mode"
        subtitle="Platform"
        description="HOST, JOIN, and WATCH modes designed for different roles in democratic meeting facilitation. Each mode provides tailored functionality for facilitators, participants, and observers."
      />

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

      <SectionCTA
        title="Choose Your Mode"
        description="HOST to facilitate, JOIN to participate, or WATCH to observe - each mode is designed for your specific role in democratic discussions."
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="text-2xl sm:text-3xl">🎯</div>
          <div className="text-2xl sm:text-3xl">🌿</div>
          <div className="text-2xl sm:text-3xl">👁️</div>
        </div>
      </SectionCTA>
    </div>
  )
}

export default Features