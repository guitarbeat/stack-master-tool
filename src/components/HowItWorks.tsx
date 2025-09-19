import { ExpandableCard } from '@/components/ui/expandable-card'
import useTiltEffect from '@/hooks/use-tilt'

export const HowItWorks = () => {
  const cardsRef = useTiltEffect()

  const steps = []

  return (
    <div className="max-w-6xl mx-auto">

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((item, index) => (
          <div key={index} ref={(el) => (cardsRef.current[index] = el)} className="tilt-card group">
            <ExpandableCard
              className="liquid-glass rounded-2xl sm:rounded-3xl h-full transition-all duration-500 group-hover:scale-105 text-center"
              trigger={
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-center gap-3 sm:gap-4 mx-auto">
                    <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold gradient-text">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.summary}</p>
                  </div>
                </div>
              }
              contentClassName="p-0"
            >
              <div className="p-4 sm:p-6">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{item.details}</p>
              </div>
            </ExpandableCard>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HowItWorks
