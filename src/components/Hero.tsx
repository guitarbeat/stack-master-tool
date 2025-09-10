import { Leaf, Users, Sparkles } from 'lucide-react'

export const Hero = () => (
  <div className="text-center mb-16 sm:mb-20 lg:mb-24 relative px-4">
    <div className="mb-6 sm:mb-8 inline-block">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl organic-blob"></div>
        <div className="relative liquid-glass p-4 sm:p-6 rounded-2xl sm:rounded-3xl inline-flex items-center justify-center">
          <Leaf className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 text-primary mr-2 sm:mr-3" />
          <Users className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 text-accent" />
          <Sparkles className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-primary ml-2 sm:ml-3" />
        </div>
      </div>
    </div>

    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
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
