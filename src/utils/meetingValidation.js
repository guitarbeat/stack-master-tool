/**
 * Meeting validation utilities
 */

/**
 * Validates if a meeting code is in the correct format
 * @param {string} code - The meeting code to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidMeetingCodeFormat = code => {
  if (!code || typeof code !== "string") {
    return false;
  }

  // Meeting codes should be exactly 6 characters, alphanumeric
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
};

/**
 * Normalizes a meeting code to uppercase
 * @param {string} code - The meeting code to normalize
 * @returns {string} - Normalized meeting code
 */
export const normalizeMeetingCode = code => {
  if (!code || typeof code !== "string") {
    return "";
  }

  return code.toUpperCase().trim();
};

/**
 * Checks if a meeting code looks valid before making API calls
 * @param {string} code - The meeting code to check
 * @returns {object} - { isValid: boolean, normalizedCode: string, error?: string }
 */
export const validateMeetingCode = code => {
  const normalizedCode = normalizeMeetingCode(code);

  if (!normalizedCode) {
    return {
      isValid: false,
      normalizedCode: "",
      error: "Meeting code is required",
    };
  }

  if (normalizedCode.length !== 6) {
    return {
      isValid: false,
      normalizedCode,
      error: "Meeting code must be exactly 6 characters",
    };
  }

  if (!isValidMeetingCodeFormat(normalizedCode)) {
    return {
      isValid: false,
      normalizedCode,
      error: "Meeting code can only contain letters and numbers",
    };
  }

  return {
    isValid: true,
    normalizedCode,
    error: null,
  };
};
