import { ActionCards } from '@/components/features/homepage/ActionCards'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut, Users, QrCode, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

function HomePage() {
  const { user, signOut } = useAuth()
  const { showToast } = useToast()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to sign out',
      })
    } else {
      showToast({
        type: 'success',
        title: 'Signed out',
        message: 'Successfully signed out',
      })
    }
  }

  return (
    <main className="min-h-screen bg-background" role="main">
      {user && (
        <div className="border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* * Consolidated Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Stack Master Tool
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Democratic meeting facilitation with organized speaking queues. 
            Choose your role to participate in fair, structured discussions.
          </p>
          
          {/* * Mode Overview - Simplified */}
          <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base mb-12">
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">HOST</span>
              <span className="text-muted-foreground">Facilitate & Control</span>
            </div>
            <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
              <QrCode className="w-4 h-4 text-accent" />
              <span className="font-semibold text-accent">JOIN</span>
              <span className="text-muted-foreground">Participate & Speak</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Eye className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">WATCH</span>
              <span className="text-muted-foreground">Observe & Display</span>
            </div>
          </div>
        </div>

        <ActionCards />
      </div>
    </main>
  )
}

export default HomePage
