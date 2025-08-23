import { Leaf, Users, Sparkles } from 'lucide-react'

export const Hero = () => (
  <div className="text-center mb-24 relative">
    <div className="mb-8 inline-block">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl organic-blob"></div>
        <div className="relative liquid-glass p-6 rounded-3xl inline-flex items-center justify-center">
          <Leaf className="w-12 h-12 text-primary mr-3" />
          <Users className="w-12 h-12 text-accent" />
          <Sparkles className="w-8 h-8 text-primary ml-3" />
        </div>
      </div>
    </div>

    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold hero-text leading-tight tracking-tight">
        Organic Stack
        <br />
        <span className="text-3xl sm:text-5xl md:text-6xl font-light">Facilitation</span>
      </h1>

      <div className="w-32 h-1.5 bg-gradient-to-r from-primary via-accent to-primary mx-auto rounded-full opacity-60"></div>

      <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
        Nurture inclusive conversations that grow naturally.
        <br />
        <span className="text-primary font-medium">Democratic • Sustainable • Human-centered</span>
      </p>
    </div>
  </div>
)

export default Hero
