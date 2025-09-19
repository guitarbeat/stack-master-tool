import { ExpandableCard } from '@/components/ui/expandable-card'
import useTiltEffect from '@/hooks/use-tilt'
import { MessageSquare, Users, Leaf, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'

export const HowItWorks = () => {
  const cardsRef = useTiltEffect()

  const steps = [
    {
      icon: <MessageSquare className="w-8 h-8 text-primary" />,
      title: "Plant the Seed",
      summary: "Create or join a meeting space",
      details: "Start by creating a new meeting room or joining an existing one using a meeting code. The platform generates a unique space where participants can gather and contribute to the conversation organically."
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "Grow Together",
      summary: "Add participants to the stack",
      details: "Participants can add themselves to the speaking queue, creating a natural flow of conversation. The democratic system ensures everyone has an equal opportunity to contribute their voice to the discussion."
    },
    {
      icon: <Leaf className="w-8 h-8 text-primary" />,
      title: "Nurture Dialogue",
      summary: "Facilitate organic conversation",
      details: "The facilitator manages the speaking order while maintaining the natural flow of conversation. The system supports sustainable, human-centered dialogue that grows organically based on participant needs and contributions."
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base mb-4">
          <Sparkles className="w-4 h-4" />
          <span>How It Works</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-4">
          Three Simple Steps to
          <br />
          <span className="text-primary">Organic Facilitation</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Transform your meetings into inclusive, democratic conversations that grow naturally
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((item, index) => (
          <div key={index} ref={(el) => (cardsRef.current[index] = el)} className="tilt-card group">
            <ExpandableCard
              className="liquid-glass rounded-2xl sm:rounded-3xl h-full transition-all duration-500 group-hover:scale-105 text-center relative overflow-hidden"
              trigger={
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-center gap-4 sm:gap-6 mx-auto p-6 sm:p-8">
                    {/* Step Number */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    {/* Icon */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-full blur-lg group-hover:bg-primary/20 transition-all duration-300"></div>
                      <div className="relative liquid-glass p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-lg sm:text-xl font-bold gradient-text">{item.title}</h3>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{item.summary}</p>
                    </div>
                    
                    {/* Expand Indicator */}
                    <div className="flex items-center gap-2 text-primary/60 text-xs font-medium group-hover:text-primary transition-colors">
                      <span>Learn more</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              }
              contentClassName="p-0"
            >
              <div className="p-6 sm:p-8 border-t border-border/20">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{item.details}</p>
                  </div>
                  
                  {/* Additional Benefits */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="text-center p-3 bg-primary/5 rounded-xl">
                      <div className="text-primary font-semibold text-sm">Democratic</div>
                      <div className="text-xs text-muted-foreground">Equal voice</div>
                    </div>
                    <div className="text-center p-3 bg-accent/5 rounded-xl">
                      <div className="text-accent font-semibold text-sm">Organic</div>
                      <div className="text-xs text-muted-foreground">Natural flow</div>
                    </div>
                  </div>
                </div>
              </div>
            </ExpandableCard>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HowItWorks
