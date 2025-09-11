import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Undo2, Keyboard } from "lucide-react";

interface StackHeaderProps {
  stackLength: number;
  undoHistoryLength: number;
  onUndo: () => void;
  onToggleShortcuts: () => void;
  showKeyboardShortcuts: boolean;
}

export const StackHeader = ({
  stackLength,
  undoHistoryLength,
  onUndo,
  onToggleShortcuts,
  showKeyboardShortcuts
}: StackHeaderProps) => {
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
              <span>{stackLength} participants</span>
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
              onClick={onToggleShortcuts}
              className="gap-2"
              title="Show keyboard shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-gray-600 dark:text-zinc-300 sm:hidden">
          <Users className="w-5 h-5" />
          <span>{stackLength} participants</span>
        </div>
      </CardHeader>
    </Card>
  );
};