export const Hero = () => (
  <div className="text-center mb-8 sm:mb-16 relative px-4">
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Main Headline */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
          Stack Facilitation
        </h1>
        <div className="text-lg sm:text-xl text-primary font-semibold">
          Three Ways to Participate
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
          A tool for facilitating democratic discussions with organized speaking queues 
          and fair turn-taking. Inspired by jparty.tv's approach, our platform offers 
          three distinct modes: <strong>HOST</strong> for facilitators, <strong>JOIN</strong> for participants, 
          and <strong>WATCH</strong> for observers.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <span className="font-semibold text-primary">HOST</span>
            <span className="text-muted-foreground">Facilitate & Control</span>
          </div>
          <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
            <span className="font-semibold text-accent">JOIN</span>
            <span className="text-muted-foreground">Participate & Speak</span>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <span className="font-semibold text-primary">WATCH</span>
            <span className="text-muted-foreground">Observe & Display</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default Hero
