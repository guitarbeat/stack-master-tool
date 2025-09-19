export const Hero = () => (
  <div className="text-center mb-8 sm:mb-16 relative px-4">
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Main Headline */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
          Stack Facilitation
        </h1>
      </div>

      {/* Description */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
          A tool for facilitating democratic discussions with organized speaking queues 
          and fair turn-taking.
        </p>
      </div>
    </div>
  </div>
)

export default Hero
