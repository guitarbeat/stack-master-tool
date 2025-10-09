import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppError, ErrorCode } from "@/utils/errorHandling";
import { validateMeetingCode } from "@/utils/meetingValidation";
import { SupabaseMeetingService, type MeetingWithParticipants, type Participant as SbParticipant, type QueueItem as SbQueueItem } from "@/services/supabase";
import { logProduction } from "@/utils/productionLogger";

type MeetingMode = "host" | "join" | "watch";

interface UseMeetingStateReturn {
  // * Core meeting state
  meetingCode: string;
  setMeetingCode: (code: string) => void;
  meetingId: string;
  setMeetingId: (id: string) => void;
  mode: MeetingMode | null;
  setMode: (mode: MeetingMode | null) => void;
  isLoading: boolean;
  error: AppError | string | null;
  codeInput: string;
  setCodeInput: (code: string) => void;
  setError: (error: AppError | string | null) => void;
  
  // * Server state
  serverMeeting: MeetingWithParticipants | null;
  serverParticipants: SbParticipant[];
  serverQueue: SbQueueItem[];
  currentParticipantId: string;
  setCurrentParticipantId: (id: string) => void;
  
  // * UI state
  isLiveMeeting: boolean;
  setIsLiveMeeting: (live: boolean) => void;
  showJohnDoe: boolean;
  setShowJohnDoe: (show: boolean) => void;
  
  // * Speaker management
  lastSpeaker: SbQueueItem | null;
  setLastSpeaker: (speaker: SbQueueItem | null) => void;
  
  // * QR/Scanner state
  qrOpen: boolean;
  setQrOpen: (open: boolean) => void;
  qrUrl: string;
  setQrUrl: (url: string) => void;
  qrType: 'join' | 'watch';
  setQrType: (type: 'join' | 'watch') => void;
  scannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
  
  // * Computed values
  userRole: string;
}

/**
 * * Custom hook for managing meeting state and initialization
 * Centralizes all meeting-related state management and initialization logic
 */
export function useMeetingState(): UseMeetingStateReturn {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { user } = useAuth();
  
  // * Core meeting state
  const [meetingCode, setMeetingCode] = useState<string>("");
  const [meetingId, setMeetingId] = useState<string>("");
  const [mode, setMode] = useState<MeetingMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | string | null>(null);
  const [codeInput, setCodeInput] = useState<string>("");
  
  // * Server state
  const [serverMeeting, setServerMeeting] = useState<MeetingWithParticipants | null>(null);
  const [serverParticipants, setServerParticipants] = useState<SbParticipant[]>([]);
  const [serverQueue, setServerQueue] = useState<SbQueueItem[]>([]);
  const [currentParticipantId, setCurrentParticipantId] = useState<string>("");
  
  // * UI state
  const [isLiveMeeting, setIsLiveMeeting] = useState<boolean>(false);
  const [showJohnDoe, setShowJohnDoe] = useState(true);
  
  // * Speaker management
  const [lastSpeaker, setLastSpeaker] = useState<SbQueueItem | null>(null);
  
  // * QR/Scanner state
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [qrType, setQrType] = useState<'join' | 'watch'>('join');
  const [scannerOpen, setScannerOpen] = useState(false);

  // * Determine user role based on mode
  const userRole = mode === "host" ? "facilitator" : mode === "watch" ? "observer" : "participant";

  // * Initialize meeting based on URL parameters
  useEffect(() => {
    // * Handle /watch/:code route
    if (params.code) {
      setMode("watch");
      setMeetingCode(params.code);
    } else {
      const modeParam = searchParams.get("mode") as MeetingMode;
      const codeParam = searchParams.get("code");

      if (!modeParam || !["host", "join", "watch"].includes(modeParam)) {
        setError(new AppError(ErrorCode.INVALID_OPERATION, undefined, "Invalid meeting mode. Please use host, join, or watch."));
        setIsLoading(false);
        return;
      }

      setMode(modeParam);

      // * For join/watch modes, we need a meeting code; for host mode, code is optional
      if ((modeParam === "join" || modeParam === "watch") && !codeParam) {
        // * Will show code input form in render logic
        setIsLoading(false);
        return;
      }
    }

    // * Bootstrap meeting based on mode
    const bootstrap = async () => {
      try {
        const currentMode = params.code ? "watch" : (searchParams.get("mode") as MeetingMode);
        const currentCode = params.code || searchParams.get("code");
        
        if (currentMode === "host") {
          await handleHostMode(user, setMeetingId, setMeetingCode, setServerMeeting, setServerParticipants, setServerQueue);
        } else if (currentCode) {
          await handleJoinOrWatchMode(
            currentMode as MeetingMode,
            currentCode,
            user,
            setError,
            setMeetingId,
            setMeetingCode,
            setServerMeeting,
            setServerParticipants,
            setServerQueue,
            setCurrentParticipantId
          );
        }
      } catch (e) {
        setError(new AppError(ErrorCode.CONNECTION_FAILED, undefined, "Failed to connect to meeting."));
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [searchParams, user?.email, params.code]);

  return {
    // * Core meeting state
    meetingCode,
    setMeetingCode,
    meetingId,
    setMeetingId,
    mode,
    setMode,
    isLoading,
    error,
    codeInput,
    setCodeInput,
    setError,
    
    // * Server state
    serverMeeting,
    serverParticipants,
    serverQueue,
    currentParticipantId,
    setCurrentParticipantId,
    
    // * UI state
    isLiveMeeting,
    setIsLiveMeeting,
    showJohnDoe,
    setShowJohnDoe,
    
    // * Speaker management
    lastSpeaker,
    setLastSpeaker,
    
    // * QR/Scanner state
    qrOpen,
    setQrOpen,
    qrUrl,
    setQrUrl,
    qrType,
    setQrType,
    scannerOpen,
    setScannerOpen,
    
    // * Computed values
    userRole,
  };
}

/**
 * * Handles host mode initialization
 * Creates a new meeting and sets up initial state
 */
async function handleHostMode(
  user: any,
  setMeetingId: (id: string) => void,
  setMeetingCode: (code: string) => void,
  setServerMeeting: (meeting: MeetingWithParticipants | null) => void,
  setServerParticipants: (participants: SbParticipant[]) => void,
  setServerQueue: (queue: SbQueueItem[]) => void
) {
  const facilitatorName = user?.email ?? "Facilitator";
  const created = await SupabaseMeetingService.createMeeting(
    "New Meeting",
    facilitatorName,
  );
  setMeetingId(created.id);
  setMeetingCode(created.code);
  const full = await SupabaseMeetingService.getMeeting(created.code);
  if (full) {
    setServerMeeting(full);
    setServerParticipants(full.participants);
    setServerQueue(full.speakingQueue);
  }
}

/**
 * * Handles join or watch mode initialization
 * Validates meeting code and joins meeting if in join mode
 */
async function handleJoinOrWatchMode(
  currentMode: MeetingMode,
  currentCode: string,
  user: any,
  setError: (error: AppError | string | null) => void,
  setMeetingId: (id: string) => void,
  setMeetingCode: (code: string) => void,
  setServerMeeting: (meeting: MeetingWithParticipants | null) => void,
  setServerParticipants: (participants: SbParticipant[]) => void,
  setServerQueue: (queue: SbQueueItem[]) => void,
  setCurrentParticipantId: (id: string) => void
) {
  try {
    // * Validate meeting code before making API call
    const validation = validateMeetingCode(currentCode);
    if (!validation.isValid) {
      setError(new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, validation.error || "Invalid meeting code format"));
      return;
    }

    const full = await SupabaseMeetingService.getMeeting(validation.normalizedCode);
    if (!full) {
      setError(new AppError(ErrorCode.MEETING_NOT_FOUND, undefined, `Meeting "${validation.normalizedCode}" not found or inactive. Please check the code and try again.`));
      return;
    }
    
    setMeetingId(full.id);
    setMeetingCode(full.code);
    setServerMeeting(full);
    setServerParticipants(full.participants);
    setServerQueue(full.speakingQueue);

    // * For JOIN mode, create participant if meeting exists
    if (currentMode === "join") {
      try {
        const participantName = user?.email ?? `Participant-${Date.now()}`;
        const participant = await SupabaseMeetingService.joinMeeting(
          validation.normalizedCode,
          participantName,
          false // not facilitator
        );
        // * Store the current participant ID for queue operations
        setCurrentParticipantId(participant.id);
        // * Add the new participant to the list
        setServerParticipants(prev => [...prev, participant]);
      } catch (joinError) {
        logProduction("error", {
          action: "join_meeting_participant",
          meetingCode: validation.normalizedCode,
          participantName: user?.email ?? `Participant-${Date.now()}`,
          error: joinError instanceof Error ? joinError.message : String(joinError)
        });
        
        // * Provide more specific error messages based on error type
        if (joinError instanceof AppError) {
          setError(joinError);
        } else {
          setError(new AppError(ErrorCode.MEETING_ACCESS_DENIED, undefined, "Failed to join meeting. Please try again."));
        }
        return;
      }
    }
  } catch (fetchError) {
    logProduction("error", {
      action: "fetch_meeting",
      meetingCode: currentCode,
      mode: currentMode,
      error: fetchError instanceof Error ? fetchError.message : String(fetchError)
    });
    
    // * Provide more specific error messages based on error type
    if (fetchError instanceof AppError) {
      setError(fetchError);
    } else {
      setError(new AppError(ErrorCode.CONNECTION_FAILED, undefined, "Unable to connect to meeting. Please check your internet connection and try again."));
    }
    return;
  }
}