import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Trash2 } from "lucide-react";
import { SpecialIntervention, INTERVENTION_TYPES } from "@/types";

interface InterventionsPanelProps {
  interventions: SpecialIntervention[];
  onClearInterventions: () => void;
}

export const InterventionsPanel = ({
  interventions,
  onClearInterventions
}: InterventionsPanelProps) => {
  if (interventions.length === 0) {
    return (
      <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-zinc-100">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            Interventions & Moderation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              Click intervention buttons on each participant to log activities.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-zinc-100">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          Interventions & Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Click intervention buttons on each participant to log activities.
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
              Recent Activity ({interventions.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearInterventions}
              className="hover:bg-destructive/10 hover:text-destructive rounded-xl h-8 px-3 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear History
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {interventions.slice(-5).reverse().map((intervention, index) => (
              <div
                key={intervention.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 text-sm fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="shrink-0 text-xs px-2 py-0 inline-flex items-center rounded-full border font-semibold">
                  {intervention.type.replace('-', ' ')}
                </span>
                <span className="font-medium">{intervention.participant}</span>
                <span className="text-xs text-gray-500 dark:text-zinc-500 ml-auto">
                  {intervention.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};