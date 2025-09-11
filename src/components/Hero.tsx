import { Leaf, Users, Sparkles } from 'lucide-react'

export const Hero = () => (
  <div className="text-center mb-16 sm:mb-20 lg:mb-24 relative px-4">
    <div className="mb-8 sm:mb-12 inline-block">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl organic-blob"></div>
        <div className="relative liquid-glass p-6 sm:p-8 rounded-2xl sm:rounded-3xl inline-flex items-center justify-center gap-4">
          {/* ICC Logos */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm group-hover:bg-primary/20 transition-colors duration-300"></div>
              <img 
                src="/icc-logo.png" 
                alt="ICC Logo" 
                className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain drop-shadow-lg hover:scale-110 transition-all duration-300"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-accent/10 rounded-full blur-sm group-hover:bg-accent/20 transition-colors duration-300"></div>
              <img 
                src="/icc2-logo.png" 
                alt="ICC2 Logo" 
                className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain drop-shadow-lg hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold">ICC Austin</span>
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
