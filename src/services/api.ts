// Temporary API service stub to resolve build issues
// This should be replaced with proper Supabase integration

export interface CreateMeetingResponse {
  meetingCode: string;
  meetingId: string;
  shareableLink: string;
}

export default {
  async createMeeting(
    facilitatorName: string,
    meetingName: string
  ): Promise<CreateMeetingResponse> {
    // This is a stub implementation
    throw new Error(
      "API service not implemented - use Supabase service instead"
    );
  },
};
