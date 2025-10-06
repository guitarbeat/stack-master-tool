import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface KeyboardShortcutsProps {
  onQuickAdd?: () => void;
  onNextSpeaker?: () => void;
  onUndo?: () => void;
  disabled?: boolean;
}

export function KeyboardShortcuts({
  onQuickAdd,
  onNextSpeaker,
  onUndo,
  disabled = false
}: KeyboardShortcutsProps) {
  // Quick add shortcut (Ctrl/Cmd + Shift + A)
  useHotkeys('ctrl+shift+a, cmd+shift+a', (e) => {
    if (disabled || !onQuickAdd) return;
    e.preventDefault();
    onQuickAdd();
  }, { enabled: !disabled && !!onQuickAdd });

  // Next speaker shortcut (Space or Ctrl/Cmd + N)
  useHotkeys('space, ctrl+n, cmd+n', (e) => {
    if (disabled || !onNextSpeaker) return;
    e.preventDefault();
    onNextSpeaker();
  }, { enabled: !disabled && !!onNextSpeaker });

  // Undo shortcut (Ctrl/Cmd + Z)
  useHotkeys('ctrl+z, cmd+z', (e) => {
    if (disabled || !onUndo) return;
    e.preventDefault();
    onUndo();
  }, { enabled: !disabled && !!onUndo });

  return null; // This component doesn't render anything
}

// Helper hook for showing keyboard shortcuts help
export function useKeyboardShortcutsHelp() {
  const shortcuts = [
    { key: 'Ctrl+Shift+A', description: 'Quick add participant' },
    { key: 'Space / Ctrl+N', description: 'Next speaker' },
    { key: 'Ctrl+Z', description: 'Undo last action' },
  ];

  return shortcuts;
}