import { Star, Quote, Users, Heart, Globe } from 'lucide-react'
import useTiltEffect from '@/hooks/use-tilt'

export const Testimonials = () => {
  const cardsRef = useTiltEffect()

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Community Facilitator",
      organization: "Austin Community Center",
      content: "Organic Stack has transformed how we conduct community meetings. The democratic process ensures every voice is heard, and the organic flow feels so much more natural than traditional facilitation methods.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Non-profit Director",
      organization: "Sustainable Futures",
      content: "The platform's human-centered design makes complex discussions feel manageable. Our team meetings are now more inclusive and productive than ever before.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Dr. Aisha Patel",
      role: "Research Coordinator",
      organization: "University of Texas",
      content: "As someone who studies group dynamics, I'm impressed by how Organic Stack creates genuine democratic participation. It's not just a tool—it's a philosophy of inclusive communication.",
      rating: 5,
      avatar: "AP"
    }
  ]

  const stats = [
    { icon: <Users className="w-5 h-5 text-primary" />, value: "500+", label: "Active Facilitators" },
    { icon: <Heart className="w-5 h-5 text-accent" />, value: "10K+", label: "Meetings Facilitated" },
    { icon: <Globe className="w-5 h-5 text-primary" />, value: "25+", label: "Countries Served" }
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
          Trusted by
          <span className="text-primary"> Facilitators Worldwide</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
          Join a growing community of facilitators who have discovered the power of organic conversation
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
            Ready to Join Our Community?
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Experience the difference that organic facilitation can make in your meetings and conversations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-primary" />
              <span>500+ Active Users</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-accent" />
              <span>Trusted Worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Testimonials