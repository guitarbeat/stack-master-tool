import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionCards } from '@/components/features/homepage/ActionCards'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogOut, Loader2, User, ChevronsRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import Confetti from '@/components/ui/Confetti'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const nameSchema = z.string().min(1, 'Name is required').max(50, 'Name is too long')
const roomCodeSchema = z.string().regex(/^[a-zA-Z0-9]{6}$/, 'Invalid meeting code')

function HomePage() {
  const { user, signInAnonymously, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (user && !showConfetti) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [user])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const nameValidation = nameSchema.safeParse(displayName.trim())
    if (!nameValidation.success) {
      toast({
        variant: 'destructive',
        title: 'Invalid name',
        description: nameValidation.error.errors[0].message,
      })
      return
    }

    const codeValidation = roomCodeSchema.safeParse(roomCode.trim())
    if (!codeValidation.success) {
      toast({
        variant: 'destructive',
        title: 'Invalid meeting code',
        description: 'Please enter a valid 6-character code.',
      })
      return
    }

    setIsJoining(true)
    const { error } = await signInAnonymously(displayName.trim())
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign in. Please try again.',
      })
      setIsJoining(false)
    } else {
      navigate(`/meeting/${roomCode.trim()}?mode=participant`)
    }
  }

  const handleSpectate = () => {
    const codeValidation = roomCodeSchema.safeParse(roomCode.trim())
    if (!codeValidation.success) {
      toast({
        variant: 'destructive',
        title: 'Invalid meeting code',
        description: 'Please enter a valid 6-character code.',
      })
      return
    }
    navigate(`/meeting/${roomCode.trim()}?mode=spectator`)
  }

  const handleSignIn = async (e: React.FormEvent) => {
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
    setIsSigningOut(true)
    setTimeout(async () => {
      const { error } = await signOut()
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',

          description: 'Failed to sign out',
        })
        setIsSigningOut(false)
      } else {
        setDisplayName('')
        setRoomCode('')
      }
    }, 300)
  }

  const getUserDisplayName = () => {
    return profile?.display_name || user?.user_metadata?.display_name || 'there'
  }

  return (
    <main className="min-h-screen bg-background" role="main">
      {showConfetti && <Confetti />}
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {!user ? (
            <div className={isSigningOut ? "animate-fade-out" : "animate-fade-in"}>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
                Speaking Queue
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                Fair, structured discussions for any meeting.
              </p>
              
              <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Get Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="join" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="join">Join</TabsTrigger>
                      <TabsTrigger value="spectate">Spectate</TabsTrigger>
                    </TabsList>
                    <TabsContent value="join">
                      <form onSubmit={handleJoin} className="space-y-4 pt-4">
                        <Input
                          type="text"
                          placeholder="Enter your name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          disabled={isJoining || authLoading}
                          className="flex-1 h-12 text-base"
                          autoFocus
                        />
                        <Input
                          type="text"
                          placeholder="Meeting code"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          disabled={isJoining || authLoading}
                          className="flex-1 h-12 text-base"
                        />
                        <Button
                          type="submit"
                          disabled={isJoining || authLoading || !displayName.trim() || !roomCode.trim()}
                          className="w-full h-12 text-base"
                        >
                          {isJoining ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Joining...
                            </>
                          ) : (
                            'Join Meeting'
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="spectate">
                      <form onSubmit={(e) => { e.preventDefault(); handleSpectate(); }} className="space-y-4 pt-4">
                        <Input
                          type="text"
                          placeholder="Meeting code"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          disabled={authLoading}
                          className="flex-1 h-12 text-base"
                          autoFocus
                        />
                        <Button type="submit" className="w-full h-12 text-base">
                          Watch Meeting
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground flex-1">
                        Are you a facilitator?
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="Enter your name to sign in"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={isJoining || authLoading}
                        className="flex-1 h-12 text-base"
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        disabled={isJoining || authLoading || !displayName.trim()}
                        className="h-12"
                      >
                        {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronsRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className={isSigningOut ? "animate-fade-out" : "animate-fade-in"}>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
                Welcome, {getUserDisplayName()}!
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
                Ready to start?
              </p>
              <Button
                variant="ghost"
                size="lg"
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
