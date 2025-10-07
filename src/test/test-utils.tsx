import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// * Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// * Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// * Mock data factories
export const createMockMeeting = (overrides = {}) => ({
  code: 'ABC123',
  title: 'Test Meeting',
  facilitator: 'Test Facilitator',
  participantCount: 0,
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockParticipant = (overrides = {}) => ({
  id: 'participant-1',
  name: 'John Doe',
  isFacilitator: false,
  hasRaisedHand: false,
  isSpeaking: false,
  queuePosition: 0,
  joinedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockQueueItem = (overrides = {}) => ({
  id: 'queue-1',
  participantName: 'John Doe',
  type: 'speak',
  timestamp: Date.now(),
  position: 1,
  ...overrides,
});

export const createMockMeetingSocket = (overrides = {}) => ({
  meetingData: createMockMeeting(),
  participants: [createMockParticipant()],
  speakingQueue: [createMockQueueItem()],
  isInQueue: false,
  isConnected: true,
  error: null,
  currentSpeaker: null,
  joinQueue: vi.fn(),
  leaveQueue: vi.fn(),
  leaveMeeting: vi.fn(),
  connectionQuality: 'good' as const,
  lastConnected: new Date(),
  reconnectAttempts: 0,
  onReconnect: vi.fn(),
  ...overrides,
});

// * Mock socket service
export const mockSocketService = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  isConnected: true,
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  joinMeeting: vi.fn(),
  joinQueue: vi.fn(),
  leaveQueue: vi.fn(),
  onQueueUpdated: vi.fn(),
  onParticipantsUpdated: vi.fn(),
  onParticipantJoined: vi.fn(),
  onParticipantLeft: vi.fn(),
  onNextSpeaker: vi.fn(),
  onError: vi.fn(),
};

// * Test helpers
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const mockWindowLocation = (overrides = {}) => {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      reload: vi.fn(),
      ...overrides,
    },
    writable: true,
  });
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key]);
      },
    },
    writable: true,
  });
};

// * Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };