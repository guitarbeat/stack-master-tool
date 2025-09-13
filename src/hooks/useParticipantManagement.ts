import { useState, useEffect, useCallback } from 'react';

export const useParticipantManagement = () => {
  const [recentParticipants, setRecentParticipants] = useState<string[]>([]);

  // Load recent participants from localStorage (persist across page reloads)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('manualStackRecentParticipants');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentParticipants(parsed.filter((n) => typeof n === 'string'));
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem('manualStackRecentParticipants', JSON.stringify(recentParticipants));
    } catch {
      // ignore storage failures
    }
  }, [recentParticipants]);

  const addRecentParticipant = useCallback((name: string) => {
    setRecentParticipants(prev => {
      const without = prev.filter(n => n.toLowerCase() !== name.toLowerCase());
      return [...without, name];
    });
  }, []);

  const addExistingToStack = useCallback((name: string, addToStackFn: (name: string) => any) => {
    addRecentParticipant(name);
    return addToStackFn(name);
  }, [addRecentParticipant]);

  return {
    recentParticipants,
    addRecentParticipant,
    addExistingToStack
  };
};