import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Undo2, Keyboard, Plus } from "lucide-react";

interface CombinedNavbarProps {
  stackLength: number;
  undoHistoryLength: number;
  onUndo: () => void;
  onToggleShortcuts: () => void;
  showKeyboardShortcuts: boolean;
  newParticipantName: string;
  onNameChange: (name: string) => void;
  onAddToStack: () => void;
  onFocusAddInput: () => void;
}

export const CombinedNavbar = ({
  stackLength,
  undoHistoryLength,
  onUndo,
  onToggleShortcuts,
  showKeyboardShortcuts,
  newParticipantName,
  onNameChange,
  onAddToStack,
  onFocusAddInput
}: CombinedNavbarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocusAddInput = () => {
    inputRef.current?.focus();
    onFocusAddInput();
  };

  return (
    <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800 mb-8">
      <CardContent className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
              Stack Facilitation
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 text-base leading-relaxed">
              Democratic discussion management tool for facilitators and stack keepers
            </p>
          </div>
          
          {/* Stats and Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center text-gray-700 dark:text-zinc-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-700 px-4 py-3 rounded-xl border border-blue-200 dark:border-zinc-600">
              <Users className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stackLength}</div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">participants</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {undoHistoryLength > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onUndo}
                  className="gap-2 hover-scale border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-700 dark:hover:bg-orange-900/20"
                  title="Undo last action (Ctrl+Z)"
                >
                  <Undo2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Undo</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleShortcuts}
                className="gap-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
                title="Show keyboard shortcuts"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Add Participant Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-700 rounded-xl p-6 border border-gray-200 dark:border-zinc-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
              Add to Stack
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              ref={inputRef}
              placeholder="Enter participant name... (Ctrl+N)"
              value={newParticipantName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAddToStack()}
              className="flex-1 h-12 text-base border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl bg-white dark:bg-zinc-900"
            />
            <Button 
              onClick={onAddToStack} 
              disabled={!newParticipantName.trim()} 
              size="lg" 
              className="px-8 h-12 floating-glow rounded-xl font-medium gap-2 min-w-[140px]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add to Stack</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        {showKeyboardShortcuts && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-zinc-100">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><kbd className="kbd">Ctrl+N</kbd> Focus add input</div>
              <div><kbd className="kbd">Ctrl+F</kbd> Focus search</div>
              <div><kbd className="kbd">Enter</kbd> Next speaker</div>
              <div><kbd className="kbd">Ctrl+Z</kbd> Undo last action</div>
              <div><kbd className="kbd">?</kbd> Show/hide shortcuts</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};