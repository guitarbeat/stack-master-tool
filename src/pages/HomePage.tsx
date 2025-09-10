
import { Hero } from '@/components/Hero'
import { ActionCards } from '@/components/ActionCards'
import { HowItWorks } from '@/components/HowItWorks'
import { CallToAction } from '@/components/CallToAction'


function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Primary organic shapes */}
        <div className="absolute top-10 sm:top-20 left-2 sm:left-10 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-primary/10 organic-blob animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-2 sm:right-10 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-accent/8 organic-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary/5 organic-blob" style={{ animationDelay: '4s' }}></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 right-1/4 w-20 sm:w-32 h-20 sm:h-32 bg-accent/6 organic-blob" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/5 w-24 sm:w-40 h-24 sm:h-40 bg-primary/8 organic-blob" style={{ animationDelay: '3s' }}></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/30 to-transparent"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 p-4 sm:p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent"></div>
            <span className="text-lg font-semibold">Organic Stack</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <Hero />
        
        {/* Features Badge */}
        <div className="text-center mb-12 sm:mb-16" id="features">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-8">
            ✨ Trusted by facilitators worldwide
          </div>
        </div>
        
        <ActionCards />
        
        <div id="how-it-works">
          <HowItWorks />
        </div>
        
        {/* Stats Section */}
        <div className="my-16 sm:my-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Meetings Facilitated</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground">Participants Engaged</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
        
        <CallToAction />
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Organic Stack Facilitation. Built with care for inclusive conversations.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
