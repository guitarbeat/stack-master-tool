import { useState } from 'react'
import { ActionCards } from '@/components/features/homepage/ActionCards'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

function HomePage() {
  const { user, signInAnonymously } = useAuth()
  const { profile } = useProfile()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await signInAnonymously(name.trim())
      if (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to save your name',
        })
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayName = profile?.display_name || user?.user_metadata?.display_name

  return (
    <main className="min-h-screen bg-background" role="main">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {!user ? (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Stack Master Tool
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                Democratic meeting facilitation with organized speaking queues.
              </p>
              
              <div className="max-w-md mx-auto">
                <form onSubmit={handleNameSubmit} className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1"
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <Button type="submit" disabled={!name.trim() || isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Continue'}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Welcome {displayName}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Choose your role to participate in fair, structured discussions.
              </p>
            </>
          )}
        </div>

        {user && <ActionCards />}
      </div>
    </main>
  )
}

export default HomePage
