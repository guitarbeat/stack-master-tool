import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Clock, TrendingUp } from "lucide-react";

interface SpeakingAnalyticsProps {
  speakingDistribution: Array<{
    name: string;
    value: number; // in seconds
  }>;
  totalSpeakingTime?: number;
  averageSpeakingTime?: number;
}

export const SpeakingAnalytics: React.FC<SpeakingAnalyticsProps> = ({
  speakingDistribution,
  totalSpeakingTime = 0,
  averageSpeakingTime = 0
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedDistribution = [...speakingDistribution].sort((a, b) => b.value - a.value);
  const maxTime = Math.max(...speakingDistribution.map(p => p.value), 1);

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-xl border-0">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Speaking Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <Clock className="w-6 h-6 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatTime(totalSpeakingTime)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Speaking Time
            </div>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatTime(averageSpeakingTime)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Average per Person
            </div>
          </div>
        </div>

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
