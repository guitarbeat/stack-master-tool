import { Star, Quote, Users, Heart, Globe } from 'lucide-react'
import useTiltEffect from '@/hooks/use-tilt'

export const Testimonials = () => {
  const cardsRef = useTiltEffect()

  const testimonials = [
    {
      name: "Community Feedback",
      role: "User Experience",
      organization: "Open Source Community",
      content: "This tool helps create more inclusive and organized discussions by ensuring everyone has a fair chance to speak.",
      rating: 4,
      avatar: "CF"
    },
    {
      name: "Facilitator Insights",
      role: "Meeting Management",
      organization: "Democratic Process",
      content: "The speaking queue system makes it easier to manage turn-taking and maintain order in group discussions.",
      rating: 4,
      avatar: "FI"
    },
    {
      name: "User Research",
      role: "Accessibility Focus",
      organization: "Inclusive Design",
      content: "The platform's design prioritizes equal participation and helps create more structured, productive conversations.",
      rating: 4,
      avatar: "UR"
    }
  ]

  const stats = [
    { icon: <Users className="w-5 h-5 text-primary" />, value: "Open", label: "Source Project" },
    { icon: <Heart className="w-5 h-5 text-accent" />, value: "Free", label: "To Use" },
    { icon: <Globe className="w-5 h-5 text-primary" />, value: "MIT", label: "License" }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base mb-4">
          <Quote className="w-4 h-4" />
          <span>Community Voices</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-4">
          Community
          <span className="text-primary"> Feedback</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
          Feedback from users about the tool's effectiveness in facilitating democratic discussions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="liquid-glass rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-center mb-2">
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} ref={(el) => (cardsRef.current[index] = el)} className="tilt-card group">
            <div className="liquid-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full transition-all duration-500 group-hover:scale-105 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 organic-blob opacity-50"></div>
              
              <div className="relative z-10 space-y-4">
                {/* Quote Icon */}
                <div className="flex items-center justify-between">
                  <Quote className="w-6 h-6 text-primary/60" />
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <blockquote className="text-muted-foreground text-sm sm:text-base leading-relaxed italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm sm:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-primary/80">
                      {testimonial.organization}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12 sm:mt-16">
        <div className="liquid-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-3">
            Try the Tool
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Create a meeting or use the manual stack keeper to facilitate democratic discussions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>Open Source</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-primary" />
              <span>Free to Use</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-accent" />
              <span>MIT Licensed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Testimonials