import { Leaf, Users, Sparkles } from 'lucide-react'

export const Hero = () => (
  <div className="text-center mb-16 sm:mb-20 lg:mb-24 relative px-4">
    <div className="mb-8 sm:mb-12 inline-block">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl organic-blob"></div>
        <div className="relative liquid-glass p-6 sm:p-8 rounded-2xl sm:rounded-3xl inline-flex items-center justify-center gap-4">
          <img 
            src="/icc-logo-no-bg.png" 
            alt="ICC Austin Logo" 
            className="w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20"
          />
          <img 
            src="/community-badge-no-bg.png" 
            alt="Community Badge" 
            className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16"
          />
        </div>
      </div>
    </div>

    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold hero-text leading-tight tracking-tight">
        Organic Stack
        <br />
        <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light">Facilitation</span>
      </h1>

      <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-gradient-to-r from-primary via-accent to-primary mx-auto rounded-full opacity-60"></div>

      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
        Nurture inclusive conversations that grow naturally.
        <br />
        <span className="text-primary font-medium">Democratic • Sustainable • Human-centered</span>
      </p>
    </div>
  </div>
)

export default Hero
