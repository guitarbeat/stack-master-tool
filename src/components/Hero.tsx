import { Leaf, Users, Sparkles, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Hero = () => (
  <div className="text-center mb-16 sm:mb-20 lg:mb-24 relative px-4">
    {/* Enhanced Icon Section */}
    <div className="mb-8 sm:mb-10 inline-block">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl organic-blob animate-pulse"></div>
        <div className="relative liquid-glass p-6 sm:p-8 rounded-3xl sm:rounded-4xl inline-flex items-center justify-center hover-scale">
          <Leaf className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 text-primary mr-3 sm:mr-4 animate-pulse" />
          <Users className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 text-accent" />
          <Sparkles className="w-7 sm:w-8 lg:w-10 h-7 sm:h-8 lg:h-10 text-primary ml-3 sm:ml-4 animate-bounce" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>

    {/* Enhanced Typography */}
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold hero-text leading-[0.9] tracking-tight">
        Organic Stack
        <br />
        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
          Facilitation
        </span>
      </h1>

      {/* Enhanced Divider */}
      <div className="flex justify-center">
        <div className="w-32 sm:w-40 h-1.5 sm:h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-70 animate-pulse"></div>
      </div>

      {/* Enhanced Description */}
      <div className="space-y-4">
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
          Nurture <span className="text-primary font-medium">inclusive conversations</span> that grow naturally.
        </p>
        <p className="text-base sm:text-lg md:text-xl text-primary font-medium">
          Democratic • Sustainable • Human-centered
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8">
        <Button 
          size="lg" 
          className="px-8 py-4 text-lg font-semibold hover-scale bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Start Facilitating
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="px-8 py-4 text-lg font-semibold hover-scale border-2 hover:bg-muted/50 transition-all duration-300"
        >
          Learn More
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="pt-8 sm:pt-12 animate-bounce">
        <ArrowDown className="w-6 h-6 mx-auto text-muted-foreground opacity-60" />
      </div>
    </div>
  </div>
)

export default Hero
