import { Leaf, Users, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

export const Hero = () => (
  <div className="text-center mb-8 sm:mb-16 relative px-4">
    {/* Enhanced Logo Section */}
    <div className="mb-6 sm:mb-8 inline-block">
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/20 blur-3xl organic-blob group-hover:bg-primary/30 transition-all duration-500"></div>
        <div className="relative liquid-glass p-5 sm:p-7 rounded-3xl sm:rounded-[2rem] inline-flex items-center justify-center gap-4 shadow-elegant group-hover:shadow-glow transition-all duration-500">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative group/logo">
              <div className="absolute inset-0 bg-primary/15 rounded-full blur-md group-hover/logo:bg-primary/25 transition-all duration-300"></div>
              <img 
                src="/icc-removebg-preview.png" 
                alt="ICC Austin primary logo" 
                className="relative w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-lg group-hover/logo:scale-110 transition-all duration-300 dark:brightness-110"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xl sm:text-2xl font-bold gradient-text">ICC Austin</span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Stack Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Main Headline */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold hero-text leading-tight tracking-tight">
          Organic Stack
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Facilitation
          </span>
        </h1>

        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-60"></div>
          <div className="flex items-center gap-1 text-primary">
            <Leaf className="w-4 h-4" />
            <span className="text-sm font-medium">Natural Growth</span>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Enhanced Description */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
          A tool for facilitating democratic discussions with organized speaking queues 
          and fair turn-taking.
        </p>
        
        {/* Key Features */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base">
          <div className="flex items-center gap-2 text-primary font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Speaking Queue</span>
          </div>
          <div className="flex items-center gap-2 text-accent font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Real-time Sync</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Fair Turn-taking</span>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="pt-4">
        <div className="inline-flex items-center gap-2 text-primary font-semibold group cursor-pointer hover:gap-3 transition-all duration-300">
          <span>Start Your Journey</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  </div>
)

export default Hero
