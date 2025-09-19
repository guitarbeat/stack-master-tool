import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '../ErrorDisplay';
import { AppError, ErrorCode, ErrorType } from '../../utils/errorHandling';

// Mock the error handling utilities
vi.mock('../../utils/errorHandling', async () => {
  const actual = await vi.importActual('../../utils/errorHandling');
  return {
    ...actual,
    getErrorDisplayInfo: vi.fn((error) => ({
      title: 'Test Error',
      description: 'This is a test error description',
      action: 'Please try again'
    }))
  };
});

describe('ErrorDisplay', () => {
  const mockOnRetry = vi.fn();
  const mockOnGoHome = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render error information', () => {
    const error = new Error('Test error');
    render(<ErrorDisplay error={error} />);

    expect(screen.getByText('Test Error')).toBeInTheDocument();
    expect(screen.getByText('This is a test error description')).toBeInTheDocument();
    expect(screen.getByText('💡 Please try again')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const error = new Error('Test error');
    const { container } = render(
      <ErrorDisplay error={error} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should show retry button when onRetry is provided and error is retryable', () => {
    const appError = new AppError(ErrorCode.CONNECTION_FAILED, undefined, 'Connection failed');
    render(<ErrorDisplay error={appError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should show go home button when onGoHome is provided', () => {
    const error = new Error('Test error');
    render(<ErrorDisplay error={error} onGoHome={mockOnGoHome} />);

    const goHomeButton = screen.getByText('Go Home');
    expect(goHomeButton).toBeInTheDocument();

    fireEvent.click(goHomeButton);
    expect(mockOnGoHome).toHaveBeenCalledTimes(1);
  });

  it('should show both retry and go home buttons when both callbacks are provided', () => {
    const appError = new AppError(ErrorCode.CONNECTION_FAILED, undefined, 'Connection failed');
    render(
      <ErrorDisplay 
        error={appError} 
        onRetry={mockOnRetry} 
        onGoHome={mockOnGoHome} 
      />
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('should show technical details when showDetails is true and error is AppError', () => {
    const appError = new AppError(ErrorCode.CONNECTION_FAILED, undefined, 'Connection failed');
    render(<ErrorDisplay error={appError} showDetails={true} />);

    const detailsElement = screen.getByText('Technical Details');
    expect(detailsElement).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(detailsElement);

    expect(screen.getByText('Code:')).toBeInTheDocument();
    expect(screen.getByText('Type:')).toBeInTheDocument();
    expect(screen.getByText('Timestamp:')).toBeInTheDocument();
  });

  it('should not show technical details when showDetails is false', () => {
    const appError = new AppError(ErrorCode.CONNECTION_FAILED, undefined, 'Connection failed');
    render(<ErrorDisplay error={appError} showDetails={false} />);

    expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
  });

  it('should not show technical details for regular Error', () => {
    const error = new Error('Test error');
    render(<ErrorDisplay error={error} showDetails={true} />);

    expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
  });

  it('should not show retry button for non-retryable errors', () => {
    // Create a non-retryable error by mocking the AppError constructor
    const nonRetryableError = {
      details: {
        retryable: false,
        type: ErrorType.VALIDATION
      }
    } as AppError;

    render(<ErrorDisplay error={nonRetryableError} onRetry={mockOnRetry} />);

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('should render different error icons based on error type', () => {
    const networkError = {
      details: {
        type: ErrorType.NETWORK,
        retryable: true
      }
    } as AppError;

    const { container } = render(<ErrorDisplay error={networkError} />);
    
    // Check that the appropriate icon is rendered (WifiOff for network errors)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should apply correct styling based on error type', () => {
    const validationError = {
      details: {
        type: ErrorType.VALIDATION,
        retryable: true
      }
    } as AppError;

    const { container } = render(<ErrorDisplay error={validationError} />);
    
    // Check that validation error styling is applied
    expect(container.firstChild).toHaveClass('text-blue-600', 'bg-blue-50');
  });

  it('should handle regular Error objects', () => {
    const error = new Error('Regular error');
    render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

    expect(screen.getByText('Test Error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});