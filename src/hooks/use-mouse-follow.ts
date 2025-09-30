import { useState, useRef, useCallback } from 'react'

interface MouseFollowOptions {
  enabled?: boolean
  smoothness?: number
}

export function useMouseFollow(options: MouseFollowOptions = {}) {
  const { enabled = true, smoothness = 0.15 } = options
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Cancel previous animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Smooth animation
    const animate = () => {
      setMousePosition(prev => ({
        x: prev.x + (x - prev.x) * smoothness,
        y: prev.y + (y - prev.y) * smoothness
      }))
      
      if (Math.abs(x - mousePosition.x) > 0.1 || Math.abs(y - mousePosition.y) > 0.1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [enabled, smoothness, mousePosition.x, mousePosition.y])

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
  }, [])

  return {
    containerRef,
    mousePosition,
    isHovering,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  }
}