import { useState, useRef, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  Check,
  User
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
        title: "Code scanned",
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
        title: "Room created",
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
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-background to-muted/30">
      {showConfetti && <Confetti />}
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Speaking Queue
          </h1>
          <p className="text-muted-foreground">
            Manage discussions with fair, orderly participation
          </p>
        </div>

        <div className="space-y-6">
          {/* Shared Name Input */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-primary" />
                  Your Name
                </Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  className={nameError ? "border-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberName}
                      onChange={(e) => setRememberName(e.target.checked)}
                      className="rounded border-muted-foreground/50"
                    />
                    Remember me
                  </label>
                  <span className={`text-xs ${nameError ? "text-destructive" : "text-muted-foreground"}`}>
                    {nameError || `${displayName.length}/50`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Unified Code Entry */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <Label htmlFor="code" className="text-base">Room Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={roomCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="ABCD12"
                    maxLength={6}
                    className={`font-mono text-center text-lg uppercase tracking-widest ${
                      codeComplete && !codeError
                        ? "border-green-500 bg-green-500/5"
                        : codeError
                        ? "border-destructive"
                        : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowQrScanner(true)}
                    title="Scan QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
                <p className={`text-xs ${codeError ? "text-destructive" : codeComplete ? "text-green-600" : "text-muted-foreground"}`}>
                  {codeError || (codeComplete ? "Ready! Choose an action below" : "Enter a 6-character room code")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  ref={joinButtonRef}
                  onClick={handleJoin}
                  disabled={!isJoinValid || isJoining}
                  className="w-full"
                >
                  {isJoining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  {isJoining ? "Joining..." : "Join"}
                </Button>
                <Button
                  onClick={handleWatch}
                  disabled={!isWatchValid || isWatching}
                  variant="secondary"
                  className="w-full"
                >
                  {isWatching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {isWatching ? "Loading..." : "Watch"}
                </Button>
              </div>
              
              {!displayName && roomCode.length === 6 && (
                <p className="text-xs text-amber-600 text-center">
                  Enter your name above to join as a participant
                </p>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Quick Host */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  <span className="font-medium">Host a New Meeting</span>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={meetingTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Meeting title..."
                    maxLength={100}
                    className={titleError ? "border-destructive" : ""}
                  />
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!isHostValid || isCreating}
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {titleError && (
                  <p className="text-xs text-destructive">{titleError}</p>
                )}
                {!displayName && meetingTitle.length > 0 && (
                  <p className="text-xs text-amber-600">
                    Enter your name above to host
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Active Rooms */}
          <InlineRoomBrowser />
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
