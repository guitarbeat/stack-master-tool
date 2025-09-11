import React from 'react'
import { Plus, UserPlus } from 'lucide-react'
import { useMouseFollow } from '@/hooks/use-mouse-follow'

interface ModeToggleProps {
  mode: 'create' | 'join'
  step: number
  onSelectCreate: () => void
  onSelectJoin: () => void
}

function ModeToggle({ mode, step, onSelectCreate, onSelectJoin }: ModeToggleProps): JSX.Element | null {
  if (step !== 1) return null

  const { containerRef, mousePosition, isHovering, handleMouseMove, handleMouseEnter, handleMouseLeave } = useMouseFollow({
    enabled: true,
    smoothness: 0.2
  })

  // Calculate indicator position based on mouse or selected state
  const getIndicatorStyle = () => {
    if (isHovering) {
      // Follow mouse position when hovering
      const containerWidth = containerRef.current?.offsetWidth || 0
      const indicatorWidth = containerWidth / 2 - 6
      const mouseX = mousePosition.x
      
      // Constrain to valid positions
      const leftPosition = Math.max(1.5, Math.min(mouseX - indicatorWidth / 2, containerWidth - indicatorWidth - 1.5))
      
      return {
        left: `${leftPosition}px`,
        width: `${indicatorWidth}px`,
        background: mouseX < containerWidth / 2 
          ? 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))'
          : 'linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--sage-green)))'
      }
    } else {
      // Use selected state when not hovering
      return mode === 'create' 
        ? {
            left: '6px',
            width: 'calc(50% - 6px)',
            background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))'
          }
        : {
            left: 'calc(50% + 3px)',
            width: 'calc(50% - 6px)',
            background: 'linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--sage-green)))'
          }
    }
  }

  return (
    <div className="flex justify-center mb-8 px-4">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative bg-gradient-to-r from-muted/50 to-muted/30 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-xl p-1.5 flex backdrop-blur-sm border border-border/50 shadow-elegant w-full max-w-md"
      >
        <div 
          className="toggle-indicator"
          style={getIndicatorStyle()}
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

