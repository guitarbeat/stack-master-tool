
import { Hero } from '@/components/Hero'
import { ActionCards } from '@/components/ActionCards'
import { HowItWorks } from '@/components/HowItWorks'
// Removed CallToAction to reduce redundancy with ActionCards and header nav


function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Organic Background Elements - Mobile Responsive */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 sm:top-20 left-2 sm:left-10 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-primary/10 organic-blob"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-2 sm:right-10 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-accent/8 organic-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary/5 organic-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Hero />
        <ActionCards />
        <HowItWorks />
        {/* Call-to-action removed to streamline home screen */}
      </div>
    </div>
  )
}

export default HomePage
