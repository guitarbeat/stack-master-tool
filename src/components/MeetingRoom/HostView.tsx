import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  ArrowLeft,
  SkipForward,
  Users,
  RotateCcw,
  Plus,
  Eye,
} from "lucide-react";
import { useUnifiedFacilitator } from "../../hooks/useUnifiedFacilitator";
import { RemoteModeToggle } from "../Facilitator/RemoteModeToggle";
import CurrentSpeakerCard from "../CurrentSpeakerCard";
import ParticipantList from "../ParticipantList";
import { SpeakingDistribution } from "../StackKeeper/SpeakingDistribution";
import { InterventionsPanel } from "../StackKeeper/InterventionsPanel";
import { getQueueTypeDisplay } from "../../utils/queue";
import { EditableMeetingTitle } from "../EditableMeetingTitle";

export const HostView = (): JSX.Element => {
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
    manualStack,
    remoteManagement,
  } = useUnifiedFacilitator(facilitatorName);

  const [newParticipantName, setNewParticipantName] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleAddParticipant = () => {
    if (newParticipantName.trim()) {
      addParticipant(newParticipantName.trim());
      setNewParticipantName("");
      setAddDialogOpen(false);
    }
  };

  const handleMeetingTitleUpdate = async (newTitle: string) => {
    if (isRemoteEnabled && remoteManagement.updateMeetingTitle) {
      await remoteManagement.updateMeetingTitle(newTitle);
    }
  };

  const handleParticipantNameUpdate = async (participantId: string, newName: string) => {
    if (isRemoteEnabled && remoteManagement.updateParticipantName) {
      await remoteManagement.updateParticipantName(participantId, newName);
    }
  };

  const handleAddIntervention = (
    type: "direct-response" | "clarifying-question",
    participantName: string
  ) => {
    if (isRemoteEnabled && remoteManagement.addIntervention) {
      remoteManagement.addIntervention(type, participantName);
    } else {
      manualStack.addIntervention(type, participantName);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">
                Host Meeting
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Welcome, {facilitatorName}</span>
                {meetingTitle && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <EditableMeetingTitle
                      currentTitle={meetingTitle}
                      isFacilitator={true}
                      onTitleUpdate={handleMeetingTitleUpdate}
                      className="text-sm text-muted-foreground truncate"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => {
                // Open watch view in a new tab
                const watchUrl = `/meeting?mode=watch&code=${meetingCode || "MANUAL"}`;
                window.open(watchUrl, "_blank");
              }}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Watch View</span>
              <span className="sm:hidden">Watch</span>
            </Button>
            <Badge
              variant={isRemoteEnabled ? "default" : "secondary"}
              className="text-xs sm:text-sm"
            >
              {isRemoteEnabled ? "Remote Enabled" : "Manual Mode"}
            </Badge>
            {isRemoteEnabled && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                <Users className="w-3 h-3 mr-1" />
                {participants.length} participants
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Speaking Queue */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Speaking Queue
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {isRemoteEnabled &&
                  remoteManagement.undoHistory?.length > 0 && (
                    <Button
                      onClick={remoteManagement.handleUndo}
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">
                        Undo ({remoteManagement.undoHistory.length})
                      </span>
                      <span className="sm:hidden">Undo</span>
                    </Button>
                  )}
                {!isRemoteEnabled && (
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Add</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Participant</DialogTitle>
                        <DialogDescription>
                          Add a participant to the speaking queue
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="participant-name">Name</Label>
                          <Input
                            id="participant-name"
                            placeholder="Participant name"
                            value={newParticipantName}
                            onChange={e =>
                              setNewParticipantName(e.target.value)
                            }
                            onKeyDown={e => {
                              if (e.key === "Enter") handleAddParticipant();
                            }}
                          />
                        </div>
                        <Button
                          onClick={handleAddParticipant}
                          className="w-full"
                        >
                          Add to Queue
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  onClick={nextSpeaker}
                  disabled={speakingQueue.length === 0}
                  className="floating-glow text-xs sm:text-sm"
                  size="sm"
                >
                  <SkipForward className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Next Speaker</span>
                  <span className="sm:hidden">Next</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {speakingQueue.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground text-base sm:text-lg">
                    No one in queue
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground px-4">
                    {isRemoteEnabled
                      ? "Participants can raise their hand to join"
                      : 'Click "Add" to add participants manually'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {speakingQueue.map((entry: any) => {
                    const isSpeaking = entry.is_speaking;

                    return (
                      <div
                        key={entry.id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 rounded-xl border transition-standard ${
                          isSpeaking
                            ? "bg-primary/10 border-primary/40"
                            : "bg-muted/20 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                          <div
                            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 ${
                              isSpeaking
                                ? "bg-primary text-primary-foreground animate-pulse"
                                : "bg-muted"
                            }`}
                          >
                            {isSpeaking ? "🎤" : `#${entry.position}`}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-sm sm:text-lg block truncate">
                              {entry.participantName}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getQueueTypeDisplay(entry.queue_type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                {formatTimestamp(entry.joined_queue_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          {!isSpeaking && (
                            <div className="flex items-center gap-1 w-full sm:w-auto">
                              <Button
                                onClick={() =>
                                  handleAddIntervention(
                                    "direct-response",
                                    entry.participantName || "Unknown"
                                  )
                                }
                                variant="outline"
                                size="sm"
                                className="text-xs flex-1 sm:flex-none"
                              >
                                Direct
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
                                className="text-xs flex-1 sm:flex-none"
                              >
                                Clarify
                              </Button>
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
              isInQueue: speakingQueue.some(
                (q: any) => q.participant_id === p.id
              ),
              joinedAt: p.joined_at,
            }))}
            meetingData={{
              code: meetingCode || "MANUAL",
              facilitator: facilitatorName,
            }}
            onParticipantNameUpdate={handleParticipantNameUpdate}
            isHost={true}
          />
        </div>

        {/* Analytics - Only show in remote mode */}
        {isRemoteEnabled && (
          <>
            <SpeakingDistribution
              speakingData={
                remoteManagement.getSpeakingDistribution?.(true) || []
              }
              includeDirectResponses={true}
              onToggleIncludeDirectResponses={() => {}}
            />

            <InterventionsPanel
              interventions={remoteManagement.interventions || []}
              onClearInterventions={() =>
                remoteManagement.setInterventions?.([])
              }
              showInterventionsPanel={true}
            />
          </>
        )}
      </div>
    </div>
  );
};
