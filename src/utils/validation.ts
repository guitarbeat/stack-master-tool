import { ErrorCode } from "./errorHandling";

export interface ValidationResult {
  isValid: boolean;
  errorCode?: ErrorCode;
  message?: string;
}

export interface ValidationRule {
  validate: (value: string) => ValidationResult;
  message: string;
}

// Common validation rules
export const validationRules = {
  required: (fieldName: string): ValidationRule => ({
    validate: (value: string) => ({
      isValid: value.trim().length > 0,
      errorCode: ErrorCode.MISSING_REQUIRED_FIELD,
      message: `${fieldName} is required`,
    }),
    message: `${fieldName} is required`,
  }),

  minLength: (min: number, fieldName: string): ValidationRule => ({
    validate: (value: string) => ({
      isValid: value.trim().length >= min,
      errorCode: ErrorCode.NAME_TOO_SHORT,
      message: `${fieldName} must be at least ${min} character${min > 1 ? "s" : ""}`,
    }),
    message: `${fieldName} must be at least ${min} character${min > 1 ? "s" : ""}`,
  }),

  maxLength: (max: number, fieldName: string): ValidationRule => ({
    validate: (value: string) => ({
      isValid: value.trim().length <= max,
      errorCode: ErrorCode.NAME_TOO_LONG,
      message: `${fieldName} must be ${max} characters or less`,
    }),
    message: `${fieldName} must be ${max} characters or less`,
  }),

  exactLength: (length: number, fieldName: string): ValidationRule => ({
    validate: (value: string) => ({
      isValid: value.length === length,
      errorCode: ErrorCode.INVALID_MEETING_CODE,
      message: `${fieldName} must be exactly ${length} characters`,
    }),
    message: `${fieldName} must be exactly ${length} characters`,
  }),

  alphanumericWithSpaces: (fieldName: string): ValidationRule => ({
    validate: (value: string) => ({
      isValid: /^[a-zA-Z0-9\s]+$/.test(value),
      errorCode: ErrorCode.INVALID_CHARACTERS,
      message: `${fieldName} can only contain letters, numbers, and spaces`,
    }),
    message: `${fieldName} can only contain letters, numbers, and spaces`,
  }),

  meetingCode: (): ValidationRule => ({
    validate: (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length !== 6) {
        return {
          isValid: false,
          errorCode: ErrorCode.INVALID_MEETING_CODE,
          message: "Meeting code must be exactly 6 characters",
        };
      }
      if (!/^[A-Z0-9]+$/.test(trimmed)) {
        return {
          isValid: false,
          errorCode: ErrorCode.INVALID_MEETING_CODE,
          message: "Meeting code can only contain letters and numbers",
        };
      }
      return { isValid: true };
    },
    message: "Meeting code must be exactly 6 characters",
  }),

  participantName: (): ValidationRule => ({
    validate: (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return {
          isValid: false,
          errorCode: ErrorCode.INVALID_PARTICIPANT_NAME,
          message: "Name is required",
        };
      }
      if (trimmed.length > 50) {
        return {
          isValid: false,
          errorCode: ErrorCode.NAME_TOO_LONG,
          message: "Name must be 50 characters or less",
        };
      }
      if (!/^[a-zA-Z0-9\s]+$/.test(trimmed)) {
        return {
          isValid: false,
          errorCode: ErrorCode.INVALID_CHARACTERS,
          message: "Name can only contain letters, numbers, and spaces",
        };
      }
      return { isValid: true };
    },
    message: "Enter a valid name",
  }),

  meetingTitle: (): ValidationRule => ({
    validate: (value: string) => {
      const trimmed = value.trim();
      // Meeting title is optional, but if provided, validate length
      if (trimmed.length > 100) {
        return {
          isValid: false,
          errorCode: ErrorCode.INVALID_MEETING_TITLE,
          message: "Meeting title must be 100 characters or less",
        };
      }
      return { isValid: true };
    },
    message: "Meeting title must be 100 characters or less",
  }),
};

// Validate a value against multiple rules
export const validateValue = (
  value: string,
  rules: ValidationRule[]
): ValidationResult => {
  for (const rule of rules) {
    const result = rule.validate(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

// Real-time validation hook - requires React imports
import { useState, useEffect } from "react";

export const useValidation = (
  value: string,
  rules: ValidationRule[],
  debounceMs: number = 300
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult>({ isValid: true });

  useEffect(() => {
    if (value.length === 0) {
      setResult({ isValid: true });
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(() => {
      const validationResult = validateValue(value, rules);
      setResult(validationResult);
      setIsValidating(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      setIsValidating(false);
    };
  }, [value, rules, debounceMs]);

  return {
    ...result,
    isValidating,
  };
};

// Form validation helper
export const validateForm = (
  fields: Record<string, { value: string; rules: ValidationRule[] }>
) => {
  const errors: Record<string, ValidationResult> = {};
  let isValid = true;

  for (const [fieldName, { value, rules }] of Object.entries(fields)) {
    const result = validateValue(value, rules);
    if (!result.isValid) {
      errors[fieldName] = result;
      isValid = false;
    }
  }

  return { isValid, errors };
};
