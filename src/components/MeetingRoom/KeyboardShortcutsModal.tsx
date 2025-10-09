interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: string | null;
}

/**
 * * Component for displaying keyboard shortcuts
 * Shows available keyboard shortcuts based on user mode
 */
export function KeyboardShortcutsModal({ isOpen, onClose, mode }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Keyboard Shortcuts</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">
          {mode === "host" && (
            <>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-900 dark:text-slate-100">Next Speaker</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-100">Enter</kbd>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-900 dark:text-slate-100">Undo Last Action</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-100">Ctrl+Z</kbd>
              </div>
            </>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-900 dark:text-slate-100">Show/Hide Shortcuts</span>
            <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-100">?</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}