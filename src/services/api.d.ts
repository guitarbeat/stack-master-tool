/**
 * API Service type definitions
 */

interface MeetingResponse {
  meetingId: string;
  meetingCode: string;
  meetingTitle: string;
  facilitatorName: string;
}

interface MeetingData {
  meetingId: string;
  meetingCode: string;
  meetingTitle: string;
  facilitatorName: string;
  createdAt: string;
}

declare class ApiService {
  createMeeting(facilitatorName: string, meetingTitle?: string): Promise<MeetingResponse>;
  getMeeting(meetingCode: string): Promise<MeetingData>;
  getJoinUrl(meetingCode: string): string;
  getSocketUrl(): string;
}

declare const apiService: ApiService;
export default apiService;
