import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  useMeetingMode,
  useMeetingCode,
  getRoleFromMode,
  getModeFromRole,
  MeetingMode,
} from '../useMeetingMode';

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
const mockUseSearchParams = vi.fn(() => [mockSearchParams]);

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => mockUseSearchParams(),
  };
});

describe('useMeetingMode', () => {
  beforeEach(() => {
    mockSearchParams.clear();
    vi.clearAllMocks();
  });

  it('should return "host" when mode=host', () => {
    mockSearchParams.set('mode', 'host');
    
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBe('host');
  });

  it('should return "join" when mode=join', () => {
    mockSearchParams.set('mode', 'join');
    
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBe('join');
  });

  it('should return "watch" when mode=watch', () => {
    mockSearchParams.set('mode', 'watch');
    
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBe('watch');
  });

  it('should return "join" as default when no mode parameter', () => {
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBe('join');
  });

  it('should return "join" when invalid mode provided', () => {
    mockSearchParams.set('mode', 'invalid');
    
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBe('join');
  });

  it('should return "join" when empty mode parameter', () => {
    mockSearchParams.set('mode', '');
    
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBe('join');
  });

  it('should handle case sensitivity', () => {
    mockSearchParams.set('mode', 'HOST');
    
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBe('join');
  });
});

describe('useMeetingCode', () => {
  beforeEach(() => {
    mockSearchParams.clear();
    vi.clearAllMocks();
  });

  it('should return meeting code when present', () => {
    mockSearchParams.set('code', 'ABC123');
    
    const { result } = renderHook(() => useMeetingCode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBe('ABC123');
  });

  it('should return null when no code parameter', () => {
    const { result } = renderHook(() => useMeetingCode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBeNull();
  });

  it('should return empty string when code is empty', () => {
    mockSearchParams.set('code', '');
    
    const { result } = renderHook(() => useMeetingCode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBe('');
  });

  it('should handle special characters in code', () => {
    mockSearchParams.set('code', 'ABC-123');
    
    const { result } = renderHook(() => useMeetingCode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    expect(result.current).toBe('ABC-123');
  });
});

describe('getRoleFromMode', () => {
  it('should return facilitator role for host mode', () => {
    const result = getRoleFromMode('host');
    
    expect(result).toEqual({
      isFacilitator: true,
      isWatcher: false,
    });
  });

  it('should return participant role for join mode', () => {
    const result = getRoleFromMode('join');
    
    expect(result).toEqual({
      isFacilitator: false,
      isWatcher: false,
    });
  });

  it('should return watcher role for watch mode', () => {
    const result = getRoleFromMode('watch');
    
    expect(result).toEqual({
      isFacilitator: false,
      isWatcher: true,
    });
  });

  it('should return participant role for invalid mode', () => {
    const result = getRoleFromMode('invalid' as MeetingMode);
    
    expect(result).toEqual({
      isFacilitator: false,
      isWatcher: false,
    });
  });
});

describe('getModeFromRole', () => {
  it('should return host mode when facilitator', () => {
    const result = getModeFromRole(true, false);
    
    expect(result).toBe('host');
  });

  it('should return watch mode when watcher', () => {
    const result = getModeFromRole(false, true);
    
    expect(result).toBe('watch');
  });

  it('should return join mode when participant', () => {
    const result = getModeFromRole(false, false);
    
    expect(result).toBe('join');
  });

  it('should prioritize facilitator over watcher', () => {
    const result = getModeFromRole(true, true);
    
    expect(result).toBe('host');
  });

  it('should return join mode when both false', () => {
    const result = getModeFromRole(false, false);
    
    expect(result).toBe('join');
  });
});

describe('Integration Tests', () => {
  it('should work together correctly', () => {
    mockSearchParams.set('mode', 'host');
    mockSearchParams.set('code', 'ABC123');
    
    const { result: modeResult } = renderHook(() => useMeetingMode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    const { result: codeResult } = renderHook(() => useMeetingCode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    const role = getRoleFromMode(modeResult.current);
    const modeFromRole = getModeFromRole(role.isFacilitator, role.isWatcher);
    
    expect(modeResult.current).toBe('host');
    expect(codeResult.current).toBe('ABC123');
    expect(role.isFacilitator).toBe(true);
    expect(role.isWatcher).toBe(false);
    expect(modeFromRole).toBe('host');
  });

  it('should handle watch mode correctly', () => {
    mockSearchParams.set('mode', 'watch');
    mockSearchParams.set('code', 'XYZ789');
    
    const { result: modeResult } = renderHook(() => useMeetingMode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    const { result: codeResult } = renderHook(() => useMeetingCode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    const role = getRoleFromMode(modeResult.current);
    const modeFromRole = getModeFromRole(role.isFacilitator, role.isWatcher);
    
    expect(modeResult.current).toBe('watch');
    expect(codeResult.current).toBe('XYZ789');
    expect(role.isFacilitator).toBe(false);
    expect(role.isWatcher).toBe(true);
    expect(modeFromRole).toBe('watch');
  });

  it('should handle join mode correctly', () => {
    mockSearchParams.set('mode', 'join');
    mockSearchParams.set('code', 'DEF456');
    
    const { result: modeResult } = renderHook(() => useMeetingMode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    const { result: codeResult } = renderHook(() => useMeetingCode(), {
      wrapper: ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
      ),
    });
    
    const role = getRoleFromMode(modeResult.current);
    const modeFromRole = getModeFromRole(role.isFacilitator, role.isWatcher);
    
    expect(modeResult.current).toBe('join');
    expect(codeResult.current).toBe('DEF456');
    expect(role.isFacilitator).toBe(false);
    expect(role.isWatcher).toBe(false);
    expect(modeFromRole).toBe('join');
  });
});