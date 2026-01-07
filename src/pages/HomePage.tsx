import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { 
  Users, 
  Eye, 
  Plus, 
  Loader2, 
  QrCode, 
  Check,
  ArrowRight
} from "lucide-react";

// Validation schemas
const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must be 50 characters or less")
  .regex(/^[a-zA-Z0-9\s\-']+$/, "Only letters, numbers, spaces, hyphens, and apostrophes");

const roomCodeSchema = z
  .string()
  .length(6, "Room code must be 6 characters")
  .regex(/^[A-Za-z0-9]+$/, "Only letters and numbers");

const titleSchema = z
  .string()
  .min(3, "Title must be at least 3 characters")
  .max(100, "Title must be 100 characters or less");

export default function HomePage() {
  const navigate = useNavigate();
  const { user, signInAnonymously } = useAuth();
  const { toast } = useToast();

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  
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
  const joinSubmitRef = useRef<HTMLButtonElement>(null);
  const watchSubmitRef = useRef<HTMLButtonElement>(null);

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

  const handleCodeChange = (value: string, targetRef?: React.RefObject<HTMLButtonElement | null>) => {
    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setRoomCode(normalized);
    
    if (normalized.length === 6) {
      const result = roomCodeSchema.safeParse(normalized);
      if (result.success) {
        setCodeError(null);
        setCodeComplete(true);
        // Auto-focus submit button
        setTimeout(() => targetRef?.current?.focus(), 100);
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
    // Extract code from URL or use directly
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

  const handleJoin = async (e: React.FormEvent) => {
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

      localStorage.setItem("user_display_name", displayName.trim());
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

  const handleWatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const codeResult = roomCodeSchema.safeParse(roomCode);
    if (!codeResult.success) {
      setCodeError(codeResult.error.errors[0].message);
      return;
    }

    setIsWatching(true);

    try {
      navigate(`/watch/${roomCode}`);
    } finally {
      setIsWatching(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
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

      localStorage.setItem("user_display_name", displayName.trim());

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
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Speaking Queue
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage discussions with fair, orderly participation
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Join Card */}
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Join Discussion
              </CardTitle>
              <CardDescription>
                Enter a room code to participate in the conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-name">Your Name</Label>
                  <Input
                    id="join-name"
                    value={displayName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={50}
                    className={nameError ? "border-destructive" : ""}
                  />
                  <div className="flex justify-between text-xs">
                    <span className={nameError ? "text-destructive" : "text-muted-foreground"}>
                      {nameError || ""}
                    </span>
                    <span className="text-muted-foreground">{displayName.length}/50</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="join-code">Room Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="join-code"
                      value={roomCode}
                      onChange={(e) => handleCodeChange(e.target.value, joinSubmitRef)}
                      placeholder="ABCD12"
                      maxLength={6}
                      className={`font-mono uppercase ${
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
                  <div className="flex justify-between text-xs">
                    <span className={codeError ? "text-destructive" : codeComplete ? "text-green-600" : "text-muted-foreground"}>
                      {codeError || (codeComplete ? "Press Enter to join" : "")}
                    </span>
                    <span className="text-muted-foreground">{roomCode.length}/6</span>
                  </div>
                </div>

                <Button 
                  ref={joinSubmitRef}
                  type="submit" 
                  disabled={!isJoinValid || isJoining} 
                  className="w-full"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : codeComplete && isJoinValid ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Join Now
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Join Discussion
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Watch Card */}
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Watch Meeting
              </CardTitle>
              <CardDescription>
                View a meeting without participating in the queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWatch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="watch-code">Room Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="watch-code"
                      value={roomCode}
                      onChange={(e) => handleCodeChange(e.target.value, watchSubmitRef)}
                      placeholder="ABCD12"
                      maxLength={6}
                      className={`font-mono uppercase ${
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
                  <div className="flex justify-between text-xs">
                    <span className={codeError ? "text-destructive" : codeComplete ? "text-green-600" : "text-muted-foreground"}>
                      {codeError || (codeComplete ? "Press Enter to watch" : "")}
                    </span>
                    <span className="text-muted-foreground">{roomCode.length}/6</span>
                  </div>
                </div>

                {/* Spacer to align with Join card */}
                <div className="h-[76px]" />

                <Button 
                  ref={watchSubmitRef}
                  type="submit" 
                  disabled={!isWatchValid || isWatching}
                  variant="secondary"
                  className="w-full"
                >
                  {isWatching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : codeComplete && isWatchValid ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Start Watching
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Watch Meeting
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Host Section */}
        <Card className="mb-10 border-dashed">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Host a New Meeting
            </CardTitle>
            <CardDescription>
              Create a room and manage the speaking queue as facilitator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host-name">Your Name</Label>
                  <Input
                    id="host-name"
                    value={displayName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={50}
                    className={nameError ? "border-destructive" : ""}
                  />
                  {nameError && (
                    <p className="text-xs text-destructive">{nameError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="host-title">Meeting Title</Label>
                  <Input
                    id="host-title"
                    value={meetingTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Team Standup"
                    maxLength={100}
                    className={titleError ? "border-destructive" : ""}
                  />
                  {titleError && (
                    <p className="text-xs text-destructive">{titleError}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={!isHostValid || isCreating}
                className="w-full md:w-auto"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Room
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Rooms Section */}
        <Separator className="my-8" />
        <InlineRoomBrowser />
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
