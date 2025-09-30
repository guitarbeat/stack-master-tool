import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface FacilitatorSession {
  meetingCode: string;
  facilitatorName: string;
  meetingTitle: string;
  timestamp: number;
}

const SESSION_KEY = 'facilitator_session';

export const useFacilitatorSession = () => {
  const [session, setSession] = useState<FacilitatorSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        // Check if session is not too old (24 hours)
        const isExpired = Date.now() - parsedSession.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired) {
          setSession(parsedSession);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading facilitator session:', error);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session to localStorage
  const saveSession = useCallback((sessionData: Omit<FacilitatorSession, 'timestamp'>) => {
    const newSession: FacilitatorSession = {
      ...sessionData,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
    } catch (error) {
      console.error('Error saving facilitator session:', error);
    }
  }, []);

  // Clear session
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
    } catch (error) {
      console.error('Error clearing facilitator session:', error);
    }
  }, []);

  // Restore session (navigate to facilitator view)
  const restoreSession = useCallback(() => {
    if (session) {
      navigate(`/facilitate/${session.meetingCode}`, {
        state: {
          facilitatorName: session.facilitatorName,
          meetingName: session.meetingTitle,
          meetingCode: session.meetingCode
        }
      });
    }
  }, [session, navigate]);

  // Check if user has an active facilitator session
  const hasActiveSession = useCallback(() => {
    return session !== null;
  }, [session]);

  // Get session info for display
  const getSessionInfo = useCallback(() => {
    if (!session) return null;
    
    return {
      meetingCode: session.meetingCode,
      facilitatorName: session.facilitatorName,
      meetingTitle: session.meetingTitle,
      timeAgo: getTimeAgo(session.timestamp)
    };
  }, [session]);

  return {
    session,
    isLoading,
    saveSession,
    clearSession,
    restoreSession,
    hasActiveSession,
    getSessionInfo
  };
};

// Helper function to get time ago string
function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}