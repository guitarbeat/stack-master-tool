import { ActionCards } from '@/components/features/homepage/ActionCards'
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
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Stack Master Tool</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Democratic meeting facilitation with organized speaking queues
          </p>
        </div>

        <ActionCards />
      </div>
    </main>
  )
}

export default HomePage
