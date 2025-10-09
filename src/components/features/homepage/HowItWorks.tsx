import { ExpandableCard } from '@/components/ui/expandable-card'
import useTiltEffect from '@/hooks/use-tilt'
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import { HOW_IT_WORKS_STEPS } from './constants'
import { SectionHeader } from './SectionHeader'

export const HowItWorks = () => {
  const { setCardRef, handleMouseMove, handleMouseEnter, handleMouseLeave } = useTiltEffect({
    maxTilt: 10,
    scale: 1.01,
    speed: 200,
    followMouse: true,
    mouseFollowSmoothness: 0.12
  })

  const steps = HOW_IT_WORKS_STEPS.map((step, index) => ({
    icon: <step.icon className={`w-8 h-8 ${index === 0 ? 'text-primary' : index === 1 ? 'text-accent' : 'text-primary'}`} />,
    title: step.title,
    summary: step.summary,
    details: step.details
  }))

  return (
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        icon={Sparkles}
        badge="How It Works"
        title="Three Ways to"
        subtitle="Participate"
        description="Choose your role: HOST to facilitate, JOIN to participate, or WATCH to observe democratic discussions"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((item, index) => (
          <div
            key={index}
            ref={setCardRef(index)}
            onMouseMove={handleMouseMove(index)}
            onMouseEnter={handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave(index)}
            className="tilt-card group"
          >
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
                  
                  {/* Key Features */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="text-center p-3 bg-primary/5 rounded-xl">
                      <div className="text-primary font-semibold text-sm">Organized</div>
                      <div className="text-xs text-muted-foreground">Clear queue</div>
                    </div>
                    <div className="text-center p-3 bg-accent/5 rounded-xl">
                      <div className="text-accent font-semibold text-sm">Fair</div>
                      <div className="text-xs text-muted-foreground">Equal turns</div>
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
