import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionCards } from '@/components/features/homepage/ActionCards'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogOut, Loader2, Eye, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import Confetti from '@/components/ui/Confetti'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const NAME_MAX_LENGTH = 50
const CODE_LENGTH = 6

const nameSchema = z.string().min(1, 'Name is required').max(NAME_MAX_LENGTH, `Name must be ${NAME_MAX_LENGTH} characters or less`)
const roomCodeSchema = z.string().length(CODE_LENGTH, `Code must be ${CODE_LENGTH} characters`).regex(/^[a-zA-Z0-9]+$/, 'Code must be alphanumeric')

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
  const [activeTab, setActiveTab] = useState('join')
  
  // Real-time validation states
  const [nameError, setNameError] = useState<string | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !showConfetti) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [user])

  // Real-time name validation
  const handleNameChange = (value: string) => {
    setDisplayName(value)
    if (value.length > NAME_MAX_LENGTH) {
      setNameError(`Name must be ${NAME_MAX_LENGTH} characters or less`)
    } else if (value.trim().length === 0 && value.length > 0) {
      setNameError('Name cannot be empty')
    } else {
      setNameError(null)
    }
  }

  // Real-time code validation
  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase()
    setRoomCode(upperValue)
    if (upperValue.length > 0 && upperValue.length !== CODE_LENGTH) {
      setCodeError(`Code must be ${CODE_LENGTH} characters`)
    } else if (upperValue.length === CODE_LENGTH && !/^[a-zA-Z0-9]+$/.test(upperValue)) {
      setCodeError('Code must be alphanumeric')
    } else {
      setCodeError(null)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const nameValidation = nameSchema.safeParse(displayName.trim())
    if (!nameValidation.success) {
      setNameError(nameValidation.error.errors[0].message)
      return
    }

    const codeValidation = roomCodeSchema.safeParse(roomCode.trim())
    if (!codeValidation.success) {
      setCodeError(codeValidation.error.errors[0].message)
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
      setCodeError(codeValidation.error.errors[0].message)
      return
    }
    navigate(`/meeting/${roomCode.trim()}?mode=spectator`)
  }

  const handleFacilitatorSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = nameSchema.safeParse(displayName.trim())
    if (!validation.success) {
      setNameError(validation.error.errors[0].message)
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
    } else {
      navigate('/facilitator')
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
        setNameError(null)
        setCodeError(null)
      }
    }, 300)
  }

  const getUserDisplayName = () => {
    return profile?.display_name || user?.user_metadata?.display_name || 'there'
  }

  const isJoinFormValid = displayName.trim().length > 0 && roomCode.trim().length === CODE_LENGTH && !nameError && !codeError
  const isWatchFormValid = roomCode.trim().length === CODE_LENGTH && !codeError
  const isFacilitatorFormValid = displayName.trim().length > 0 && !nameError

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
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="join" className="flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Join as</span> Participant
                      </TabsTrigger>
                      <TabsTrigger value="watch" className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Watch Only
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="join">
                      <form onSubmit={handleJoin} className="space-y-4 pt-4">
                        <div className="space-y-1.5">
                          <Input
                            type="text"
                            placeholder="Your name"
                            value={displayName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            disabled={isJoining || authLoading}
                            className={`h-12 text-base ${nameError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            aria-invalid={!!nameError}
                            aria-describedby={nameError ? 'name-error' : undefined}
                            maxLength={NAME_MAX_LENGTH + 5}
                            autoFocus
                          />
                          <div className="flex justify-between text-xs px-1">
                            {nameError ? (
                              <span id="name-error" className="text-destructive">{nameError}</span>
                            ) : (
                              <span className="text-muted-foreground">Required to join</span>
                            )}
                            <span className={`${displayName.length > NAME_MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {displayName.length}/{NAME_MAX_LENGTH}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Input
                            type="text"
                            placeholder="Meeting code (e.g. ABC123)"
                            value={roomCode}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            disabled={isJoining || authLoading}
                            className={`h-12 text-base font-mono tracking-wider ${codeError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            aria-invalid={!!codeError}
                            aria-describedby={codeError ? 'code-error' : undefined}
                            maxLength={CODE_LENGTH + 2}
                          />
                          <div className="flex justify-between text-xs px-1">
                            {codeError ? (
                              <span id="code-error" className="text-destructive">{codeError}</span>
                            ) : (
                              <span className="text-muted-foreground">6-character code from host</span>
                            )}
                            <span className={`font-mono ${roomCode.length !== CODE_LENGTH && roomCode.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {roomCode.length}/{CODE_LENGTH}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          type="submit"
                          disabled={isJoining || authLoading || !isJoinFormValid}
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
                    
                    <TabsContent value="watch">
                      <form onSubmit={(e) => { e.preventDefault(); handleSpectate(); }} className="space-y-4 pt-4">
                        <div className="space-y-1.5">
                          <Input
                            type="text"
                            placeholder="Meeting code (e.g. ABC123)"
                            value={roomCode}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            disabled={authLoading}
                            className={`h-12 text-base font-mono tracking-wider ${codeError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            aria-invalid={!!codeError}
                            aria-describedby={codeError ? 'watch-code-error' : undefined}
                            maxLength={CODE_LENGTH + 2}
                            autoFocus
                          />
                          <div className="flex justify-between text-xs px-1">
                            {codeError ? (
                              <span id="watch-code-error" className="text-destructive">{codeError}</span>
                            ) : (
                              <span className="text-muted-foreground">No sign-in required to watch</span>
                            )}
                            <span className={`font-mono ${roomCode.length !== CODE_LENGTH && roomCode.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {roomCode.length}/{CODE_LENGTH}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base"
                          disabled={!isWatchFormValid}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Watch Meeting
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or host a meeting
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleFacilitatorSignIn} className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      Enter your name to create and manage meetings
                    </p>
                    <div className="space-y-1.5">
                      <Input
                        type="text"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        disabled={isJoining || authLoading}
                        className={`h-12 text-base ${nameError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        maxLength={NAME_MAX_LENGTH + 5}
                      />
                      <div className="flex justify-between text-xs px-1">
                        <span className="text-muted-foreground">Will be shown as facilitator</span>
                        <span className={`${displayName.length > NAME_MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {displayName.length}/{NAME_MAX_LENGTH}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isJoining || authLoading || !isFacilitatorFormValid}
                      className="w-full h-12"
                    >
                      {isJoining ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Continue as Facilitator'
                      )}
                    </Button>
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