import { useState, useEffect } from "react";
import apiService from "../services/api.js";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";

export const usePublicWatch = (meetingCode: string) => {
  const [meetingData, setMeetingData] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [speakingQueue, setSpeakingQueue] = useState<any[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<any>(null);
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
    participants: [], // Would be populated from real-time updates
    speakingQueue: [], // Would be populated from real-time updates
    currentSpeaker: null, // Would be populated from real-time updates
    isLoading,
    error,
  };
};
