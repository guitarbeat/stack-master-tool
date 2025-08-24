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
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">How It Grows</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Like nature, great conversations need the right conditions to flourish
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        {steps.map((item, index) => (
          <div key={index} ref={(el) => (cardsRef.current[index] = el)} className="tilt-card group">
            <ExpandableCard
              className="liquid-glass rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105 text-center"
              title={
                <div className="flex flex-col items-center gap-6">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold gradient-text">{item.title}</h3>
                </div>
              }
              summary={item.summary}
            >
              <p className="text-muted-foreground leading-relaxed text-lg">{item.details}</p>
            </ExpandableCard>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HowItWorks
