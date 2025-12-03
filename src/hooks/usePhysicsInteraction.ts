import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================
// PHYSICS CONSTANTS
// ============================================
export const PHYSICS_CONSTANTS = {
  // Damping resistance (0-1, lower = more resistance)
  overscrollResistance: 0.5,
  // Snap threshold as percentage of range
  snapThreshold: 0.15,
  // Minimum drag distance to trigger snap
  minDragDistance: 10,
  // Spring stiffness for animations
  springStiffness: 0.15,
  // Friction coefficient
  friction: 0.92,
};

// ============================================
// DETENT STATES
// ============================================
export enum Detent {
  Collapsed = 'collapsed',
  Half = 'half',
  Full = 'full',
}

// ============================================
// useOverscroll - Rubber band effect
// ============================================
interface UseOverscrollOptions {
  resistance?: number;
  maxOverscroll?: number;
  onOverscrollChange?: (amount: number) => void;
}

interface UseOverscrollReturn {
  overscroll: number;
  isDragging: boolean;
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
  style: React.CSSProperties;
}

export function useOverscroll(options: UseOverscrollOptions = {}): UseOverscrollReturn {
  const {
    resistance = PHYSICS_CONSTANTS.overscrollResistance,
    maxOverscroll = 100,
    onOverscrollChange,
  } = options;

  const [overscroll, setOverscroll] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleMove = useCallback((clientY: number) => {
    const delta = clientY - startY.current;
    const dampedDelta = delta * resistance;
    const clampedOverscroll = Math.max(-maxOverscroll, Math.min(maxOverscroll, dampedDelta));
    
    setOverscroll(clampedOverscroll);
    onOverscrollChange?.(clampedOverscroll);
    currentY.current = clientY;
  }, [resistance, maxOverscroll, onOverscrollChange]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setOverscroll(0);
    onOverscrollChange?.(0);
  }, [onOverscrollChange]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientY);
    };
    const onEnd = () => handleEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const startDrag = useCallback((clientY: number) => {
    startY.current = clientY;
    currentY.current = clientY;
    setIsDragging(true);
  }, []);

  return {
    overscroll,
    isDragging,
    handlers: {
      onMouseDown: (e: React.MouseEvent) => startDrag(e.clientY),
      onTouchStart: (e: React.TouchEvent) => {
        if (e.touches[0]) startDrag(e.touches[0].clientY);
      },
    },
    style: {
      '--overscroll-amount': `${overscroll}px`,
      transform: isDragging ? `translateY(${overscroll}px)` : undefined,
      transition: isDragging ? 'none' : undefined,
    } as React.CSSProperties,
  };
}

// ============================================
// useSnapDetent - Snap to discrete states
// ============================================
interface UseSnapDetentOptions {
  initialDetent?: Detent;
  snapThreshold?: number;
  onDetentChange?: (detent: Detent) => void;
}

interface UseSnapDetentReturn {
  detent: Detent;
  setDetent: (detent: Detent) => void;
  position: number; // 0 = collapsed, 0.5 = half, 1 = full
  isDragging: boolean;
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
}

export function useSnapDetent(
  containerHeight: number,
  options: UseSnapDetentOptions = {}
): UseSnapDetentReturn {
  const {
    initialDetent = Detent.Half,
    snapThreshold = PHYSICS_CONSTANTS.snapThreshold,
    onDetentChange,
  } = options;

  const [detent, setDetentState] = useState<Detent>(initialDetent);
  const [position, setPosition] = useState(initialDetent === Detent.Full ? 1 : initialDetent === Detent.Half ? 0.5 : 0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startPosition = useRef(0);

  const setDetent = useCallback((newDetent: Detent) => {
    setDetentState(newDetent);
    setPosition(newDetent === Detent.Full ? 1 : newDetent === Detent.Half ? 0.5 : 0);
    onDetentChange?.(newDetent);
  }, [onDetentChange]);

  const handleMove = useCallback((clientY: number) => {
    const delta = startY.current - clientY;
    const deltaPercent = delta / containerHeight;
    const newPosition = Math.max(0, Math.min(1, startPosition.current + deltaPercent));
    setPosition(newPosition);
  }, [containerHeight]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    
    // Snap to nearest detent
    let newDetent: Detent;
    if (position < snapThreshold) {
      newDetent = Detent.Collapsed;
    } else if (position > 1 - snapThreshold) {
      newDetent = Detent.Full;
    } else if (Math.abs(position - 0.5) < snapThreshold) {
      newDetent = Detent.Half;
    } else if (position < 0.5) {
      newDetent = position < 0.25 ? Detent.Collapsed : Detent.Half;
    } else {
      newDetent = position > 0.75 ? Detent.Full : Detent.Half;
    }
    
    setDetent(newDetent);
  }, [position, snapThreshold, setDetent]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) handleMove(e.touches[0].clientY);
    };
    const onEnd = () => handleEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const startDrag = useCallback((clientY: number) => {
    startY.current = clientY;
    startPosition.current = position;
    setIsDragging(true);
  }, [position]);

  return {
    detent,
    setDetent,
    position,
    isDragging,
    handlers: {
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        startDrag(e.clientY);
      },
      onTouchStart: (e: React.TouchEvent) => {
        if (e.touches[0]) startDrag(e.touches[0].clientY);
      },
    },
  };
}

// ============================================
// useDragPhysics - Full physics-based drag
// ============================================
interface UseDragPhysicsOptions {
  axis?: 'x' | 'y' | 'both';
  bounds?: { min: number; max: number };
  resistance?: number;
  snapPoints?: number[];
  onDragStart?: () => void;
  onDragEnd?: (position: number) => void;
  onPositionChange?: (position: number) => void;
}

interface UseDragPhysicsReturn {
  position: number;
  velocity: number;
  isDragging: boolean;
  isOverscrolling: boolean;
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
  style: React.CSSProperties;
}

export function useDragPhysics(options: UseDragPhysicsOptions = {}): UseDragPhysicsReturn {
  const {
    axis = 'y',
    bounds = { min: 0, max: 300 },
    resistance = PHYSICS_CONSTANTS.overscrollResistance,
    snapPoints = [],
    onDragStart,
    onDragEnd,
    onPositionChange,
  } = options;

  const [position, setPosition] = useState(bounds.min);
  const [velocity, setVelocity] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverscrolling, setIsOverscrolling] = useState(false);
  
  const startPos = useRef(0);
  const startDragPos = useRef(0);
  const lastPos = useRef(0);
  const lastTime = useRef(0);
  const animationFrame = useRef<number>();

  const getClientPos = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches[0]) {
      return axis === 'x' ? e.touches[0].clientX : e.touches[0].clientY;
    }
    if ('clientX' in e) {
      return axis === 'x' ? e.clientX : e.clientY;
    }
    return 0;
  }, [axis]);

  const handleMove = useCallback((clientPos: number) => {
    const delta = clientPos - startDragPos.current;
    let newPosition = startPos.current + delta;
    
    // Apply resistance when outside bounds
    if (newPosition < bounds.min) {
      const overscroll = bounds.min - newPosition;
      newPosition = bounds.min - (overscroll * resistance);
      setIsOverscrolling(true);
    } else if (newPosition > bounds.max) {
      const overscroll = newPosition - bounds.max;
      newPosition = bounds.max + (overscroll * resistance);
      setIsOverscrolling(true);
    } else {
      setIsOverscrolling(false);
    }
    
    // Calculate velocity
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      const newVelocity = (clientPos - lastPos.current) / dt;
      setVelocity(newVelocity);
    }
    lastPos.current = clientPos;
    lastTime.current = now;
    
    setPosition(newPosition);
    onPositionChange?.(newPosition);
  }, [bounds, resistance, onPositionChange]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setIsOverscrolling(false);
    
    // Find nearest snap point or clamp to bounds
    let finalPosition = position;
    
    if (position < bounds.min) {
      finalPosition = bounds.min;
    } else if (position > bounds.max) {
      finalPosition = bounds.max;
    } else if (snapPoints.length > 0) {
      // Find nearest snap point
      const nearest = snapPoints.reduce((prev, curr) => 
        Math.abs(curr - position) < Math.abs(prev - position) ? curr : prev
      );
      finalPosition = nearest;
    }
    
    setPosition(finalPosition);
    setVelocity(0);
    onDragEnd?.(finalPosition);
    onPositionChange?.(finalPosition);
  }, [position, bounds, snapPoints, onDragEnd, onPositionChange]);

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      if ('cancelable' in e && e.cancelable) {
        e.preventDefault();
      }
      handleMove(getClientPos(e));
    };
    
    const onEnd = () => handleEnd();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isDragging, handleMove, handleEnd, getClientPos]);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientPos = getClientPos(e);
    startDragPos.current = clientPos;
    startPos.current = position;
    lastPos.current = clientPos;
    lastTime.current = Date.now();
    setIsDragging(true);
    onDragStart?.();
  }, [position, getClientPos, onDragStart]);

  const transform = axis === 'x' 
    ? `translateX(${position}px)` 
    : `translateY(${position}px)`;

  return {
    position,
    velocity,
    isDragging,
    isOverscrolling,
    handlers: {
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        startDrag(e);
      },
      onTouchStart: (e: React.TouchEvent) => startDrag(e),
    },
    style: {
      transform,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  };
}

// ============================================
// useMinimize - Scale/opacity based on position
// ============================================
interface UseMinimizeOptions {
  threshold?: number; // Height below which minimization starts
  range?: number; // Range over which minimization occurs
}

interface UseMinimizeReturn {
  factor: number; // 0 = normal, 1 = fully minimized
  style: React.CSSProperties;
}

export function useMinimize(
  currentHeight: number,
  options: UseMinimizeOptions = {}
): UseMinimizeReturn {
  const { threshold = 100, range = 50 } = options;
  
  const factor = currentHeight < threshold
    ? Math.min(1, (threshold - currentHeight) / range)
    : 0;

  return {
    factor,
    style: {
      '--minimize-factor': factor,
      transform: `scale(${1 - factor * 0.1})`,
      opacity: 1 - factor * 0.3,
    } as React.CSSProperties,
  };
}
