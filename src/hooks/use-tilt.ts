import { useRef, useEffect, useState } from 'react';

interface TiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  glare?: boolean;
  glareOpacity?: number;
  followMouse?: boolean;
  mouseFollowSmoothness?: number;
}

interface TiltState {
  tiltX: number;
  tiltY: number;
  scale: number;
}

interface MousePosition {
  x: number;
  y: number;
}

/**
 * Hook for creating 3D tilt effects on elements
 * Tracks mouse position and applies CSS transforms for realistic tilt animation
 */
export default function useTiltEffect(options: TiltOptions = {}) {
  const {
    maxTilt = 15,
    perspective = 1000,
    scale = 1.05,
    speed = 300,
    glare = false,
    glareOpacity = 0.3,
    followMouse = false,
    mouseFollowSmoothness = 0.1
  } = options;

  const cardsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const [tiltState, setTiltState] = useState<Record<number, TiltState>>({});
  const [mousePosition, setMousePosition] = useState<Record<number, MousePosition>>({});
  const [isHovering, setIsHovering] = useState<Record<number, boolean>>({});
  const animationFrameRef = useRef<number>();

  // Helper function to safely set refs
  const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      cardsRef.current.set(index, el);
    } else {
      cardsRef.current.delete(index);
    }
  };

  const updateTilt = (index: number, mouseX: number, mouseY: number, rect: DOMRect) => {
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt based on mouse position relative to center
    const tiltX = ((mouseY - centerY) / centerY) * maxTilt;
    const tiltY = -((mouseX - centerX) / centerX) * maxTilt;

    setTiltState(prev => ({
      ...prev,
      [index]: {
        tiltX: tiltX,
        tiltY: tiltY,
        scale: scale
      }
    }));
  };

  const resetTilt = (index: number) => {
    setTiltState(prev => ({
      ...prev,
      [index]: {
        tiltX: 0,
        tiltY: 0,
        scale: 1
      }
    }));
  };

  const handleMouseMove = (index: number) => (e: React.MouseEvent) => {
    const card = cardsRef.current.get(index);
    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (followMouse) {
      // Track mouse position for smooth following
      setMousePosition(prev => ({
        ...prev,
        [index]: { x: mouseX, y: mouseY }
      }));

      setIsHovering(prev => ({
        ...prev,
        [index]: true
      }));

      // Start smooth animation if not already running
      if (!animationFrameRef.current) {
        const animate = () => {
          Object.keys(mousePosition).forEach(idx => {
            const i = parseInt(idx);
            const pos = mousePosition[i];
            const hovering = isHovering[i];
            if (pos && hovering && cardsRef.current.has(i)) {
              const card = cardsRef.current.get(i)!;
              const rect = card.getBoundingClientRect();
              updateTilt(i, pos.x, pos.y, rect);
            }
          });
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    } else {
      // Immediate tilt update
      updateTilt(index, mouseX, mouseY, rect);
    }
  };

  const handleMouseEnter = (index: number) => () => {
    setIsHovering(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const handleMouseLeave = (index: number) => () => {
    setIsHovering(prev => ({
      ...prev,
      [index]: false
    }));

    if (followMouse && animationFrameRef.current) {
      // Stop animation when mouse leaves
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    resetTilt(index);
  };

  // Apply transforms to cards
  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      if (!card) {
        return;
      }

      const state = tiltState[index];
      if (!state) {
        return;
      }

      const transform = `
        perspective(${perspective}px)
        rotateX(${state.tiltX}deg)
        rotateY(${state.tiltY}deg)
        scale(${state.scale})
      `;

      card.style.transform = transform;
      card.style.transition = `transform ${speed}ms ease-out`;
    });
  }, [tiltState, perspective, speed]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    cardsRef,
    setCardRef,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    tiltState
  };
}
