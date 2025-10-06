import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Keyboard } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useKeyboardShortcutsHelp } from './KeyboardShortcuts';

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const shortcuts = useKeyboardShortcutsHelp();

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="w-64 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              <span className="font-semibold text-sm">Keyboard Shortcuts</span>
            </div>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}