import React from 'react'
import { Plus, UserPlus } from 'lucide-react'

interface ModeToggleProps {
  mode: 'create' | 'join'
  step: number
  onSelectCreate: () => void
  onSelectJoin: () => void
}

function ModeToggle({ mode, step, onSelectCreate, onSelectJoin }: ModeToggleProps): JSX.Element | null {
  if (step !== 1) return null

  return (
    <div className="flex justify-center mb-8 px-4">
      <div className="relative bg-gradient-to-r from-muted/50 to-muted/30 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-xl p-1.5 flex backdrop-blur-sm border border-border/50 shadow-elegant w-full max-w-md">
        <div 
          className={`toggle-indicator ${
            mode === 'create' 
              ? 'left-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-primary to-accent' 
              : 'left-[calc(50%+3px)] w-[calc(50%-6px)] bg-gradient-to-r from-moss-green to-sage-green'
          }`}
        />
        <button
          onClick={onSelectCreate}
          className={`toggle-button relative z-10 px-4 sm:px-6 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
            mode === 'create'
              ? 'text-white shadow-sm transform scale-[1.02]'
              : 'text-foreground/70 hover:text-foreground hover:scale-[1.01] dark:text-zinc-300 dark:hover:text-zinc-100'
          }`}
        >
          <Plus className={`w-4 h-4 mr-2 transition-all duration-300 ${
            mode === 'create' ? 'text-white' : 'text-primary'
          }`} />
          <span className="hidden sm:inline">Left</span>
          <span className="sm:hidden">Left</span>
        </button>
        <button
          onClick={onSelectJoin}
          className={`toggle-button relative z-10 px-4 sm:px-6 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
            mode === 'join'
              ? 'text-white shadow-sm transform scale-[1.02]'
              : 'text-foreground/70 hover:text-foreground hover:scale-[1.01] dark:text-zinc-300 dark:hover:text-zinc-100'
          }`}
        >
          <UserPlus className={`w-4 h-4 mr-2 transition-all duration-300 ${
            mode === 'join' ? 'text-white' : 'text-moss-green'
          }`} />
          <span className="hidden sm:inline">Right</span>
          <span className="sm:hidden">Right</span>
        </button>
      </div>
    </div>
  )
}

export default ModeToggle

