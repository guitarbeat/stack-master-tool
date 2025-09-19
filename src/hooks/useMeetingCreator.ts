import { useState, useEffect, useCallback } from 'react';

interface MeetingCreatorInfo {
  meetingCode: string;
  facilitatorName: string;
  meetingTitle: string;
}

const STORAGE_KEY = 'meeting_creator_info';

export function useMeetingCreator() {
  const [creatorInfo, setCreatorInfo] = useState<MeetingCreatorInfo | null>(null);

  // Load creator info from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCreatorInfo(parsed);
      }
    } catch (error) {
      console.error('Error loading meeting creator info:', error);
    }
  }, []);

  // Save creator info to localStorage
  const setCreator = useCallback((info: MeetingCreatorInfo) => {
    setCreatorInfo(info);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch (error) {
      console.error('Error saving meeting creator info:', error);
    }
  }, []);

  // Clear creator info
  const clearCreator = useCallback(() => {
    setCreatorInfo(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing meeting creator info:', error);
    }
  }, []);

  // Check if current user is creator of a specific meeting
  const isCreatorOf = useCallback((meetingCode: string) => {
    return creatorInfo?.meetingCode === meetingCode;
  }, [creatorInfo]);

  return {
    creatorInfo,
    setCreator,
    clearCreator,
    isCreatorOf,
    isCreator: !!creatorInfo
  };
}