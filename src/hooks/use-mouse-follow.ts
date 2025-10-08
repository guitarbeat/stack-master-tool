import { useRef, useState } from 'react';

interface UseMouseFollowOptions {
  enabled?: boolean;
  smoothness?: number;
}

interface MousePosition {
  x: number;
  y: number;
}

interface UseMouseFollowReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  mousePosition: MousePosition;
  isHovering: boolean;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

/**
 * Hook for tracking mouse position within a container
 * Provides basic mouse following functionality for interactive elements
 */
export function useMouseFollow(options: UseMouseFollowOptions = {}): UseMouseFollowReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!options.enabled) {
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return {
    containerRef,
    mousePosition,
    isHovering,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  };
}
