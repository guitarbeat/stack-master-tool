import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, UserPlus, Loader2, DoorOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const NAME_MAX_LENGTH = 50;
const CODE_LENGTH = 6;

const nameSchema = z.string().min(1, 'Name is required').max(NAME_MAX_LENGTH, `Name must be ${NAME_MAX_LENGTH} characters or less`);
const roomCodeSchema = z.string().length(CODE_LENGTH, `Code must be ${CODE_LENGTH} characters`).regex(/^[a-zA-Z0-9]+$/, 'Code must be alphanumeric');

export default function EnterRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'watch' ? 'watch' : 'join';
  
  const { signInAnonymously, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // Real-time validation states
  const [nameError, setNameError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  // Real-time name validation
  const handleNameChange = (value: string) => {
    setDisplayName(value);
    if (value.length > NAME_MAX_LENGTH) {
      setNameError(`Name must be ${NAME_MAX_LENGTH} characters or less`);
    } else if (value.trim().length === 0 && value.length > 0) {
      setNameError('Name cannot be empty');
    } else {
      setNameError(null);
    }
  };

  // Real-time code validation
  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setRoomCode(upperValue);
    if (upperValue.length > 0 && upperValue.length !== CODE_LENGTH) {
      setCodeError(`Code must be ${CODE_LENGTH} characters`);
    } else if (upperValue.length === CODE_LENGTH && !/^[a-zA-Z0-9]+$/.test(upperValue)) {
      setCodeError('Code must be alphanumeric');
    } else {
      setCodeError(null);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameValidation = nameSchema.safeParse(displayName.trim());
    if (!nameValidation.success) {
      setNameError(nameValidation.error.errors[0].message);
      return;
    }

    const codeValidation = roomCodeSchema.safeParse(roomCode.trim());
    if (!codeValidation.success) {
      setCodeError(codeValidation.error.errors[0].message);
      return;
    }

    setIsJoining(true);
    const { error } = await signInAnonymously(displayName.trim());
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign in. Please try again.',
      });
      setIsJoining(false);
    } else {
      navigate(`/meeting?mode=join&code=${roomCode.trim()}&name=${encodeURIComponent(displayName.trim())}`);
    }
  };

  const handleWatch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const codeValidation = roomCodeSchema.safeParse(roomCode.trim());
    if (!codeValidation.success) {
      setCodeError(codeValidation.error.errors[0].message);
      return;
    }
    
    navigate(`/meeting?mode=watch&code=${roomCode.trim()}`);
  };

  const isJoinFormValid = displayName.trim().length > 0 && roomCode.trim().length === CODE_LENGTH && !nameError && !codeError;
  const isWatchFormValid = roomCode.trim().length === CODE_LENGTH && !codeError;

  return (
    <main className="min-h-[80vh] bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <DoorOpen className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Enter a Room</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Join an existing meeting or watch as a spectator
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="join" className="flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5" />
                Join
              </TabsTrigger>
              <TabsTrigger value="watch" className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Watch
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="join" className="mt-0">
              <form onSubmit={handleJoin} className="space-y-4">
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
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Join Meeting
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="watch" className="mt-0">
              <form onSubmit={handleWatch} className="space-y-4">
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
                
                <p className="text-xs text-center text-muted-foreground">
                  View the speaking queue without joining as a participant
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
