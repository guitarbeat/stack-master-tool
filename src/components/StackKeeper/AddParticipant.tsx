import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Keyboard } from "lucide-react";

interface AddParticipantProps {
  newParticipantName: string;
  onNameChange: (name: string) => void;
  onAddToStack: () => void;
  onFocusAddInput: () => void;
  showKeyboardShortcuts: boolean;
}

export const AddParticipant = ({
  newParticipantName,
  onNameChange,
  onAddToStack,
  onFocusAddInput,
  showKeyboardShortcuts
}: AddParticipantProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocusAddInput = () => {
    inputRef.current?.focus();
    onFocusAddInput();
  };

  return (
    <Card className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800 mb-8">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-zinc-100">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            Add to Stack
          </h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Input
            ref={inputRef}
            placeholder="Enter participant name... (Ctrl+N)"
            value={newParticipantName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAddToStack()}
            className="flex-1 h-12 text-base border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl"
          />
          <Button 
            onClick={onAddToStack} 
            disabled={!newParticipantName.trim()} 
            size="lg" 
            className="px-4 sm:px-8 h-12 floating-glow rounded-xl font-medium w-full sm:w-auto"
          >
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add to Stack</span>
          </Button>
        </div>
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