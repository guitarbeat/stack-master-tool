import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetingSocket } from "../../hooks/useMeetingSocket";
import { MeetingHeader } from "./MeetingHeader";
import { CurrentSpeakerAlert } from "./CurrentSpeakerAlert";
import { SpeakingQueue } from "./SpeakingQueue";
import { ActionsPanel } from "./ActionsPanel";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";

export const JoinView = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [meetingCode, setMeetingCode] = useState('');
  const [participantName, setParticipantName] = useState('');
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
  } = useMeetingSocket(
    hasJoined ? participantName : '',
    hasJoined ? {
      code: meetingCode,
      title: "Loading...",
      facilitator: "Loading...",
    } : null
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
                onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participant-name">Your Name</Label>
              <Input
                id="participant-name"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
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
    return <ErrorState error={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MeetingHeader
        meetingData={meetingData}
        participantCount={participants.length}
        onLeaveMeeting={leaveMeeting}
      />

      <CurrentSpeakerAlert currentSpeaker={currentSpeaker} />

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
