import { describe, it, expect, vi } from "vitest";
import { SupabaseMeetingService } from "./supabase";
import { ErrorCode } from "../utils/errorHandling";

// Mock the Supabase client and related functions
vi.mock("@/integrations/supabase/client", () => ({
  executeSupabase: vi.fn(),
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    }),
  },
  isSupabaseConnectionError: vi.fn().mockReturnValue(false),
  SupabaseOfflineError: class SupabaseOfflineError extends Error {},
  SupabaseTimeoutError: class SupabaseTimeoutError extends Error {},
}));

describe("SupabaseMeetingService Input Validation", () => {
  describe("createMeeting", () => {
    it("throws error for short title", async () => {
      await expect(
        SupabaseMeetingService.createMeeting("ab", "Facilitator"),
      ).rejects.toThrow("Title must be at least 3 characters");
    });

    it("throws error for long title", async () => {
      const longTitle = "a".repeat(101);
      await expect(
        SupabaseMeetingService.createMeeting(longTitle, "Facilitator"),
      ).rejects.toThrow("Title must be 100 characters or less");
    });

    it("throws error for invalid facilitator name", async () => {
      await expect(
        SupabaseMeetingService.createMeeting("Valid Title", ""),
      ).rejects.toThrow("Name is required");
    });

    it("throws error for facilitator name with invalid characters", async () => {
        await expect(
            SupabaseMeetingService.createMeeting("Valid Title", "User@Name")
        ).rejects.toThrow("Only letters, numbers, spaces, hyphens, and apostrophes");
    });
  });

  describe("joinMeeting", () => {
    it("throws error for invalid participant name", async () => {
      await expect(
        SupabaseMeetingService.joinMeeting("ABCDEF", ""),
      ).rejects.toThrow("Name is required");
    });
  });

  describe("updateMeetingTitle", () => {
      it("throws error for invalid title", async () => {
          await expect(
              SupabaseMeetingService.updateMeetingTitle("id", "ab")
          ).rejects.toThrow("Title must be at least 3 characters");
      });
  });

  describe("updateParticipantName", () => {
      it("throws error for invalid name", async () => {
          await expect(
              SupabaseMeetingService.updateParticipantName("id", "")
          ).rejects.toThrow("Name is required");
      });
  });
});
