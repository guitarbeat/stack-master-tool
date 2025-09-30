import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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


  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm mb-6">
      {/* Main Navbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800">
        {/* Left: Title and Stats */}
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
              Stack Facilitation
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Democratic discussion management
            </p>
          </div>
          
          {/* Stack Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {stackLength} participants
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {undoHistoryLength > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onUndo}
              className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20"
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
            className="gap-1.5 text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title="Show keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
            <span className="hidden sm:inline">Shortcuts</span>
          </Button>
        </div>
      </div>

      {/* Add Participant Section */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            ref={inputRef}
            placeholder="Enter participant name... (Ctrl+N)"
            value={newParticipantName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAddToStack()}
            className="flex-1 h-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800"
          />
          <Button 
            onClick={onAddToStack} 
            disabled={!newParticipantName.trim()} 
            size="sm" 
            className="px-4 h-10 gap-2 min-w-[120px]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add to Stack</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      {showKeyboardShortcuts && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-md p-3">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-sm text-gray-900 dark:text-zinc-100">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1 text-xs text-gray-600 dark:text-zinc-400">
              <div><kbd className="kbd text-xs">Ctrl+N</kbd> Focus add input</div>
              <div><kbd className="kbd text-xs">Ctrl+F</kbd> Focus search</div>
              <div><kbd className="kbd text-xs">Enter</kbd> Next speaker</div>
              <div><kbd className="kbd text-xs">Ctrl+Z</kbd> Undo last action</div>
              <div><kbd className="kbd text-xs">?</kbd> Show/hide shortcuts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};