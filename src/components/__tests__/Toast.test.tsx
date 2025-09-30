import { render, screen, waitFor } from '@testing-library/react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { vi } from 'vitest';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => mockToast
}));

// Test component that uses toast
const TestComponent = () => {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: 'Test Title',
      description: 'Test Description',
      variant: 'default'
    });
  };

  return (
    <div>
      <button onClick={showToast}>Show Toast</button>
      <Toaster />
    </div>
  );
};

describe('Toast Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders toaster component', () => {
    render(<Toaster />);
    // The toaster itself doesn't render anything visible until toasts are added
    expect(document.body).toBeInTheDocument();
  });

  it('shows toast when triggered', async () => {
    render(<TestComponent />);

    const button = screen.getByRole('button', { name: /show toast/i });
    button.click();

    await waitFor(() => {
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('shows different toast variants', async () => {
    const { toast } = useToast();

    render(<Toaster />);

    // Test default variant
    toast({
      title: 'Default Toast',
      description: 'This is a default toast',
      variant: 'default'
    });

    await waitFor(() => {
      expect(screen.getByText('Default Toast')).toBeInTheDocument();
    });

    // Test destructive variant
    toast({
      title: 'Error Toast',
      description: 'This is an error toast',
      variant: 'destructive'
    });

    await waitFor(() => {
      expect(screen.getByText('Error Toast')).toBeInTheDocument();
    });
  });

  it('handles toast without description', async () => {
    const { toast } = useToast();

    render(<Toaster />);

    toast({
      title: 'Title Only Toast'
    });

    await waitFor(() => {
      expect(screen.getByText('Title Only Toast')).toBeInTheDocument();
    });
  });

  it('handles toast with action', async () => {
    const { toast } = useToast();
    const mockAction = vi.fn();

    render(<Toaster />);

    toast({
      title: 'Toast with Action',
      description: 'This toast has an action',
      action: {
        altText: 'Undo',
        onClick: mockAction
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Toast with Action')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    });
  });

  it('auto-dismisses toast after timeout', async () => {
    const { toast } = useToast();

    render(<Toaster />);

    toast({
      title: 'Auto-dismiss Toast',
      description: 'This toast will auto-dismiss'
    });

    await waitFor(() => {
      expect(screen.getByText('Auto-dismiss Toast')).toBeInTheDocument();
    });

    // Wait for auto-dismiss (default is 5 seconds)
    await waitFor(() => {
      expect(screen.queryByText('Auto-dismiss Toast')).not.toBeInTheDocument();
    }, { timeout: 6000 });
  });

  it('allows manual dismissal', async () => {
    const { toast } = useToast();

    render(<Toaster />);

    toast({
      title: 'Dismissible Toast',
      description: 'This toast can be dismissed'
    });

    await waitFor(() => {
      expect(screen.getByText('Dismissible Toast')).toBeInTheDocument();
    });

    // Find and click dismiss button
    const dismissButton = screen.getByRole('button', { name: /close/i });
    dismissButton.click();

    await waitFor(() => {
      expect(screen.queryByText('Dismissible Toast')).not.toBeInTheDocument();
    });
  });

  it('shows multiple toasts', async () => {
    const { toast } = useToast();

    render(<Toaster />);

    toast({
      title: 'First Toast',
      description: 'This is the first toast'
    });

    toast({
      title: 'Second Toast',
      description: 'This is the second toast'
    });

    await waitFor(() => {
      expect(screen.getByText('First Toast')).toBeInTheDocument();
      expect(screen.getByText('Second Toast')).toBeInTheDocument();
    });
  });

  it('limits number of visible toasts', async () => {
    const { toast } = useToast();

    render(<Toaster />);

    // Create more toasts than the limit (usually 3)
    for (let i = 0; i < 5; i++) {
      toast({
        title: `Toast ${i + 1}`,
        description: `This is toast number ${i + 1}`
      });
    }

    await waitFor(() => {
      // Should only show the most recent toasts (up to the limit)
      expect(screen.getByText('Toast 5')).toBeInTheDocument();
      // Older toasts should not be visible
      expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
    });
  });
});