import { Link } from 'react-router-dom'
import { Users, MessageSquare, QrCode, Leaf, Sparkles, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

function HomePage() {
  const heroRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = cardsRef.current
      cards.forEach((card) => {
        if (!card) return
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        const rotateX = (y / rect.height) * -10
        const rotateY = (x / rect.width) * 10
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      })
    }

    const handleMouseLeave = (card) => {
      if (card) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    cardsRef.current.forEach(card => {
      if (card) {
        card.addEventListener('mouseleave', () => handleMouseLeave(card))
      }
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      cardsRef.current.forEach(card => {
        if (card) {
          card.removeEventListener('mouseleave', () => handleMouseLeave(card))
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-earthy-brown text-sage-green relative overflow-hidden">
      {/* Organic Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-moss-green/10 organic-blob"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-sage-green/8 organic-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-moss-green/5 organic-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center mb-24 relative">
          <div className="mb-8 inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-moss-green/20 blur-2xl organic-blob"></div>
              <div className="relative liquid-glass p-6 rounded-3xl inline-flex items-center justify-center">
                <Leaf className="w-12 h-12 text-moss-green mr-3" />
                <Users className="w-12 h-12 text-sage-green" />
                <Sparkles className="w-8 h-8 text-moss-green ml-3" />
              </div>
            </div>
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-7xl md:text-8xl font-bold hero-text leading-tight tracking-tight">
              Organic Stack
              <br />
              <span className="text-5xl md:text-6xl font-light">Facilitation</span>
            </h1>
            
            <div className="w-32 h-1.5 bg-gradient-to-r from-moss-green via-sage-green to-moss-green mx-auto rounded-full opacity-60"></div>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Nurture inclusive conversations that grow naturally.
              <br />
              <span className="text-moss-green font-medium">Democratic • Sustainable • Human-centered</span>
            </p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-24">
          {/* Create Meeting */}
          <div
            ref={(el) => (cardsRef.current[0] = el)}
            className="tilt-card group"
          >
            <Link 
              to="/create"
              className="block h-full"
            >
              <div className="liquid-glass rounded-3xl p-10 h-full transition-all duration-500 group-hover:scale-[1.02] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 organic-blob opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="liquid-glass p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
                      <MessageSquare className="w-10 h-10 text-moss-green" />
                    </div>
                    <h2 className="text-3xl font-bold gradient-text mb-4">Cultivate Meeting</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Plant the seed for meaningful dialogue. Generate a shareable space where voices can flourish.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="liquid-glass px-6 py-3 rounded-2xl text-moss-green font-semibold flex items-center">
                      Start Growing
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-4xl opacity-20">🌱</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Join Meeting */}
          <div
            ref={(el) => (cardsRef.current[1] = el)}
            className="tilt-card group"
          >
            <Link 
              to="/join"
              className="block h-full"
            >
              <div className="liquid-glass rounded-3xl p-10 h-full transition-all duration-500 group-hover:scale-[1.02] relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-accent/10 organic-blob opacity-50" style={{ animationDelay: '1s' }}></div>
                
                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="liquid-glass p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
                      <QrCode className="w-10 h-10 text-accent" />
                    </div>
                    <h2 className="text-3xl font-bold gradient-text mb-4">Join the Grove</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Connect with an existing circle. Enter a meeting code and add your voice to the collective wisdom.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="liquid-glass px-6 py-3 rounded-2xl text-accent font-semibold flex items-center">
                      Enter Circle
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-4xl opacity-20">🌿</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* How it Works */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">How It Grows</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Like nature, great conversations need the right conditions to flourish
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "Plant",
                icon: "🌱",
                title: "Seed the Space",
                description: "A facilitator creates the meeting environment. Participants join with a simple code - no accounts, just authentic presence."
              },
              {
                step: "Grow",
                icon: "🌿", 
                title: "Nurture Names",
                description: "Everyone enters their name to join the circle. No barriers, no complexity - just human connection in its simplest form."
              },
              {
                step: "Bloom",
                icon: "🌳",
                title: "Flourish Together",
                description: "Voices queue naturally like branches reaching for light. Direct responses and interventions keep the dialogue healthy and balanced."
              }
            ].map((item, index) => (
              <div
                key={index}
                ref={(el) => (cardsRef.current[index + 2] = el)}
                className="tilt-card text-center group"
              >
                <div className="liquid-glass rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  
                  <div className="liquid-glass w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-6">
                    {index + 1}
                  </div>
                  
                  <h3 className="text-2xl font-bold gradient-text mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-24">
          <div className="liquid-glass rounded-3xl p-12 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold gradient-text mb-6">Ready to Grow?</h3>
            <p className="text-xl text-muted-foreground mb-8">
              Start cultivating more meaningful conversations today
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                to="/create" 
                className="liquid-glass px-8 py-4 rounded-2xl text-primary font-semibold hover:scale-105 transition-all duration-300 flex items-center"
              >
                Plant a Meeting
                <Leaf className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="/manual" 
                className="liquid-glass px-8 py-4 rounded-2xl text-accent font-semibold hover:scale-105 transition-all duration-300 flex items-center"
              >
                Manual Mode
                <Users className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage