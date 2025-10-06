import { useState, useEffect } from "react";
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
import { usePublicWatch } from "../../hooks/usePublicWatch";
import { useLocalWatch } from "../../hooks/useLocalWatch";
import { useMeetingCode } from "../../hooks/useMeetingMode";
import { MeetingHeader } from "./MeetingHeader";
import { CurrentSpeakerAlert } from "./CurrentSpeakerAlert";
import { SpeakingQueue } from "./SpeakingQueue";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export const WatchView = (): JSX.Element => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const urlMeetingCode = useMeetingCode();

  // Use URL meeting code if available, otherwise use the input
  const effectiveMeetingCode = urlMeetingCode || (hasJoined ? meetingCode : "");

  // Determine if this is a local meeting
  const isLocalMeeting =
    effectiveMeetingCode === "MANUAL" || effectiveMeetingCode === "";

  // Use local watch for local meetings, public watch for remote meetings
  const localWatchData = useLocalWatch(effectiveMeetingCode);
  const publicWatchData = usePublicWatch(
    isLocalMeeting ? "" : effectiveMeetingCode
  );

  const {
    meetingData,
    participants,
    speakingQueue,
    currentSpeaker,
    isLoading,
    error,
  } = isLocalMeeting ? localWatchData : publicWatchData;

  const handleWatch = () => {
    if (meetingCode.trim()) {
      setHasJoined(true);
    }
  };

  // Auto-join if we have a URL meeting code
  useEffect(() => {
    if (urlMeetingCode && !hasJoined) {
      setHasJoined(true);
    }
  }, [urlMeetingCode, hasJoined]);

  if (!hasJoined && !urlMeetingCode) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Watch a Meeting</CardTitle>
            <CardDescription>Enter the meeting code to observe</CardDescription>
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
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleWatch}
                className="flex-1"
                disabled={!meetingCode.trim()}
              >
                Watch Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

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
        participantCount={participants?.length || 0}
        onLeaveMeeting={() => navigate("/")}
        additionalBadge={
          <Badge variant="secondary">
            <Eye className="w-3 h-3 mr-1" />
            {isLocalMeeting ? "Local Watch" : "Watching"}
          </Badge>
        }
      />

      <CurrentSpeakerAlert currentSpeaker={currentSpeaker} />

      <div className="grid grid-cols-1 gap-8">
        <SpeakingQueue
          speakingQueue={speakingQueue}
          participantName=""
          onLeaveQueue={() => {}}
        />
      </div>

      {/* Read-only notice */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {isLocalMeeting
              ? "You are watching this local meeting in read-only mode. This view updates in real-time with the host view."
              : "You are watching this meeting in read-only mode. To participate, join as a participant instead."}
          </p>
        </div>
      </div>
    </div>
  );
};
