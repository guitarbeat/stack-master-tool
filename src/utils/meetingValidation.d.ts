/**
 * Meeting validation utilities type definitions
 */

/**
 * Validates if a meeting code is in the correct format
 */
export function isValidMeetingCodeFormat(code: string): boolean;

/**
 * Normalizes a meeting code to uppercase
 */
export function normalizeMeetingCode(code: string): string;

/**
 * Checks if a meeting code looks valid before making API calls
 */
export function validateMeetingCode(code: string): {
  isValid: boolean;
  normalizedCode: string;
  error: string | null;
};
