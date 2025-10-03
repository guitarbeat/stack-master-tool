
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

interface SpeakingDistributionProps {
  speakingData: Array<{ name: string; value: number }>;
  includeDirectResponses: boolean;
  onToggleIncludeDirectResponses: () => void;
}

export const SpeakingDistribution = ({
  speakingData,
  includeDirectResponses,
  onToggleIncludeDirectResponses
}: SpeakingDistributionProps) => {
  const COLORS = [
    "#6366F1","#10B981","#F59E0B","#EF4444","#3B82F6","#8B5CF6","#14B8A6","#F97316","#22C55E","#E11D48"
  ];

  return (
    <div className="mt-8">
      <ExpandableCard
        className="bg-white rounded-2xl p-0 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800"
        trigger={
          <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-zinc-100 truncate">Speaking Distribution</h3>
                <p className="text-xs text-muted-foreground hidden sm:block">Pie chart of who has talked the most</p>
              </div>
            </div>
            <Button
              variant={includeDirectResponses ? "default" : "outline"}
              size="sm"
              className="rounded-xl text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 min-w-0 flex-shrink-0"
              onClick={(e) => {
                e.preventDefault();
                onToggleIncludeDirectResponses();
              }}
              title="Toggle including direct responses"
            >
              <span className="hidden sm:inline">
                {includeDirectResponses ? "Including Direct Responses" : "Excluding Direct Responses"}
              </span>
              <span className="sm:hidden">
                {includeDirectResponses ? "With DR" : "No DR"}
              </span>
            </Button>
          </div>
        }
        contentClassName="p-0"
      >
        <div className="p-4 sm:p-6">
          <div className="w-full">
            <ChartContainer
              config={{}}
              className="w-full h-72"
            >
              <PieChart>
                <Pie dataKey="value" data={speakingData} cx="50%" cy="50%" outerRadius={90} label>
                  {speakingData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </ExpandableCard>
    </div>
  );
};