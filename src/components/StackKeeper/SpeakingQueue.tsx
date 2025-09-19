import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, Filter, Search, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StackItem } from "../StackItem";
import { Participant } from "@/types";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

interface SpeakingQueueProps {
  stack: Participant[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRemoveFromStack: (id: string) => void;
  onIntervention: (participantName: string, type: string) => void;
  onFinishDirectResponse: () => void;
  onClearAll: () => void;
  onReorderStack: (dragIndex: number, targetIndex: number) => void;
  recentParticipants: string[];
  onAddExistingToStack: (name: string) => void;
  directResponseParticipantId: string;
}

export const SpeakingQueue = ({
  stack,
  searchQuery,
  onSearchChange,
  onRemoveFromStack,
  onIntervention,
  onFinishDirectResponse,
  onClearAll,
  onReorderStack,
  recentParticipants,
  onAddExistingToStack,
  directResponseParticipantId
}: SpeakingQueueProps) => {
  const {
    dragIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isDragOver
  } = useDragAndDrop();

  const filteredStack = stack.filter(participant =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800 mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-4 text-2xl font-semibold text-gray-900 dark:text-zinc-100">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          Speaking Queue
          <span className="ml-3 inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium">
            {filteredStack.length} {filteredStack.length === 1 ? 'person' : 'people'}
            {searchQuery && ` (${stack.length} total)`}
          </span>
        </CardTitle>
        <div className="flex items-center gap-3">
          {stack.length > 0 && (
            <span className="hidden md:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-accent border-accent/30">
              <span role="img" aria-label="mic">🎤</span>
              <span>Speaking</span>
              <span className="text-foreground">{stack[0].name}</span>
            </span>
          )}
          {stack.length > 1 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search participants... (Ctrl+F)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-8 w-48 h-9 text-sm rounded-xl"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSearchChange("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full p-0"
                  title="Clear search"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </div>
          )}
          {stack.length > 0 && (
            <Button variant="destructive" size="sm" onClick={onClearAll} className="floating-glow rounded-xl">
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-6">
        {recentParticipants.length > 0 && (
          <div className="-mt-1">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 whitespace-nowrap">Recent Participants</span>
              {recentParticipants.slice().reverse().map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  className="rounded-full h-7 px-2 text-xs"
                  onClick={() => onAddExistingToStack(name)}
                  title={`Add ${name} to stack`}
                >
                  <Plus className="h-3 w-3 mr-1" /> {name}
                </Button>
              ))}
            </div>
          </div>
        )}
        {stack.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-zinc-400 text-lg mb-2">No one in stack</p>
            <p className="text-sm text-gray-400 dark:text-zinc-500">Add participants above to begin the discussion</p>
          </div>
        ) : filteredStack.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-zinc-400 text-lg mb-2">No participants match your search</p>
            <p className="text-sm text-gray-400 dark:text-zinc-500">Try adjusting your search term</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSearchChange("")} 
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStack.map((participant, index) => {
              const actualIndex = stack.findIndex(p => p.id === participant.id);
              const isCurrentSpeaker = actualIndex === 0;
              
              // Skip rendering the current speaker here since it's shown in the enhanced display above
              if (isCurrentSpeaker) return null;
              
              return (
                <div
                  key={participant.id}
                  className={`fade-in ${isDragOver(actualIndex) ? 'ring-2 ring-primary/40 rounded-xl' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  draggable
                  onDragStart={() => handleDragStart(actualIndex)}
                  onDragOver={(e) => handleDragOver(e, actualIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(actualIndex, onReorderStack)}
                  onDragEnd={handleDragEnd}
                >
                  <StackItem
                    participant={participant}
                    index={actualIndex}
                    isCurrentSpeaker={false}
                    isDirectResponse={directResponseParticipantId === participant.id}
                    onRemove={onRemoveFromStack}
                    onIntervention={onIntervention}
                    onFinishDirectResponse={onFinishDirectResponse}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};