import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSupabaseFacilitator } from '../../hooks/useSupabaseFacilitator';
import { useFacilitatorSession } from '../../hooks/useFacilitatorSession';
import FacilitatorHeader from '../FacilitatorHeader';
import ParticipantList from '../ParticipantList';
import CurrentSpeakerCard from '../CurrentSpeakerCard';
import { SpeakingDistribution } from '../StackKeeper/SpeakingDistribution';
import { InterventionsPanel } from '../StackKeeper/InterventionsPanel';
import { getQueueTypeDisplay } from '../../utils/queue';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { SkipForward, RotateCcw, Play, Users } from 'lucide-react';

export const HostView = (): JSX.Element => {
  const { meetingId } = useParams();
  const location = useLocation();
  const { facilitatorName, meetingName, meetingCode } = location.state || {};
  const { saveSession, clearSession } = useFacilitatorSession();

  // Use meeting code from URL params if not in state
  const finalMeetingCode = meetingCode || meetingId;

  const {
    participants,
    speakingQueue,
    currentSpeaker,
    isConnected,
    error,
    meetingData,
    nextSpeaker,
    finishSpeaking,
    disconnect,
    speakerTimer,
    elapsedTime,
    toggleSpeakerTimer,
    resetSpeakerTimer,
    formatTime,
    getSpeakingDistribution,
    clearSpeakingHistory,
    interventions,
    setInterventions,
    addIntervention,
    undoHistory,
    handleUndo,
  } = useSupabaseFacilitator(finalMeetingCode, facilitatorName);

  const leaveMeeting = () => {
    disconnect();
    clearSession();
    window.location.href = '/';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isConnected && !error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
            Setting up facilitator view...
          </h2>
          <p className="text-gray-600 dark:text-zinc-400">
            Please wait while we prepare your facilitator controls.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-auto dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-6">
            {error}
          </p>
          <Button
            onClick={() => window.location.href = '/facilitate'}
            className="w-full bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Try Different Code
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FacilitatorHeader
        title={meetingData?.title || "Loading..."}
        code={meetingData?.meeting_code || finalMeetingCode || ""}
        participantCount={participants.length}
        leaveMeeting={leaveMeeting}
      />

      <CurrentSpeakerCard
        currentSpeaker={
          currentSpeaker
            ? {
                participantName: currentSpeaker.participantName || "Unknown",
                type: currentSpeaker.queue_type,
              }
            : null
        }
        finishSpeaking={finishSpeaking}
        speakerTimer={speakerTimer}
        elapsedTime={elapsedTime}
        onToggleTimer={toggleSpeakerTimer}
        onResetTimer={resetSpeakerTimer}
        formatTime={formatTime}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Speaking Queue */}
        <Card className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              Speaking Queue
            </CardTitle>
            <div className="flex items-center gap-2">
              {undoHistory.length > 0 && (
                <Button
                  onClick={handleUndo}
                  variant="outline"
                  className="rounded-xl"
                  title={`Undo (${undoHistory.length} actions available)`}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo ({undoHistory.length})
                </Button>
              )}
              <Button
                onClick={nextSpeaker}
                disabled={speakingQueue.length === 0}
                className="floating-glow rounded-xl"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Next Speaker
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {speakingQueue.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-zinc-400 text-lg">
                  No one in queue
                </p>
                <p className="text-sm text-gray-400 dark:text-zinc-500">
                  Participants can raise their hand to join the queue
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {speakingQueue.map((entry, index) => {
                  const isSpeaking = entry.is_speaking;
                  const isDirect = entry.queue_type === "direct-response";
                  const isPointInfo = entry.queue_type === "point-of-info";
                  const isClarify = entry.queue_type === "clarification";

                  return (
                    <div
                      key={entry.id}
                      className={`stack-card flex items-center justify-between p-6 rounded-xl border transition-standard ${
                        isSpeaking
                          ? "current-speaker border-primary/40 text-primary-foreground"
                          : "glass-card hover:bg-muted/40 border-border/60"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          isSpeaking
                            ? 'animate-pulse bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                            : 'px-4 py-2 font-semibold'
                        } ${
                          isDirect ? 'bg-primary text-primary-foreground animate-pulse' : ''
                        }`}>
                          {isSpeaking
                            ? (isDirect ? "🎤 Direct Response" : "🎤 Speaking")
                            : `#${entry.position}`}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-lg ${isSpeaking ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {entry.participantName}
                          </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          isDirect
                            ? 'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300'
                            : isPointInfo
                              ? 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300'
                              : isClarify
                                ? 'border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300'
                                : 'border-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {getQueueTypeDisplay(entry.queue_type)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(entry.joined_queue_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSpeaking && (
                          <div className="flex items-center text-primary">
                            <Play className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">
                              Speaking
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participants */}
        <ParticipantList
          participants={participants.map(p => ({
            id: p.id,
            name: p.name,
            isFacilitator: p.is_facilitator,
            isInQueue: speakingQueue.some(q => q.participant_id === p.id),
            joinedAt: p.joined_at,
          }))}
          meetingData={{
            code: meetingData?.meeting_code || finalMeetingCode || "",
            facilitator: meetingData?.facilitator_name || "Facilitator",
          }}
        />
      </div>

      {/* Speaking Distribution */}
      <SpeakingDistribution
        speakingData={getSpeakingDistribution(true)}
        includeDirectResponses={true}
        onToggleIncludeDirectResponses={() => {}}
      />

      {/* Interventions Panel */}
      <InterventionsPanel
        interventions={interventions}
        onClearInterventions={() => setInterventions([])}
        showInterventionsPanel={true}
      />
    </div>
  );
};