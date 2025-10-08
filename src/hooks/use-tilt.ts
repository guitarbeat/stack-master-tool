import { useRef } from 'react';

/**
 * Stub implementation of useTiltEffect hook
 * Provides a ref for tilt effect containers without actual tilt functionality
 */
export default function useTiltEffect() {
  const cardsRef = useRef<HTMLDivElement>(null);
  // Stub implementation - no tilt effect
  return cardsRef;
}
