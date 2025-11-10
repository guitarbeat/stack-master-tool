import { useState } from 'react'
import { ActionCards } from '@/components/features/homepage/ActionCards'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogOut } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

const nameSchema = z.string().min(1, 'Name is required').max(50, 'Name is too long')

function HomePage() {
  const { user, signInAnonymously, signOut, loading: authLoading } = useAuth()
  const { profile } = useProfile()
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = nameSchema.safeParse(displayName.trim())
    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: 'Invalid name',
        description: validation.error.errors[0].message,
      })
      return
    }

    setIsJoining(true)
    const { error } = await signInAnonymously(displayName.trim())
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to join. Please try again.',
      })
      setIsJoining(false)
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out',
      })
    } else {
      setDisplayName('')
    }
  }

  const getUserDisplayName = () => {
    return profile?.display_name || user?.user_metadata?.display_name || 'there'
  }

  return (
    <main className="min-h-screen bg-background" role="main">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {!user ? (
            <div className="animate-fade-in">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Stack Master Tool
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                Democratic meeting facilitation with organized speaking queues.
              </p>
              
              <form onSubmit={handleJoin} className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isJoining || authLoading}
                    className="flex-1"
                    autoFocus
                  />
                  <Button 
                    type="submit" 
                    disabled={isJoining || authLoading || !displayName.trim()}
                  >
                    {isJoining ? 'Joining...' : 'Join'}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Welcome, {getUserDisplayName()}!
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
                Choose your role to participate in fair, structured discussions.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="mx-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>

        {user && (
          <div className="animate-scale-in">
            <ActionCards />
          </div>
        )}
      </div>
    </main>
  )
}

export default HomePage
