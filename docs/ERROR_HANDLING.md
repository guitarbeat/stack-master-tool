# Error Handling System

This document describes the comprehensive error handling system implemented in the Stack Facilitation application.

## Overview

The error handling system provides:
- Centralized error management with consistent error types and codes
- User-friendly error messages with actionable guidance
- Comprehensive error logging and monitoring
- Automatic error recovery and retry mechanisms
- Detailed error analytics and reporting

## Architecture

### Core Components

1. **Error Types & Codes** (`src/utils/errorHandling.ts`)
   - Standardized error classification system
   - User-friendly error messages
   - Retry logic indicators

2. **Error Monitoring** (`src/utils/errorMonitoring.ts`)
   - Error tracking and analytics
   - Performance monitoring
   - Production error reporting

3. **Error Display Components** (`src/components/ErrorDisplay.tsx`)
   - Consistent error UI across the application
   - Contextual error information
   - Action buttons for error recovery

## Error Classification

### Error Types

- **NETWORK**: Connection issues, timeouts, offline states
- **VALIDATION**: Input validation errors, format issues
- **AUTHENTICATION**: Login/access permission errors
- **AUTHORIZATION**: Insufficient permissions for actions
- **NOT_FOUND**: Missing resources (meetings, participants)
- **CONFLICT**: Duplicate entries, state conflicts
- **SERVER**: Backend service errors
- **TIMEOUT**: Operation timeouts
- **UNKNOWN**: Unclassified errors

### Error Codes

Each error type has specific error codes for precise identification:

```typescript
// Network errors
CONNECTION_FAILED, NETWORK_TIMEOUT, OFFLINE

// Validation errors  
INVALID_MEETING_CODE, INVALID_PARTICIPANT_NAME, INVALID_QUEUE_TYPE

// Authentication errors
UNAUTHORIZED_FACILITATOR, NOT_IN_MEETING, MEETING_ACCESS_DENIED

// And more...
```

## Usage Examples

### Creating Custom Errors

```typescript
import { AppError, ErrorCode } from '../utils/errorHandling';

// Create a specific error
throw new AppError(ErrorCode.MEETING_NOT_FOUND, originalError, 'Custom message');

// Create with automatic error mapping
throw new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, 'Meeting code must be 6 characters');
```

### Handling Errors in Components

```typescript
import { getErrorDisplayInfo } from '../utils/errorHandling';

try {
  await apiService.getMeeting(code);
} catch (error) {
  const errorInfo = getErrorDisplayInfo(error);
  setError(errorInfo.description);
  notify('error', errorInfo.title, errorInfo.description);
}
```

### Using Error Display Component

```typescript
import { ErrorDisplay } from '../components/ErrorDisplay';

<ErrorDisplay 
  error={error}
  onRetry={() => retryOperation()}
  onGoHome={() => navigate('/')}
  showDetails={isDevelopment}
/>
```

## Error Recovery

### Automatic Retry

Errors marked as `retryable: true` can be automatically retried:

```typescript
const error = new AppError(ErrorCode.CONNECTION_FAILED, originalError);
if (error.details.retryable) {
  // Show retry button or auto-retry
}
```

### User Actions

Error messages include actionable guidance:

- **Network errors**: "Check your internet connection and refresh the page"
- **Validation errors**: "Enter a valid meeting code (6 characters)"
- **Permission errors**: "Contact the meeting facilitator for access"

## Monitoring & Analytics

### Error Tracking

All errors are automatically tracked with:
- Error frequency by type and code
- Context information (component, operation)
- User agent and URL data
- Timestamp and stack traces

### Metrics Available

```typescript
import { errorMonitor } from '../utils/errorMonitoring';

// Get error statistics
const metrics = errorMonitor.getMetrics();
const errorRate = errorMonitor.getErrorRate();
const topErrors = errorMonitor.getTopErrorTypes(5);

// Generate error report
const report = errorMonitor.generateErrorReport();
```

### Production Integration

In production, errors are sent to external monitoring services:

```typescript
// Example Sentry integration
Sentry.captureException(error, { 
  extra: { context, userAgent, url } 
});

// Example custom analytics
fetch('/api/analytics/errors', {
  method: 'POST',
  body: JSON.stringify(errorData)
});
```

## Best Practices

### 1. Use Specific Error Codes

```typescript
// Good
throw new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, 'Meeting code must be 6 characters');

// Avoid
throw new Error('Invalid input');
```

### 2. Provide Context

```typescript
// Good
logError(error, 'joinMeeting');

// Avoid
logError(error);
```

### 3. Handle Errors Gracefully

```typescript
// Good
try {
  await operation();
} catch (error) {
  const errorInfo = getErrorDisplayInfo(error);
  showUserFriendlyMessage(errorInfo);
}

// Avoid
try {
  await operation();
} catch (error) {
  alert('Something went wrong');
}
```

### 4. Use Error Boundaries

```typescript
// Wrap components that might fail
<ErrorBoundary>
  <RiskyComponent />
</ErrorBoundary>
```

## Testing Error Handling

### Unit Tests

```typescript
import { AppError, ErrorCode } from '../utils/errorHandling';

test('creates error with correct details', () => {
  const error = new AppError(ErrorCode.MEETING_NOT_FOUND);
  expect(error.details.code).toBe('MEETING_NOT_FOUND');
  expect(error.details.retryable).toBe(false);
});
```

### Integration Tests

```typescript
test('handles network error gracefully', async () => {
  // Mock network failure
  mockFetch.mockRejectedValue(new Error('Network error'));
  
  const { getByText } = render(<JoinMeeting />);
  await userEvent.click(getByText('Join Meeting'));
  
  expect(getByText('Connection Failed')).toBeInTheDocument();
  expect(getByText('Check your internet connection')).toBeInTheDocument();
});
```

## Configuration

### Environment Variables

```bash
# Enable detailed error logging
REACT_APP_DEBUG_ERRORS=true

# Error monitoring service endpoint
REACT_APP_ERROR_REPORTING_URL=https://api.example.com/errors

# Sentry DSN
REACT_APP_SENTRY_DSN=https://your-sentry-dsn
```

### Error Message Customization

Error messages can be customized in `src/utils/errorHandling.ts`:

```typescript
export const ERROR_MESSAGES: Record<ErrorCode, { title: string; description: string; action?: string }> = {
  MEETING_NOT_FOUND: {
    title: 'Meeting Not Found',
    description: 'The meeting code you entered doesn\'t exist or the meeting has ended.',
    action: 'Check the meeting code or ask the facilitator for a new one.'
  },
  // ... more messages
};
```

## Troubleshooting

### Common Issues

1. **Error not displaying properly**
   - Check if error is wrapped in `AppError`
   - Verify error code exists in `ERROR_MESSAGES`

2. **Monitoring not working**
   - Ensure `errorMonitoring.ts` is imported
   - Check browser console for import errors

3. **Retry not working**
   - Verify error is marked as `retryable: true`
   - Check retry logic implementation

### Debug Mode

Enable debug mode for detailed error information:

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  window.errorMonitor = errorMonitor; // Access via console
}
```

## Future Enhancements

- [ ] Real-time error notifications
- [ ] Error prediction based on patterns
- [ ] Automatic error recovery strategies
- [ ] User feedback collection on errors
- [ ] A/B testing for error messages
- [ ] Integration with more monitoring services