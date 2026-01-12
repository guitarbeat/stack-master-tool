import { useState, useRef, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InlineRoomBrowser } from "@/components/InlineRoomBrowser";
import Confetti from "@/components/ui/Confetti";
import { QrCodeScanner } from "@/components/ui/qr-code-scanner";
import { useAuth } from "@/hooks/useAuth";
import { SupabaseMeetingService } from "@/services/supabase";
import { useToast } from "@/hooks/use-toast";
import { nameSchema, roomCodeSchema, titleSchema } from "@/utils/schemas";
import { 
  Users, 
  Eye, 
  Plus, 
  Loader2, 
  QrCode, 
  ArrowRight,
  Sparkles,
  Hand
} from "lucide-react";

export default function HomePage() { 
  const navigate = useNavigate();
  const { user, signInAnonymously } = useAuth();
  const { toast } = useToast();

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [rememberName, setRememberName] = useState(true);
  
  // Error state
  const [nameError, setNameError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  
  // UI state
  const [isJoining, setIsJoining] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [codeComplete, setCodeComplete] = useState(false);

  // Refs
  const joinButtonRef = useRef<HTMLButtonElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Load saved name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("user_display_name");
    if (savedName) {
      setDisplayName(savedName);
    }
  }, []);

  // Handlers
  const handleNameChange = (value: string) => {
    setDisplayName(value);
    if (value.length > 0) {
      const result = nameSchema.safeParse(value);
      setNameError(result.success ? null : result.error.errors[0].message);
    } else {
      setNameError(null);
    }
  };

  const handleCodeChange = (value: string) => {
    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setRoomCode(normalized);
    
    if (normalized.length === 6) {
      const result = roomCodeSchema.safeParse(normalized);
      if (result.success) {
        setCodeError(null);
        setCodeComplete(true);
        setTimeout(() => joinButtonRef.current?.focus(), 100);
      } else {
        setCodeError(result.error.errors[0].message);
        setCodeComplete(false);
      }
    } else {
      setCodeError(null);
      setCodeComplete(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setMeetingTitle(value);
    if (value.length > 0) {
      const result = titleSchema.safeParse(value);
      setTitleError(result.success ? null : result.error.errors[0].message);
    } else {
      setTitleError(null);
    }
  };

  const handleQrScan = (data: string) => {
    const urlMatch = data.match(/[?&]code=([A-Za-z0-9]{6})/i);
    const watchMatch = data.match(/\/watch\/([A-Za-z0-9]{6})/i);
    const code = urlMatch?.[1] || watchMatch?.[1] || data;
    
    if (code && /^[A-Za-z0-9]{6}$/.test(code)) {
      handleCodeChange(code.toUpperCase());
      setShowQrScanner(false);
      toast({
        title: "Code scanned!",
        description: `Room code: ${code.toUpperCase()}`,
      });
    }
  };

  const saveName = () => {
    if (rememberName && displayName.trim()) {
      localStorage.setItem("user_display_name", displayName.trim());
    }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    
    const nameResult = nameSchema.safeParse(displayName);
    const codeResult = roomCodeSchema.safeParse(roomCode);
    
    if (!nameResult.success) {
      setNameError(nameResult.error.errors[0].message);
      return;
    }
    if (!codeResult.success) {
      setCodeError(codeResult.error.errors[0].message);
      return;
    }

    setIsJoining(true);

    try {
      if (!user) {
        await signInAnonymously();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      saveName();
      await SupabaseMeetingService.joinMeeting(roomCode, displayName.trim());

      toast({
        title: "Joined meeting",
        description: "You're now in the discussion",
      });

      navigate(`/meeting?code=${roomCode}&mode=join`);
    } catch (error) {
      toast({
        title: "Failed to join",
        description: error instanceof Error ? error.message : "Could not join meeting",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleWatch = async (e: FormEvent) => {
    e.preventDefault();
    
    const codeResult = roomCodeSchema.safeParse(roomCode);
    if (!codeResult.success) {
      setCodeError(codeResult.error.errors[0].message);
      return;
    }

    setIsWatching(true);
    navigate(`/watch/${roomCode}`);
    setIsWatching(false);
  };

  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault();
    
    const nameResult = nameSchema.safeParse(displayName);
    const titleResult = titleSchema.safeParse(meetingTitle);
    
    if (!nameResult.success) {
      setNameError(nameResult.error.errors[0].message);
      return;
    }
    if (!titleResult.success) {
      setTitleError(titleResult.error.errors[0].message);
      return;
    }

    setIsCreating(true);

    try {
      if (!user) {
        await signInAnonymously();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      saveName();

      const meeting = await SupabaseMeetingService.createMeeting(
        meetingTitle.trim(),
        displayName.trim(),
        user?.id
      );

      toast({
        title: "Room created!",
        description: `Your room code is ${meeting.code}`,
      });

      navigate(`/meeting?code=${meeting.code}&mode=host`);
    } catch (error) {
      toast({
        title: "Failed to create room",
        description: error instanceof Error ? error.message : "Could not create room",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const isJoinValid = displayName.length > 0 && !nameError && roomCode.length === 6 && !codeError;
  const isWatchValid = roomCode.length === 6 && !codeError;
  const isHostValid = displayName.length > 0 && !nameError && meetingTitle.length >= 3 && !titleError;

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-background via-background to-muted/20">
      {showConfetti && <Confetti />}
      
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Hand className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Speaking Queue
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Fair, orderly discussions for meetings of any size
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Your Identity */}
          <Card className="shadow-card border-border/50 overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </span>
                <div>
                  <CardTitle className="text-lg">Who are you?</CardTitle>
                  <CardDescription>Your name appears when you speak</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={50}
                  className={`text-base h-12 ${nameError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <div className="flex justify-between items-center text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberName}
                      onChange={(e) => setRememberName(e.target.checked)}
                      className="rounded border-border accent-primary"
                    />
                    Remember me
                  </label>
                  <span className={nameError ? "text-destructive" : "text-muted-foreground"}>
                    {nameError || `${displayName.length}/50`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Join or Watch */}
          <Card className="shadow-card border-border/50 overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </span>
                <div>
                  <CardTitle className="text-lg">Join a meeting</CardTitle>
                  <CardDescription>Enter a room code or scan QR</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    ref={codeInputRef}
                    id="code"
                    value={roomCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="ABCD12"
                    maxLength={6}
                    className={`font-mono text-center text-xl sm:text-2xl uppercase tracking-[0.3em] h-14 pr-10 ${
                      codeComplete && !codeError
                        ? "border-success bg-success/5 focus-visible:ring-success"
                        : codeError
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                  {codeComplete && !codeError && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowQrScanner(true)}
                  className="h-14 w-14 shrink-0"
                  title="Scan QR Code"
                >
                  <QrCode className="h-5 w-5" />
                </Button>
              </div>
              
              <p className={`text-sm text-center ${
                codeError ? "text-destructive" : 
                codeComplete ? "text-success font-medium" : 
                "text-muted-foreground"
              }`}>
                {codeError || (codeComplete ? "✓ Ready to join!" : "6-character room code")}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  ref={joinButtonRef}
                  onClick={handleJoin}
                  disabled={!isJoinValid || isJoining}
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                >
                  {isJoining ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Users className="mr-2 h-5 w-5" />
                  )}
                  {isJoining ? "Joining..." : "Join & Speak"}
                </Button>
                <Button
                  onClick={handleWatch}
                  disabled={!isWatchValid || isWatching}
                  variant="secondary"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                >
                  {isWatching ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-5 w-5" />
                  )}
                  {isWatching ? "Loading..." : "Watch Only"}
                </Button>
              </div>
              
              {!displayName && roomCode.length === 6 && (
                <p className="text-sm text-warning text-center bg-warning/10 py-2 px-3 rounded-lg">
                  ↑ Enter your name above to join as a participant
                </p>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Create a Room */}
          <Card className="shadow-card border-dashed border-2 border-border/50 overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <CardTitle className="text-lg">Or start your own</CardTitle>
                  <CardDescription>Create a meeting and invite others</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Meeting Title
                  </Label>
                  <Input
                    id="title"
                    value={meetingTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Team Standup, Board Meeting..."
                    maxLength={100}
                    className={`h-12 text-base ${titleError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {titleError && (
                    <p className="text-sm text-destructive">{titleError}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={!isHostValid || isCreating}
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  variant="default"
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-5 w-5" />
                  )}
                  {isCreating ? "Creating..." : "Create & Host"}
                </Button>
                
                {!displayName && meetingTitle.length > 0 && (
                  <p className="text-sm text-warning text-center bg-warning/10 py-2 px-3 rounded-lg">
                    ↑ Enter your name above to host this meeting
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Active Rooms Browser */}
          <div className="pt-2">
            <InlineRoomBrowser />
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <QrCodeScanner
          onScan={handleQrScan}
          onClose={() => setShowQrScanner(false)}
        />
      )}
    </div>
  );
}
