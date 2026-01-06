import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { SupabaseMeetingService } from '@/services/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogOut, Loader2, Eye, UserPlus, Plus, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import Confetti from '@/components/ui/Confetti'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { logProduction } from '@/utils/productionLogger'

const NAME_MAX_LENGTH = 50
const CODE_LENGTH = 6

const nameSchema = z.string().min(1, 'Name is required').max(NAME_MAX_LENGTH, `Name must be ${NAME_MAX_LENGTH} characters or less`)
const roomCodeSchema = z.string().length(CODE_LENGTH, `Code must be ${CODE_LENGTH} characters`).regex(/^[a-zA-Z0-9]+$/, 'Code must be alphanumeric')
const titleSchema = z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be 100 characters or less')

function HomePage() {
  const { user, signInAnonymously, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { toast, showToast } = useToast()
  const [displayName, setDisplayName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [activeTab, setActiveTab] = useState('join')
  
  // Real-time validation states
  const [nameError, setNameError] = useState<string | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)

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

  // Real-time title validation
  const handleTitleChange = (value: string) => {
    setMeetingTitle(value)
    if (value.length > 0 && value.length < 3) {
      setTitleError('Title must be at least 3 characters')
    } else if (value.length > 100) {
      setTitleError('Title must be 100 characters or less')
    } else {
      setTitleError(null)
    }
  }

  const handleJoin = async (e: FormEvent) => {
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
      navigate(`/meeting?mode=join&code=${roomCode.trim()}&name=${encodeURIComponent(displayName.trim())}`)
    }
  }

  const handleSpectate = () => {
    const codeValidation = roomCodeSchema.safeParse(roomCode.trim())
    if (!codeValidation.success) {
      setCodeError(codeValidation.error.errors[0].message)
      return
    }
    navigate(`/meeting?mode=watch&code=${roomCode.trim()}`)
  }

  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault()

    const nameValidation = nameSchema.safeParse(displayName.trim())
    if (!nameValidation.success) {
      setNameError(nameValidation.error.errors[0].message)
      return
    }

    const titleValidation = titleSchema.safeParse(meetingTitle.trim())
    if (!titleValidation.success) {
      setTitleError(titleValidation.error.errors[0].message)
      return
    }

    setIsCreating(true)
    
    // Sign in first if not already
    if (!user) {
      const { error } = await signInAnonymously(displayName.trim())
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to sign in. Please try again.',
        })
        setIsCreating(false)
        return
      }
    }

    try {
      const created = await SupabaseMeetingService.createMeeting(
        meetingTitle.trim(),
        displayName.trim(),
        user?.id
      )

      showToast({
        type: 'success',
        title: 'Room Created!',
        message: `Meeting "${created.title}" is live with code ${created.code}`
      })

      navigate(`/meeting?mode=host&code=${created.code}`)
    } catch (error) {
      logProduction('error', {
        action: 'create_room_homepage',
        error: error instanceof Error ? error.message : String(error)
      })
      
      toast({
        variant: 'destructive',
        title: 'Failed to create room',
        description: 'Please try again.',
      })
    } finally {
      setIsCreating(false)
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
        setMeetingTitle('')
        setNameError(null)
        setCodeError(null)
        setTitleError(null)
      }
    }, 300)
  }

  const getUserDisplayName = () => {
    return profile?.display_name || user?.user_metadata?.display_name || 'there'
  }

  const isJoinFormValid = displayName.trim().length > 0 && roomCode.trim().length === CODE_LENGTH && !nameError && !codeError
  const isWatchFormValid = roomCode.trim().length === CODE_LENGTH && !codeError
  const isHostFormValid = displayName.trim().length > 0 && meetingTitle.trim().length >= 3 && !nameError && !titleError

  return (
    <main className="min-h-screen bg-background" role="main">
      {showConfetti && <Confetti />}
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className={isSigningOut ? "animate-fade-out" : "animate-fade-in"}>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
              Speaking Queue
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-2">
              Fair, structured discussions for any meeting.
            </p>
            {user && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Welcome back, {getUserDisplayName()}!</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-7 px-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Action Card - All flows in one place */}
        <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl sm:text-2xl text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Join, watch, or host a meeting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="join" className="text-xs sm:text-sm">
                  <UserPlus className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                  Join
                </TabsTrigger>
                <TabsTrigger value="watch" className="text-xs sm:text-sm">
                  <Eye className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                  Watch
                </TabsTrigger>
                <TabsTrigger value="host" className="text-xs sm:text-sm">
                  <Plus className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                  Host
                </TabsTrigger>
              </TabsList>
              
              {/* JOIN TAB */}
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
                      maxLength={NAME_MAX_LENGTH + 5}
                      autoFocus
                    />
                    <div className="flex justify-between text-xs px-1">
                      {nameError ? (
                        <span className="text-destructive">{nameError}</span>
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
                      maxLength={CODE_LENGTH + 2}
                    />
                    <div className="flex justify-between text-xs px-1">
                      {codeError ? (
                        <span className="text-destructive">{codeError}</span>
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
              
              {/* WATCH TAB */}
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
                      maxLength={CODE_LENGTH + 2}
                      autoFocus
                    />
                    <div className="flex justify-between text-xs px-1">
                      {codeError ? (
                        <span className="text-destructive">{codeError}</span>
                      ) : (
                        <span className="text-muted-foreground">No sign-in required</span>
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
                  
                  <p className="text-xs text-center text-muted-foreground">
                    View the queue without joining as participant
                  </p>
                </form>
              </TabsContent>

              {/* HOST TAB - Direct room creation */}
              <TabsContent value="host">
                <form onSubmit={handleCreateRoom} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Input
                      type="text"
                      placeholder="Your name (facilitator)"
                      value={displayName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      disabled={isCreating || authLoading}
                      className={`h-12 text-base ${nameError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      aria-invalid={!!nameError}
                      maxLength={NAME_MAX_LENGTH + 5}
                      autoFocus
                    />
                    <div className="flex justify-between text-xs px-1">
                      {nameError ? (
                        <span className="text-destructive">{nameError}</span>
                      ) : (
                        <span className="text-muted-foreground">Shown as facilitator</span>
                      )}
                      <span className={`${displayName.length > NAME_MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {displayName.length}/{NAME_MAX_LENGTH}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Input
                      type="text"
                      placeholder="Meeting title"
                      value={meetingTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      disabled={isCreating || authLoading}
                      className={`h-12 text-base ${titleError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      aria-invalid={!!titleError}
                      maxLength={105}
                    />
                    <div className="flex justify-between text-xs px-1">
                      {titleError ? (
                        <span className="text-destructive">{titleError}</span>
                      ) : (
                        <span className="text-muted-foreground">e.g. "Team Standup" or "Board Meeting"</span>
                      )}
                      <span className={`${meetingTitle.length > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {meetingTitle.length}/100
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isCreating || authLoading || !isHostFormValid}
                    className="w-full h-12 text-base"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create & Start
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    A unique code will be generated for participants
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default HomePage
