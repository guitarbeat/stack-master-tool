declare module '@/services/api' {
  interface MeetingData {
    meetingId: string;
    meetingCode: string;
    meetingTitle: string;
    facilitatorName: string;
  }

  interface MeetingInfo {
    id: string;
    code: string;
    title: string;
    facilitator: string;
    createdAt: string;
  }

  class ApiService {
    getBaseUrl(): string;
    createMeeting(facilitatorName: string, meetingTitle: string): Promise<MeetingData>;
    getMeeting(meetingCode: string): Promise<MeetingInfo>;
    getJoinUrl(meetingCode: string): string;
    getSocketUrl(): string;
  }

  const apiService: ApiService;
  export default apiService;
}