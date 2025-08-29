import { ExpandableCard } from '@/components/ExpandableCard'
import useTiltEffect from '@/hooks/use-tilt'

export const HowItWorks = () => {
  const cardsRef = useTiltEffect()

  const steps = [
    {
      icon: '🌱',
      title: 'Seed the Space',
      summary: 'A facilitator creates the meeting environment.',
      details: 'Participants join with a simple code - no accounts, just authentic presence.'
    },
    {
      icon: '🌿',
      title: 'Nurture Names',
      summary: 'Everyone enters their name to join the circle.',
      details: 'No barriers, no complexity - just human connection in its simplest form.'
    },
    {
      icon: '🌳',
      title: 'Flourish Together',
      summary: 'Voices queue naturally like branches reaching for light.',
      details: 'Direct responses and interventions keep the dialogue healthy and balanced.'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4 sm:mb-6">How It Grows</h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Like nature, great conversations need the right conditions to flourish
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
        {steps.map((item, index) => (
          <div key={index} ref={(el) => (cardsRef.current[index] = el)} className="tilt-card group">
            <ExpandableCard
              className="liquid-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full transition-all duration-500 group-hover:scale-105 text-center"
              title={
                <div className="flex flex-col items-center gap-4 sm:gap-6">
                  <div className="text-4xl sm:text-5xl lg:text-6xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold gradient-text">{item.title}</h3>
                </div>
              }
              summary={item.summary}
            >
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">{item.details}</p>
            </ExpandableCard>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HowItWorks
