// Error handling utilities and constants
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorCode {
  // Network errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  OFFLINE = 'OFFLINE',
  
  // Validation errors
  INVALID_MEETING_CODE = 'INVALID_MEETING_CODE',
  INVALID_PARTICIPANT_NAME = 'INVALID_PARTICIPANT_NAME',
  INVALID_QUEUE_TYPE = 'INVALID_QUEUE_TYPE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication/Authorization errors
  UNAUTHORIZED_FACILITATOR = 'UNAUTHORIZED_FACILITATOR',
  NOT_IN_MEETING = 'NOT_IN_MEETING',
  MEETING_ACCESS_DENIED = 'MEETING_ACCESS_DENIED',
  
  // Not found errors
  MEETING_NOT_FOUND = 'MEETING_NOT_FOUND',
  PARTICIPANT_NOT_FOUND = 'PARTICIPANT_NOT_FOUND',
  
  // Conflict errors
  ALREADY_IN_QUEUE = 'ALREADY_IN_QUEUE',
  DUPLICATE_PARTICIPANT = 'DUPLICATE_PARTICIPANT',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Timeout errors
  JOIN_TIMEOUT = 'JOIN_TIMEOUT',
  SOCKET_TIMEOUT = 'SOCKET_TIMEOUT'
}

export interface ErrorDetails {
  type: ErrorType;
  code: ErrorCode;
  message: string;
  userMessage: string;
  action?: string;
  retryable: boolean;
  timestamp: string;
  originalError?: Error;
}

// User-friendly error messages
export const ERROR_MESSAGES: Record<ErrorCode, { title: string; description: string; action?: string }> = {
  // Network errors
  CONNECTION_FAILED: {
    title: 'Connection Failed',
    description: 'Unable to connect to the meeting server. Please check your internet connection and try again.',
    action: 'Check your internet connection and refresh the page.'
  },
  NETWORK_TIMEOUT: {
    title: 'Connection Timeout',
    description: 'The connection timed out. This might be due to a slow network or server issues.',
    action: 'Try again or check your internet connection.'
  },
  OFFLINE: {
    title: 'You\'re Offline',
    description: 'Please check your internet connection and try again.',
    action: 'Check your internet connection and refresh the page.'
  },
  
  // Validation errors
  INVALID_MEETING_CODE: {
    title: 'Invalid Meeting Code',
    description: 'The meeting code you entered is not valid. Please check the code and try again.',
    action: 'Double-check the meeting code and ensure it\'s exactly 6 characters.'
  },
  INVALID_PARTICIPANT_NAME: {
    title: 'Invalid Name',
    description: 'Please enter a valid name (1-50 characters).',
    action: 'Enter a name between 1 and 50 characters.'
  },
  INVALID_QUEUE_TYPE: {
    title: 'Invalid Queue Type',
    description: 'The queue type is not supported.',
    action: 'Try joining the speaking queue instead.'
  },
  MISSING_REQUIRED_FIELD: {
    title: 'Missing Information',
    description: 'Please fill in all required fields.',
    action: 'Complete all required fields and try again.'
  },
  
  // Authentication/Authorization errors
  UNAUTHORIZED_FACILITATOR: {
    title: 'Access Denied',
    description: 'Only the meeting creator can join as facilitator.',
    action: 'Join as a regular participant or contact the meeting creator.'
  },
  NOT_IN_MEETING: {
    title: 'Not in Meeting',
    description: 'You must be in a meeting to perform this action.',
    action: 'Join a meeting first.'
  },
  MEETING_ACCESS_DENIED: {
    title: 'Access Denied',
    description: 'You don\'t have permission to access this meeting.',
    action: 'Contact the meeting facilitator for access.'
  },
  
  // Not found errors
  MEETING_NOT_FOUND: {
    title: 'Meeting Not Found',
    description: 'The meeting code you entered doesn\'t exist or the meeting has ended.',
    action: 'Check the meeting code or ask the facilitator for a new one.'
  },
  PARTICIPANT_NOT_FOUND: {
    title: 'Participant Not Found',
    description: 'The participant information could not be found.',
    action: 'Try rejoining the meeting.'
  },
  
  // Conflict errors
  ALREADY_IN_QUEUE: {
    title: 'Already in Queue',
    description: 'You\'re already in the speaking queue.',
    action: 'Wait for your turn or leave the queue first.'
  },
  DUPLICATE_PARTICIPANT: {
    title: 'Already Joined',
    description: 'You\'ve already joined this meeting.',
    action: 'You can continue participating in the meeting.'
  },
  
  // Server errors
  INTERNAL_SERVER_ERROR: {
    title: 'Server Error',
    description: 'Something went wrong on our end. We\'re working to fix it.',
    action: 'Please try again in a few moments.'
  },
  SERVICE_UNAVAILABLE: {
    title: 'Service Unavailable',
    description: 'The meeting service is temporarily unavailable.',
    action: 'Please try again later.'
  },
  
  // Timeout errors
  JOIN_TIMEOUT: {
    title: 'Join Timeout',
    description: 'Joining the meeting took too long. Please try again.',
    action: 'Try joining the meeting again.'
  },
  SOCKET_TIMEOUT: {
    title: 'Connection Timeout',
    description: 'The connection timed out. Please try reconnecting.',
    action: 'Refresh the page to reconnect.'
  }
};

export class AppError extends Error {
  public readonly details: ErrorDetails;

  constructor(
    code: ErrorCode,
    originalError?: Error,
    customMessage?: string
  ) {
    const errorInfo = ERROR_MESSAGES[code];
    const message = customMessage || errorInfo.description;
    
    super(message);
    this.name = 'AppError';
    
    this.details = {
      type: getErrorTypeFromCode(code),
      code,
      message,
      userMessage: errorInfo.title,
      action: errorInfo.action,
      retryable: isRetryableError(code),
      timestamp: new Date().toISOString(),
      originalError
    };
  }
}

function getErrorTypeFromCode(code: ErrorCode): ErrorType {
  if (code.startsWith('CONNECTION') || code === 'NETWORK_TIMEOUT' || code === 'OFFLINE') {
    return ErrorType.NETWORK;
  }
  if (code.startsWith('INVALID') || code === 'MISSING_REQUIRED_FIELD') {
    return ErrorType.VALIDATION;
  }
  if (code.startsWith('UNAUTHORIZED') || code.startsWith('NOT_IN') || code.startsWith('MEETING_ACCESS')) {
    return ErrorType.AUTHENTICATION;
  }
  if (code.startsWith('NOT_FOUND') || code === 'MEETING_NOT_FOUND' || code === 'PARTICIPANT_NOT_FOUND') {
    return ErrorType.NOT_FOUND;
  }
  if (code.startsWith('ALREADY') || code.startsWith('DUPLICATE')) {
    return ErrorType.CONFLICT;
  }
  if (code.startsWith('INTERNAL') || code.startsWith('SERVICE')) {
    return ErrorType.SERVER;
  }
  if (code.includes('TIMEOUT')) {
    return ErrorType.TIMEOUT;
  }
  return ErrorType.UNKNOWN;
}

function isRetryableError(code: ErrorCode): boolean {
  const retryableCodes = [
    'CONNECTION_FAILED',
    'NETWORK_TIMEOUT',
    'OFFLINE',
    'INTERNAL_SERVER_ERROR',
    'SERVICE_UNAVAILABLE',
    'JOIN_TIMEOUT',
    'SOCKET_TIMEOUT'
  ];
  return retryableCodes.includes(code);
}

// Error logging utility
export const logError = (error: AppError | Error, context?: string) => {
  const timestamp = new Date().toISOString();
  const errorInfo = error instanceof AppError ? error.details : {
    type: ErrorType.UNKNOWN,
    code: 'UNKNOWN' as ErrorCode,
    message: error.message,
    userMessage: 'An unexpected error occurred',
    retryable: false,
    timestamp,
    originalError: error
  };

  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}Error:`, {
    ...errorInfo,
    stack: error.stack
  });

  // Track error for monitoring and analytics
  if (typeof window !== 'undefined') {
    import('./errorMonitoring').then(({ trackAndLogError }) => {
      trackAndLogError(error, context);
    });
  }
};

// Error boundary helper
export const getErrorDisplayInfo = (error: AppError | Error) => {
  if (error instanceof AppError) {
    return {
      title: error.details.userMessage,
      description: error.details.message,
      action: error.details.action,
      retryable: error.details.retryable
    };
  }

  return {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    action: 'Refresh the page or try again later.',
    retryable: true
  };
};