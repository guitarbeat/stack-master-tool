import { useParams, useLocation } from "react-router-dom";
import { useSupabaseParticipant } from "../../hooks/useSupabaseParticipant";
import { MeetingHeader } from "./MeetingHeader";
import { CurrentSpeakerAlert } from "./CurrentSpeakerAlert";
import { SpeakingQueue } from "./SpeakingQueue";
import { ActionsPanel } from "./ActionsPanel";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";

export const MeetingRoomRefactored = (): JSX.Element => {
  const { meetingId } = useParams();
  const location = useLocation();
  const { participantName, meetingInfo } = location.state || {};

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
  } = useSupabaseParticipant(participantName || "", meetingId || "");

  if (!isConnected && !error) {
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
