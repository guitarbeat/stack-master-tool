import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useMeetingSocket } from '../../hooks/useMeetingSocket';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Eye, Clock, MessageCircle, Info, Settings } from 'lucide-react';
import { getQueueTypeDisplay } from '../../utils/queue';

export const WatchView = (): JSX.Element => {
  const { meetingId } = useParams();
  const location = useLocation();
  const { watcherName, meetingInfo } = location.state || {};
  
  const {
    meetingData,
    participants,
    speakingQueue,
    isConnected,
    error,
    currentSpeaker,
    leaveMeeting
  } = useMeetingSocket(watcherName, meetingInfo || {
    code: meetingId || '',
    title: 'Loading...',
    facilitator: 'Loading...'
  }, true); // isWatcher = true

  if (!isConnected && !error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
            Connecting to meeting...
          </h2>
          <p className="text-gray-600 dark:text-zinc-400">
            Please wait while we connect you to the meeting.
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
            <Eye className="w-8 h-8 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.href = '/join'}
            className="w-full bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Try Joining as Participant
          </button>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
              {meetingData?.title || 'Meeting'}
            </h1>
            <p className="text-gray-600 dark:text-zinc-400">
              Meeting Code: <span className="font-mono font-semibold">{meetingData?.code}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-zinc-500">
              Facilitated by {meetingData?.facilitator}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Watching
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-full">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {participants.length} participants
              </span>
            </div>
            <button
              onClick={leaveMeeting}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

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
                <p className="text-gray-500 dark:text-zinc-400">No one in queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {speakingQueue.map((entry, index) => {
                  const isDirect = entry.type === 'direct-response';
                  const isPointInfo = entry.type === 'point-of-info';
                  const isClarify = entry.type === 'clarification';
                  const isCurrentSpeaker = index === 0;
                  
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        isCurrentSpeaker
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-gray-200 dark:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={isCurrentSpeaker ? "default" : "secondary"}
                          className={`${
                            isCurrentSpeaker
                              ? 'animate-pulse'
                              : ''
                          } ${
                            isDirect ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' : ''
                          }`}
                        >
                          {isCurrentSpeaker 
                            ? (isDirect ? "🎤 Direct Response" : "🎤 Speaking") 
                            : `#${index + 1}`
                          }
                        </Badge>
                        <div className="flex items-center gap-2">
                          {isDirect && <MessageCircle className="h-4 w-4 text-orange-600" />}
                          {isPointInfo && <Info className="h-4 w-4 text-blue-600" />}
                          {isClarify && <Settings className="h-4 w-4 text-purple-600" />}
                          <span className="font-semibold">
                            {entry.participantName}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isDirect
                              ? 'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300'
                              : isPointInfo
                                ? 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300'
                                : isClarify
                                  ? 'border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300'
                                  : 'border-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
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
                <p className="text-gray-500 dark:text-zinc-400">No participants yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((participant) => {
                  const isInQueue = speakingQueue.some(q => q.participantName === participant.name);
                  
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

      {/* Read-only notice */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            You are watching this meeting in read-only mode. To participate, join as a participant instead.
          </p>
        </div>
      </div>
    </div>
  );
};