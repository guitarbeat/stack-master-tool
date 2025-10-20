import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
import { SpeakingAnalytics } from "./SpeakingAnalytics";
import { 
  Users, 
  MessageCircle,
  Timer
} from "lucide-react";

interface DisplayLayoutProps {
  meetingData: {
    title: string;
    code: string;
    facilitator: string;
    createdAt?: Date;
  };
  participants: Array<{
    id: string;
    name: string;
    isFacilitator: boolean;
    hasRaisedHand: boolean;
    joinedAt?: Date;
  }>;
  currentSpeaker?: {
    participantName: string;
    startedSpeakingAt?: Date;
  };
  speakingQueue: Array<{
    id: string;
    participantName: string;
    type: string;
    timestamp: number;
  }>;
  speakingDistribution?: Array<{
    name: string;
    value: number; // in seconds
  }>;
  totalSpeakingTime?: number;
  averageSpeakingTime?: number;
  meetingDuration?: number;
  totalParticipants?: number;
  queueActivity?: number;
  directResponses?: number;
  showSpeakingAnalytics?: boolean;
}

export const DisplayLayout: FC<DisplayLayoutProps> = ({
  meetingData,
  participants,
  currentSpeaker,
  speakingQueue,
  speakingDistribution = [],
  totalSpeakingTime = 0,
  averageSpeakingTime = 0,
  meetingDuration = 0,
  totalParticipants = 0,
  queueActivity = 0,
  directResponses = 0,
  showSpeakingAnalytics = false
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSpeakingTime = () => {
    if (!currentSpeaker?.startedSpeakingAt) return 0;
    return Math.floor((Date.now() - currentSpeaker.startedSpeakingAt.getTime()) / 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100">
            {meetingData.title}
          </h1>
          <div className="flex justify-center items-center gap-4 text-lg sm:text-xl text-slate-600 dark:text-slate-400">
            <span>Code: <strong className="text-slate-900 dark:text-slate-100">{meetingData.code}</strong></span>
            <span>•</span>
            <span>Facilitated by: <strong className="text-slate-900 dark:text-slate-100">{meetingData.facilitator}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Speaker - Large Display */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800 shadow-xl border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Currently Speaking
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                {currentSpeaker ? (
                  <>
                    <div className="space-y-4">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <MessageCircle className="w-12 h-12 text-white" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100">
                        {currentSpeaker.participantName}
                      </h2>
                      <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl text-slate-600 dark:text-slate-400">
                        <Timer className="w-6 h-6" />
                        <span className="font-mono font-bold">
                          {formatTime(getCurrentSpeakingTime())}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <Users className="w-12 h-12 text-slate-400" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-500 dark:text-slate-400">
                      No Current Speaker
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400">
                      Waiting for someone to speak
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Speaking Queue */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Speaking Queue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {speakingQueue.length > 0 ? (
                  speakingQueue.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        index === 0
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">
                          {entry.participantName}
                        </span>
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          {index === 0 ? "Now" : `#${index + 1}`}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No one in queue</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Speaking Analytics - Hidden in watch mode */}
            {showSpeakingAnalytics && speakingDistribution.length > 0 && (
              <SpeakingAnalytics
                speakingDistribution={speakingDistribution}
                totalSpeakingTime={totalSpeakingTime}
                averageSpeakingTime={averageSpeakingTime}
                meetingDuration={meetingDuration}
                totalParticipants={totalParticipants}
                queueActivity={queueActivity}
                directResponses={directResponses}
                currentSpeaker={currentSpeaker?.participantName}
                isHostMode={false}
              />
            )}
          </div>
        </div>

        {/* Participants Count */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-lg">
            <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {participants.length} {participants.length === 1 ? 'Participant' : 'Participants'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayLayout;
