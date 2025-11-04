import { ActionCards } from '@/components/features/homepage/ActionCards'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void handleSignOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Stack Master Tool
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Democratic meeting facilitation with organized speaking queues. 
            Choose your role to participate in fair, structured discussions.
          </p>
        </div>

        <ActionCards />
      </div>
    </main>
  )
}

export default HomePage
