import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Undo2, Keyboard, Plus, Search, X } from "lucide-react";
import { Participant } from "@/types";

interface StackControlsProps {
  stack: Participant[];
  undoHistoryLength: number;
  showKeyboardShortcuts: boolean;
  onAddParticipant: (name: string) => void;
  onUndo: () => void;
  onToggleKeyboardShortcuts: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  recentParticipants: string[];
  onAddExistingToStack: (name: string) => void;
}

export const StackControls = ({
  stack,
  undoHistoryLength,
  showKeyboardShortcuts,
  onAddParticipant,
  onUndo,
  onToggleKeyboardShortcuts,
  onSearchChange,
  searchQuery,
  recentParticipants,
  onAddExistingToStack
}: StackControlsProps) => {
  const [newParticipantName, setNewParticipantName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    onAddParticipant(newParticipantName.trim());
    setNewParticipantName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddParticipant();
    }
  };

  return (
    <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800 mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Stack Facilitation</h1>
            <p className="text-gray-600 dark:text-zinc-400">
              Democratic discussion management tool for facilitators and stack keepers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center text-gray-600 dark:text-zinc-300">
              <Users className="w-5 h-5 mr-2" />
              <span>{stack.length} participants</span>
            </div>
            {undoHistoryLength > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onUndo}
                className="gap-2 hover-scale"
                title="Undo last action (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleKeyboardShortcuts}
              className="gap-2"
              title="Show keyboard shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-gray-600 dark:text-zinc-300 sm:hidden">
          <Users className="w-5 h-5" />
          <span>{stack.length} participants</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-zinc-100">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            Add Participant
          </h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Input
            ref={inputRef}
            placeholder="Enter participant name... (Ctrl+N)"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-12 text-base border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl"
          />
          <Button 
            onClick={handleAddParticipant} 
            disabled={!newParticipantName.trim()} 
            size="lg" 
            className="px-4 sm:px-8 h-12 floating-glow rounded-xl font-medium w-full sm:w-auto"
          >
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add to Stack</span>
          </Button>
        </div>

        {/* Recent Participants */}
        {recentParticipants.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Recent participants</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange("")}
                className="h-6 w-6 p-0"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {recentParticipants.map((name) => (
                <Button
                  key={name}
                  variant="ghost"
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

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        {showKeyboardShortcuts && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Keyboard Shortcuts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Add participant</span>
                <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">Ctrl+N</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Next speaker</span>
                <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">Enter</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Undo action</span>
                <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Focus search</span>
                <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">Ctrl+F</kbd>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};