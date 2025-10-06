import { validationRules } from "./validation";

describe("validation", () => {
  describe("meetingCode", () => {
    it("should validate 6-character alphanumeric codes", () => {
      const rule = validationRules.meetingCode();
      expect(rule.validate("ABC123").isValid).toBe(true);
      expect(rule.validate("123456").isValid).toBe(true);
      expect(rule.validate("ABCDEF").isValid).toBe(true);
    });

    it("should reject codes that are too short", () => {
      const rule = validationRules.meetingCode();
      expect(rule.validate("ABC12").isValid).toBe(false);
      expect(rule.validate("AB").isValid).toBe(false);
    });

    it("should reject codes that are too long", () => {
      const rule = validationRules.meetingCode();
      expect(rule.validate("ABC1234").isValid).toBe(false);
      expect(rule.validate("ABCDEFGH").isValid).toBe(false);
    });

    it("should reject codes with special characters", () => {
      const rule = validationRules.meetingCode();
      expect(rule.validate("ABC-123").isValid).toBe(false);
      expect(rule.validate("ABC@123").isValid).toBe(false);
    });
  });

  describe("participantName", () => {
    it("should validate normal names", () => {
      const rule = validationRules.participantName();
      expect(rule.validate("John Doe").isValid).toBe(true);
      expect(rule.validate("Alice").isValid).toBe(true);
      expect(rule.validate("Bob Smith").isValid).toBe(true);
    });

    it("should reject empty names", () => {
      const rule = validationRules.participantName();
      expect(rule.validate("").isValid).toBe(false);
      expect(rule.validate("   ").isValid).toBe(false);
    });

    it("should reject names that are too long", () => {
      const rule = validationRules.participantName();
      const longName = "A".repeat(51);
      expect(rule.validate(longName).isValid).toBe(false);
    });

    it("should reject names with special characters", () => {
      const rule = validationRules.participantName();
      expect(rule.validate("Bob Smith Jr.").isValid).toBe(false);
      expect(rule.validate("John@Doe").isValid).toBe(false);
    });
  });
});
