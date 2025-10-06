
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Users,
  Eye,
  Clock,
  MessageCircle,
  Info,
  Settings,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { getQueueTypeDisplay } from "../utils/queue";
import { usePublicWatch } from "../hooks/usePublicWatch";
import { ConnectionStatus } from "../components/MeetingRoom/ConnectionStatus";
import { MeetingContext } from "../components/MeetingRoom/MeetingContext";
import { EnhancedErrorState } from "../components/MeetingRoom/EnhancedErrorState";

export const PublicWatch = (): JSX.Element => {
  const { code } = useParams();
  const navigate = useNavigate();
  const {
    meetingData,
    participants,
    speakingQueue,
    currentSpeaker,
    isLoading,
    error,
    isConnected,
    connectionQuality,
    lastConnected,
  } = usePublicWatch(code || "");

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
            Loading meeting...
          </h2>
          <p className="text-gray-600 dark:text-zinc-400">
            Please wait while we fetch the meeting data.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EnhancedErrorState
        error={error}
        onRetry={() => window.location.reload()}
        onGoHome={() => navigate('/')}
        meetingCode={code}
        isRetrying={isLoading}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                {meetingData?.title || "Meeting"}
              </h1>
              <p className="text-gray-600 dark:text-zinc-400">
                Meeting Code:{" "}
                <span className="font-mono font-semibold">
                  {meetingData?.code}
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-500">
                Facilitated by {meetingData?.facilitator}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Public Watch
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-full">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {participants.length} participants
              </span>
            </div>
            <button
              onClick={() => navigate(`/join`)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Join Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Connection Status for public watchers */}
      <ConnectionStatus
        isConnected={isConnected}
        isConnecting={isLoading}
        connectionQuality={connectionQuality}
        participantCount={participants.length}
        meetingDuration={meetingData ? Math.floor((Date.now() - new Date(meetingData.createdAt || Date.now()).getTime()) / 1000) : 0}
      />

      {/* Meeting Context for public watchers */}
      <MeetingContext
        meetingData={meetingData || { code: '', title: 'Loading...', facilitator: 'Loading...' }}
        participants={participants}
        speakingQueue={speakingQueue}
        currentSpeaker={currentSpeaker}
        isWatching={true}
      />

      {/* Current Speaker */}
      {currentSpeaker && (
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-20"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  Currently Speaking
                </h3>
                <p className="text-xl font-bold text-primary">
                  {currentSpeaker.participantName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Speaking Queue */}
        <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              Speaking Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {speakingQueue.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-zinc-400">
                  No one in queue
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {speakingQueue.map((entry, index) => {
                  const isDirect = entry.type === "direct-response";
                  const isPointInfo = entry.type === "point-of-info";
                  const isClarify = entry.type === "clarification";
                  const isCurrentSpeaker = index === 0;

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        isCurrentSpeaker
                          ? "border-primary/40 bg-primary/5"
                          : "border-gray-200 dark:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={isCurrentSpeaker ? "default" : "secondary"}
                          className={`${
                            isCurrentSpeaker ? "animate-pulse" : ""
                          } ${
                            isDirect
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                              : ""
                          }`}
                        >
                          {isCurrentSpeaker
                            ? isDirect
                              ? "🎤 Direct Response"
                              : "🎤 Speaking"
                            : `#${index + 1}`}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {isDirect && (
                            <MessageCircle className="h-4 w-4 text-orange-600" />
                          )}
                          {isPointInfo && (
                            <Info className="h-4 w-4 text-blue-600" />
                          )}
                          {isClarify && (
                            <Settings className="h-4 w-4 text-purple-600" />
                          )}
                          <span className="font-semibold">
                            {entry.participantName}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isDirect
                              ? "border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300"
                              : isPointInfo
                                ? "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300"
                                : isClarify
                                  ? "border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300"
                                  : "border-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {getQueueTypeDisplay(entry.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                        <Clock className="w-4 h-4" />
                        {formatTimestamp(entry.timestamp)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participants */}
        <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-zinc-400">
                  No participants yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map(participant => {
                  const isInQueue = speakingQueue.some(
                    q => q.participantName === participant.name
                  );

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-zinc-100">
                            {participant.name}
                          </p>
                          {participant.isFacilitator && (
                            <Badge variant="outline" className="text-xs">
                              Facilitator
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isInQueue && (
                          <Badge variant="secondary" className="text-xs">
                            In Queue
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Public watch notice */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This is a public watch view. Anyone with this link can observe the
            meeting.
            <button
              onClick={() => navigate("/join")}
              className="ml-2 text-primary hover:text-primary/90 font-medium underline"
            >
              Join as a participant
            </button>{" "}
            to participate in the discussion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicWatch;
