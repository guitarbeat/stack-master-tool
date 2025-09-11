import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Filter, Clock } from "lucide-react";
import { StackItem } from "./StackItem";
import { Participant } from "@/types";

interface QueueListProps {
  stack: Participant[];
  filteredStack: Participant[];
  searchQuery: string;
  showAllUpNext: boolean;
  onRemoveFromStack: (id: string) => void;
  onInterventionSubmit: (participantName: string, type: 'direct-response' | 'clarifying-question' | 'point-of-process') => void;
  onFinishDirectResponse: () => void;
  onSetShowAllUpNext: (show: boolean) => void;
  onClearSearch: () => void;
}

export const QueueList = ({
  stack,
  filteredStack,
  searchQuery,
  showAllUpNext,
  onRemoveFromStack,
  onInterventionSubmit,
  onFinishDirectResponse,
  onSetShowAllUpNext,
  onClearSearch
}: QueueListProps) => {
  if (stack.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-zinc-400 text-lg mb-2">No one in stack</p>
        <p className="text-sm text-gray-400 dark:text-zinc-500">Add participants above to begin the discussion</p>
      </div>
    );
  }

  if (filteredStack.length === 0) {
    return (
      <div className="text-center py-12">
        <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-zinc-400 text-lg mb-2">No participants match your search</p>
        <p className="text-sm text-gray-400 dark:text-zinc-500">Try adjusting your search term</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearSearch}
          className="mt-3"
        >
          Clear Search
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Up Next Section */}
      {stack.length > 1 && (
        <div className="p-4 rounded-xl bg-muted/20 border border-muted/40">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Up next:</span>
            {!showAllUpNext ? (
              <>
                <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold border-accent/30 text-accent">
                  {stack[1].name}
                </span>
                {stack.length > 2 && (
                  <>
                    <span className="text-sm text-muted-foreground font-medium">+{stack.length - 2} more</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => onSetShowAllUpNext(true)}
                    >
                      Show more
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                {stack.slice(1).map((p) => (
                  <span key={p.id} className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold border-accent/30 text-accent">
                    {p.name}
                  </span>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => onSetShowAllUpNext(false)}
                >
                  Show less
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <Separator className="my-2" />

      {/* Queue Items */}
      <div className="space-y-3">
        {filteredStack.map((participant, index) => {
          const actualIndex = stack.findIndex(p => p.id === participant.id);
          const isCurrentSpeaker = actualIndex === 0;
          
          // Skip rendering the current speaker here since it's shown in the enhanced display above
          if (isCurrentSpeaker) return null;
          
          return (
            <StackItem
              key={participant.id}
              participant={participant}
              index={actualIndex}
              isCurrentSpeaker={false}
              isDirectResponse={false}
              onRemove={onRemoveFromStack}
              onIntervention={onInterventionSubmit}
              onFinishDirectResponse={undefined}
            />
          );
        })}
      </div>
    </div>
  );
};