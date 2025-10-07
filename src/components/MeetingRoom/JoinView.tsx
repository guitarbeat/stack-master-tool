import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSupabaseParticipant } from "../../hooks/useSupabaseParticipant";
import { MeetingHeader } from "./MeetingHeader";
import { CurrentSpeakerAlert } from "./CurrentSpeakerAlert";
import { SpeakingQueue } from "./SpeakingQueue";
import { ActionsPanel } from "./ActionsPanel";
import { LoadingState } from "./LoadingState";
import { ConnectionStatus } from "./ConnectionStatus";
import { QueuePositionFeedback } from "./QueuePositionFeedback";
import { MeetingContext } from "./MeetingContext";
import { EnhancedErrorState } from "./EnhancedErrorState";

export const JoinView = (): JSX.Element => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const {
    meetingData,
    participants,
    speakingQueue,
    isInQueue,
    isConnected,
    error,
    currentSpeaker,
    joinQueue,
    leaveQueue,
    leaveMeeting,
    connectionQuality,
    lastConnected,
    reconnectAttempts,
    onReconnect,
  } = useSupabaseParticipant(
    hasJoined ? participantName : "",
    hasJoined ? meetingCode : ""
  );

  const handleJoin = () => {
    if (meetingCode.trim() && participantName.trim()) {
      setHasJoined(true);
    }
  };

  if (!hasJoined) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Join a Meeting</CardTitle>
            <CardDescription>
              Enter the meeting code and your name to join
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-code">Meeting Code</Label>
              <Input
                id="meeting-code"
                placeholder="Enter 6-digit code"
                value={meetingCode}
                onChange={e => setMeetingCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participant-name">Your Name</Label>
              <Input
                id="participant-name"
                placeholder="Enter your name"
                value={participantName}
                onChange={e => setParticipantName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                className="flex-1"
                disabled={!meetingCode.trim() || !participantName.trim()}
              >
                Join Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnected && !error) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <EnhancedErrorState
        error={error}
        onRetry={() => window.location.reload()}
        onGoHome={() => navigate("/")}
        meetingCode={meetingCode}
        participantName={participantName}
        retryCount={reconnectAttempts}
        lastConnected={lastConnected || undefined}
      />
    );
  }

  // Find participant's position in queue
  const participantQueuePosition =
    speakingQueue.findIndex(item => item.participantName === participantName) +
    1;

  return (
    <div className="container mx-auto px-4 py-8">
      <MeetingHeader
        meetingData={
          meetingData || {
            code: "",
            title: "Loading...",
            facilitator: "Loading...",
          }
        }
        participantCount={participants.length}
        onLeaveMeeting={leaveMeeting}
      />

      {/* Enhanced Connection Status */}
      <ConnectionStatus
        isConnected={isConnected}
        isConnecting={!isConnected && !error}
        error={error}
        lastConnected={lastConnected || undefined}
        reconnectAttempts={reconnectAttempts}
        onReconnect={onReconnect}
        connectionQuality={connectionQuality}
        participantCount={participants.length}
        meetingDuration={
          meetingData ? Math.floor((Date.now() - Date.now()) / 1000) : 0
        }
      />

      {currentSpeaker && (
        <MeetingContext
          meetingData={
            meetingData || {
              code: "",
              title: "Loading...",
              facilitator: "Loading...",
            }
          }
          participants={participants.map(p => ({ ...p, hasRaisedHand: false }))}
          speakingQueue={speakingQueue}
          currentSpeaker={currentSpeaker}
          isWatching={false}
        />
      )}

      {currentSpeaker && (
        <CurrentSpeakerAlert currentSpeaker={currentSpeaker} />
      )}

      {isInQueue && participantQueuePosition > 0 && currentSpeaker && (
        <QueuePositionFeedback
          participantName={participantName}
          queuePosition={participantQueuePosition}
          totalInQueue={speakingQueue.length}
          joinedAt={
            new Date(
              speakingQueue.find(
                item => item.participantName === participantName
              )?.timestamp || Date.now()
            )
          }
          currentSpeaker={currentSpeaker}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpeakingQueue
          speakingQueue={speakingQueue}
          participantName={participantName}
          onLeaveQueue={leaveQueue}
        />

        <ActionsPanel
          isInQueue={isInQueue}
          onJoinQueue={joinQueue}
          onLeaveQueue={leaveQueue}
          participantName={participantName}
        />
      </div>
    </div>
  );
};
