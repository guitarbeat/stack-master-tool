import { Hero } from '@/components/Hero'
import { ActionCards } from '@/components/ActionCards'
import { HowItWorks } from '@/components/HowItWorks'
import { CallToAction } from '@/components/CallToAction'

function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Organic Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 organic-blob"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/8 organic-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 organic-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <Hero />
        <ActionCards />
        <HowItWorks />
        <CallToAction />
      </div>
    </div>
  )
}

export default HomePage
