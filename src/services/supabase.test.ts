import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseMeetingService } from "./supabase";

// Mock data that satisfies various queries
const mockData = {
  id: "test-id",
  meeting_code: "ABCDEF",
  title: "Test Meeting",
  facilitator_name: "Facilitator",
  name: "Participant",
  is_active: true,
  created_at: new Date().toISOString(),
  joined_at: new Date().toISOString(),
  is_facilitator: false,
};

// Mock the Supabase client and execution helper
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
  executeSupabase: vi.fn((operation) => operation({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
          single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    })),
    rpc: vi.fn().mockResolvedValue({ data: "ABCDEF", error: null }),
  })),
  isSupabaseConnectionError: vi.fn().mockReturnValue(false),
  SupabaseTimeoutError: class SupabaseTimeoutError extends Error {},
  SupabaseOfflineError: class SupabaseOfflineError extends Error {},
}));

describe("SupabaseMeetingService Security Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw a VALIDATION_ERROR when creating a meeting with a title that is too short", async () => {
    const shortTitle = "Hi"; // Too short (min 3)

    await expect(SupabaseMeetingService.createMeeting(shortTitle, "Valid Name"))
      .rejects
      .toThrow("Title must be at least 3 characters");
  });

  it("should throw a VALIDATION_ERROR when creating a meeting with an invalid facilitator name", async () => {
    const invalidName = "Invalid@Name";

    await expect(SupabaseMeetingService.createMeeting("Valid Title", invalidName))
      .rejects
      .toThrow("Only letters, numbers, spaces, hyphens, and apostrophes");
  });

  it("should throw a VALIDATION_ERROR when joining with an invalid participant name", async () => {
    const invalidName = "Invalid@Name";

    await expect(SupabaseMeetingService.joinMeeting("ABCDEF", invalidName))
      .rejects
      .toThrow("Only letters, numbers, spaces, hyphens, and apostrophes");
  });

  it("should throw a VALIDATION_ERROR when updating meeting title with invalid title", async () => {
    const shortTitle = "Hi";

    await expect(SupabaseMeetingService.updateMeetingTitle("meeting-id", shortTitle))
      .rejects
      .toThrow("Title must be at least 3 characters");
  });

  it("should throw a VALIDATION_ERROR when updating participant name with invalid name", async () => {
    const invalidName = "Invalid@Name";

    await expect(SupabaseMeetingService.updateParticipantName("participant-id", invalidName))
      .rejects
      .toThrow("Only letters, numbers, spaces, hyphens, and apostrophes");
  });

  it("should accept international characters in participant name", async () => {
    const validName = "José Müller";

    // Should NOT throw
    await expect(SupabaseMeetingService.joinMeeting("ABCDEF", validName)).resolves.not.toThrow();
  });
});
