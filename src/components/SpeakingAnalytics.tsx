import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

interface SpeakingSegment {
  participantId: string;
  participantName: string;
  durationMs: number;
  isDirectResponse: boolean;
}

interface SpeakingAnalyticsProps {
  speakingHistory: SpeakingSegment[];
  includeDirectResponsesInChart: boolean;
  onToggleIncludeDirectResponses: () => void;
}

export const SpeakingAnalytics = ({
  speakingHistory,
  includeDirectResponsesInChart,
  onToggleIncludeDirectResponses
}: SpeakingAnalyticsProps) => {
  if (speakingHistory.length === 0) {
    return null;
  }

  // Calculate speaking time totals
  const totals = new Map<string, { name: string; ms: number }>();
  
  for (const seg of speakingHistory) {
    if (!includeDirectResponsesInChart && seg.isDirectResponse) continue;
    const key = seg.participantId;
    const prev = totals.get(key) || { name: seg.participantName, ms: 0 };
    prev.ms += seg.durationMs;
    totals.set(key, prev);
  }

  const chartData = Array.from(totals.values())
    .map(item => ({
      name: item.name,
      value: Math.round(item.ms / 1000), // Convert to seconds
      ms: item.ms
    }))
    .sort((a, b) => b.value - a.value);

  const totalSeconds = chartData.reduce((sum, item) => sum + item.value, 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00'
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-zinc-100">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Speaking Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={includeDirectResponsesInChart ? "default" : "outline"}
              size="sm"
              onClick={onToggleIncludeDirectResponses}
              className="text-xs"
              title="Toggle including direct responses"
            >
              {includeDirectResponsesInChart ? "Including Direct Responses" : "Excluding Direct Responses"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalMinutes} minutes</p>
            <p className="text-sm text-muted-foreground">Total speaking time</p>
          </div>
          
          {chartData.length > 0 && (
            <div className="h-64">
              <ChartContainer
                config={{
                  value: {
                    formatter: (value) => formatDuration(value as number),
                  },
                }}
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${formatDuration(value)}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};