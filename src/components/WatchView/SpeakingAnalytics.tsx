import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Clock, TrendingUp, Users, Timer, Target, Activity, Zap } from "lucide-react";

interface SpeakingAnalyticsProps {
  speakingDistribution: Array<{
    name: string;
    value: number; // in seconds
  }>;
  totalSpeakingTime?: number;
  averageSpeakingTime?: number;
  // Enhanced metrics
  meetingDuration?: number; // in seconds
  totalParticipants?: number;
  queueActivity?: number; // number of queue actions
  directResponses?: number; // number of direct responses
  currentSpeaker?: string;
  isHostMode?: boolean; // whether this is being displayed in HOST mode
}

export const SpeakingAnalytics: FC<SpeakingAnalyticsProps> = ({
  speakingDistribution,
  totalSpeakingTime = 0,
  averageSpeakingTime = 0,
  meetingDuration = 0,
  totalParticipants = 0,
  queueActivity = 0,
  directResponses = 0,
  currentSpeaker,
  isHostMode = false
}) => {
  const formatLongTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedDistribution = [...speakingDistribution].sort((a, b) => b.value - a.value);
  const maxTime = Math.max(...speakingDistribution.map(p => p.value), 1);

  // Calculate engagement metrics
  const speakingRatio = totalSpeakingTime > 0 && meetingDuration > 0
    ? (totalSpeakingTime / meetingDuration) * 100 : 0;
  const activeSpeakers = speakingDistribution.filter(p => p.value > 0).length;
  const participationRate = totalParticipants > 0 ? (activeSpeakers / totalParticipants) * 100 : 0;

  return (
    <Card variant="elevated" className="border-border">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          {isHostMode ? "Meeting Analytics" : "Speaking Analytics"}
          {currentSpeaker && (
            <Badge variant="secondary" className="ml-2">
              <Activity className="w-3 h-3 mr-1" />
              {currentSpeaker} speaking
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Stats - 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <Clock className="w-6 h-6 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatTime(totalSpeakingTime)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Total Speaking Time
            </div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatTime(averageSpeakingTime)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Average per Person
            </div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <Timer className="w-6 h-6 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatLongTime(meetingDuration)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Meeting Duration
            </div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <Target className="w-6 h-6 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {participationRate.toFixed(0)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Participation Rate
            </div>
          </div>
        </div>

        {/* Engagement Stats - 3 columns */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Users className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {activeSpeakers}/{totalParticipants}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Active Speakers
            </div>
          </div>

          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Activity className="w-5 h-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {queueActivity}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Queue Actions
            </div>
          </div>

          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Zap className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {directResponses}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Direct Responses
            </div>
          </div>
        </div>

        {/* Speaking Ratio Indicator */}
        {meetingDuration > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Speaking vs Meeting Time
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {speakingRatio.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(speakingRatio, 100)} className="h-2" />
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {formatTime(totalSpeakingTime)} speaking of {formatLongTime(meetingDuration)} total
            </div>
          </div>
        )}

        {/* Speaking Distribution */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Speaking Time Distribution
          </h4>
          {sortedDistribution.length > 0 ? (
            <div className="space-y-3">
              {sortedDistribution.slice(0, 8).map((participant, index) => {
                const percentage = maxTime > 0 ? (participant.value / maxTime) * 100 : 0;
                const totalTime = speakingDistribution.reduce((sum, p) => sum + p.value, 0);
                const sharePercentage = totalTime > 0 ? (participant.value / totalTime) * 100 : 0;
                
                return (
                  <div key={participant.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {participant.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatTime(participant.value)}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {sharePercentage.toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-3"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No speaking data available yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpeakingAnalytics;
