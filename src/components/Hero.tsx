import { Leaf, Users, Sparkles } from 'lucide-react'

export const Hero = () => (
  <div className="text-center mb-8 sm:mb-12 relative px-4">
    <div className="mb-4 sm:mb-6 inline-block">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl organic-blob"></div>
        <div className="relative liquid-glass p-4 sm:p-6 rounded-2xl sm:rounded-3xl inline-flex items-center justify-center gap-3">
          {/* ICC Logos */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm group-hover:bg-primary/20 transition-colors duration-300"></div>
              <img 
                src="/icc-removebg-preview.png" 
                alt="ICC Austin primary logo" 
                className="relative w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-lg hover:scale-110 transition-all duration-300 dark:brightness-110"
              />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-semibold">ICC Austin</span>
        </div>
      </div>
    </div>

    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold hero-text leading-tight tracking-tight">
        Organic Stack
        <br />
        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light">Facilitation</span>
      </h1>

      <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-primary via-accent to-primary mx-auto rounded-full opacity-60"></div>

      <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
        Nurture inclusive conversations that grow naturally.
        <br />
        <span className="text-primary font-medium">Democratic • Sustainable • Human-centered</span>
      </p>
    </div>
  </div>
)

export default Hero
