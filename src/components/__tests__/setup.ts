import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  Link: ({ children, to, ...props }: any) => React.createElement('a', { href: to, ...props }, children),
  NavLink: ({ children, to, ...props }: any) => React.createElement('a', { href: to, ...props }, children),
}));

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  })),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: any) => children,
}));

// Mock Next.js router if used
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock window.location
delete (window as any).location;
window.location = {
  ...window.location,
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  hostname: 'localhost',
  port: '3000',
  protocol: 'http:',
  search: '',
  hash: '',
  pathname: '/',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
  writable: true,
});

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock window.getComputedStyle
window.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => ''),
}));

// Mock document methods
Object.defineProperty(document, 'getElementById', {
  value: vi.fn(() => null),
  writable: true,
});

Object.defineProperty(document, 'querySelector', {
  value: vi.fn(() => null),
  writable: true,
});

Object.defineProperty(document, 'querySelectorAll', {
  value: vi.fn(() => []),
  writable: true,
});

// Mock HTMLElement methods
HTMLElement.prototype.scrollIntoView = vi.fn();
HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
}));

// Mock AudioContext
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 0 },
  })),
  destination: {},
}));

// Mock Web Audio API
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 0 },
  })),
  destination: {},
}));

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid'),
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  },
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Mock setTimeout and clearTimeout
global.setTimeout = vi.fn((cb) => {
  const id = Math.random();
  setTimeout(cb, 0);
  return id;
});
global.clearTimeout = vi.fn();

// Mock setInterval and clearInterval
global.setInterval = vi.fn((cb) => {
  const id = Math.random();
  setInterval(cb, 0);
  return id;
});
global.clearInterval = vi.fn();