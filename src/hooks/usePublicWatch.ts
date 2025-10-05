// @ts-nocheck - Legacy API service during migration
import { useState, useEffect } from "react";
import apiService from "../services/api.js";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";

interface Participant {
  id: string;
  name: string;
  isFacilitator?: boolean;
}

interface QueueEntry {
  id: string;
  participantName: string;
  type: string;
  timestamp: number;
}

export const usePublicWatch = (meetingCode: string) => {
  const [meetingData, setMeetingData] = useState<any>(null);
  const [participants] = useState<Participant[]>([]);
  const [speakingQueue] = useState<QueueEntry[]>([]);
  const [currentSpeaker] = useState<QueueEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchMeetingData = async () => {
      if (!meetingCode) return;

      try {
        setIsLoading(true);
        const meeting = await apiService.getMeeting(meetingCode);
        setMeetingData(meeting);
        setError("");
      } catch (err) {
        console.error("Error fetching meeting:", err);
        const errorInfo = getErrorDisplayInfo(err as AppError);
        setError(errorInfo.description);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetingData();
  }, [meetingCode]);

  // For now, return static data since we don't have real-time updates
  // In a real implementation, you'd want to add WebSocket connection for live updates
  return {
    meetingData,
    participants,
    speakingQueue,
    currentSpeaker,
    isLoading,
    error,
  };
};
