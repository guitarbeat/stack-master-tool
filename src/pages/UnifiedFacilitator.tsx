import { useState } from "react";
import {
  ArrowLeft,
  SkipForward,
  RotateCcw,
  Play,
  Users,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RemoteModeToggle } from "@/components/Facilitator/RemoteModeToggle";
import { useUnifiedFacilitator } from "@/hooks/useUnifiedFacilitator";
import CurrentSpeakerCard from "@/components/CurrentSpeakerCard";
import ParticipantList from "@/components/ParticipantList";
import { SpeakingDistribution } from "@/components/StackKeeper/SpeakingDistribution";
import { InterventionsPanel } from "@/components/StackKeeper/InterventionsPanel";
import { getQueueTypeDisplay } from "@/utils/queue";
import { toast } from "@/hooks/use-toast";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";

function UnifiedFacilitator() {
  const navigate = useNavigate();
  const [facilitatorName] = useState(() => {
    const stored = localStorage.getItem("facilitatorName");
    return stored || "Facilitator";
  });

  const {
    isRemoteEnabled,
    meetingCode,
    meetingTitle,
    isCreatingMeeting,
    enableRemoteMode,
    disableRemoteMode,
    participants,
    speakingQueue,
    currentSpeaker,
    nextSpeaker,
    addParticipant,
    getSpeakingDistribution,
    manualStack,
    remoteManagement,
  } = useUnifiedFacilitator(facilitatorName);

  const handleAddParticipant = (name: string) => {
    addParticipant(name);
  };

  const handleParticipantNameUpdate = async (
    participantId: string,
    newName: string
  ) => {
    if (isRemoteEnabled && remoteManagement.updateParticipantName) {
      // In remote mode, update the participant name in the database
      await remoteManagement.updateParticipantName(participantId, newName);
    } else {
      // In manual mode, we could update the local state
      // This would require extending the manual stack management
      toast({
        title: "Name editing not implemented",
        description: "This feature will be available soon in manual mode",
        variant: "destructive",
      });
    }
  };

  const handleAddIntervention = (type: string, participantName: string) => {
    if (isRemoteEnabled && remoteManagement.addIntervention) {
      remoteManagement.addIntervention(type as any, participantName);
    } else {
      // In manual mode, add as priority to queue
      manualStack.addToStack(participantName);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background">
      <KeyboardShortcuts
        onQuickAdd={() => {
          // Focus the quick add input if available
          const quickAddButton = document.querySelector(
            "[data-quick-add-trigger]"
          ) as HTMLButtonElement;
          if (quickAddButton) {
            quickAddButton.click();
          }
        }}
        onNextSpeaker={nextSpeaker}
        onUndo={
          isRemoteEnabled ? remoteManagement.handleUndo : manualStack.handleUndo
        }
        disabled={isCreatingMeeting}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Stack Facilitator</h1>
              <p className="text-muted-foreground">
                Welcome, {facilitatorName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isRemoteEnabled ? "default" : "secondary"}>
              {isRemoteEnabled ? "Remote Enabled" : "Manual Mode"}
            </Badge>
            {isRemoteEnabled && (
              <Badge variant="outline">
                <Users className="w-3 h-3 mr-1" />
                {participants.length} participants
              </Badge>
            )}
            <KeyboardShortcutsHelp />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Remote Mode Toggle */}
          <div className="lg:col-span-1">
            <RemoteModeToggle
              isRemoteEnabled={isRemoteEnabled}
              meetingCode={meetingCode}
              meetingTitle={meetingTitle}
              isCreatingMeeting={isCreatingMeeting}
              onEnableRemote={enableRemoteMode}
              onDisableRemote={disableRemoteMode}
              facilitatorName={facilitatorName}
            />
          </div>

          {/* Current Speaker */}
          <div className="lg:col-span-2">
            <CurrentSpeakerCard
              currentSpeaker={
                currentSpeaker
                  ? {
                      participantName:
                        currentSpeaker.participantName || "Unknown",
                      type: currentSpeaker.queue_type,
                    }
                  : null
              }
              finishSpeaking={nextSpeaker}
              speakerTimer={
                isRemoteEnabled ? remoteManagement.speakerTimer : null
              }
              elapsedTime={isRemoteEnabled ? remoteManagement.elapsedTime : 0}
              onToggleTimer={
                isRemoteEnabled
                  ? remoteManagement.toggleSpeakerTimer
                  : undefined
              }
              onResetTimer={
                isRemoteEnabled ? remoteManagement.resetSpeakerTimer : undefined
              }
              formatTime={
                isRemoteEnabled ? remoteManagement.formatTime : undefined
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Speaking Queue */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle>Speaking Queue</CardTitle>
              <div className="flex items-center gap-2">
                {isRemoteEnabled &&
                  remoteManagement.undoHistory?.length > 0 && (
                    <Button
                      onClick={remoteManagement.handleUndo}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Undo ({remoteManagement.undoHistory.length})
                    </Button>
                  )}
                <Button
                  onClick={nextSpeaker}
                  disabled={speakingQueue.length === 0}
                  className="floating-glow"
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
                  <p className="text-muted-foreground text-lg">
                    No one in queue
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRemoteEnabled
                      ? "Participants can raise their hand to join"
                      : 'Click "Add" to add participants manually'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {speakingQueue.map(entry => {
                    const isSpeaking = entry.is_speaking;

                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-6 rounded-xl border transition-standard ${
                          isSpeaking
                            ? "bg-primary/10 border-primary/40"
                            : "bg-muted/20 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              isSpeaking
                                ? "bg-primary text-primary-foreground animate-pulse"
                                : "bg-muted"
                            }`}
                          >
                            {isSpeaking ? "🎤 Speaking" : `#${entry.position}`}
                          </div>
                          <span className="font-semibold text-lg">
                            {entry.participantName}
                          </span>
                          <Badge variant="outline">
                            {getQueueTypeDisplay(entry.queue_type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(entry.joined_queue_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isSpeaking && (
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() =>
                                  handleAddIntervention(
                                    "direct-response",
                                    entry.participantName || "Unknown"
                                  )
                                }
                                variant="outline"
                                size="sm"
                              >
                                Direct Response
                              </Button>
                              <Button
                                onClick={() =>
                                  handleAddIntervention(
                                    "clarifying-question",
                                    entry.participantName || "Unknown"
                                  )
                                }
                                variant="outline"
                                size="sm"
                              >
                                Clarify
                              </Button>
                            </div>
                          )}
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
              isFacilitator: p.is_facilitator ?? false,
              isInQueue: speakingQueue.some(q => q.participant_id === p.id),
              joinedAt: p.joined_at,
            }))}
            meetingData={{
              code: meetingCode || "MANUAL",
              facilitator: facilitatorName,
            }}
            onAddParticipant={
              !isRemoteEnabled ? handleAddParticipant : undefined
            }
            onParticipantNameUpdate={handleParticipantNameUpdate}
            isHost={true}
            showQuickAdd={!isRemoteEnabled}
          />
        </div>

        {/* Analytics - Show for both local and remote meetings */}
        <SpeakingDistribution
          speakingData={getSpeakingDistribution?.(true) || []}
          includeDirectResponses={true}
          onToggleIncludeDirectResponses={() => {}}
        />

        {/* Interventions - Only show in remote mode */}
        {isRemoteEnabled && (
          <InterventionsPanel
            interventions={remoteManagement.interventions || []}
            onClearInterventions={() => remoteManagement.setInterventions?.([])}
            showInterventionsPanel={true}
          />
        )}
      </div>
    </div>
  );
}

export default UnifiedFacilitator;
