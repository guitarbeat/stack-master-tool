import { Hero } from '@/components/Hero'
import { ActionCards } from '@/components/ActionCards'
import { Features } from '@/components/Features'
import { HowItWorks } from '@/components/HowItWorks'
import { Testimonials } from '@/components/Testimonials'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

function HomePage() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Signed out',
        description: 'Successfully signed out',
      })
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden" role="main">
      {user && (
        <div className="border-b bg-background">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <Hero />
        <section aria-labelledby="action-cards-heading" className="mb-8 sm:mb-12">
          <h2 id="action-cards-heading" className="sr-only">Main Actions</h2>
          <ActionCards />
        </section>
        <section aria-labelledby="features-heading" className="mb-8 sm:mb-12">
          <h2 id="features-heading" className="sr-only">Platform Features</h2>
          <Features />
        </section>
        <section aria-labelledby="how-it-works-heading" className="mb-8 sm:mb-12">
          <h2 id="how-it-works-heading" className="sr-only">How It Works</h2>
          <HowItWorks />
        </section>
        <section aria-labelledby="testimonials-heading" className="mb-8 sm:mb-12">
          <h2 id="testimonials-heading" className="sr-only">Testimonials</h2>
          <Testimonials />
        </section>
      </div>
    </main>
  )
}

export default HomePage
