import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiService from '../api.js';
import { AppError, ErrorCode } from '../../utils/errorHandling.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods to reduce noise in tests
const mockConsole = {
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
};

Object.assign(console, mockConsole);

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createMeeting', () => {
    it('should create a meeting successfully', async () => {
      const mockResponse = {
        meetingCode: 'ABC123',
        meetingId: 'meeting-id',
        shareUrl: 'http://localhost:3000/join/ABC123'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.createMeeting('John Doe', 'Test Meeting');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilitatorName: 'John Doe',
          meetingTitle: 'Test Meeting'
        })
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw AppError for invalid facilitator name', async () => {
      await expect(apiService.createMeeting('', 'Test Meeting'))
        .rejects.toThrow(AppError);
      
      await expect(apiService.createMeeting('   ', 'Test Meeting'))
        .rejects.toThrow(AppError);
      
      await expect(apiService.createMeeting(null, 'Test Meeting'))
        .rejects.toThrow(AppError);
    });

    it('should throw AppError for invalid meeting title', async () => {
      await expect(apiService.createMeeting('John Doe', ''))
        .rejects.toThrow(AppError);
      
      await expect(apiService.createMeeting('John Doe', '   '))
        .rejects.toThrow(AppError);
      
      await expect(apiService.createMeeting('John Doe', null))
        .rejects.toThrow(AppError);
    });

    it('should handle 400 validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid request data' })
      });

      await expect(apiService.createMeeting('John Doe', 'Test Meeting'))
        .rejects.toThrow(AppError);
    });

    it('should handle 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      });

      await expect(apiService.createMeeting('John Doe', 'Test Meeting'))
        .rejects.toThrow(AppError);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiService.createMeeting('John Doe', 'Test Meeting'))
        .rejects.toThrow(AppError);
    });

    it('should trim whitespace from input', async () => {
      const mockResponse = {
        meetingCode: 'ABC123',
        meetingId: 'meeting-id',
        shareUrl: 'http://localhost:3000/join/ABC123'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await apiService.createMeeting('  John Doe  ', '  Test Meeting  ');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilitatorName: 'John Doe',
          meetingTitle: 'Test Meeting'
        })
      });
    });
  });

  describe('getMeeting', () => {
    it('should get meeting successfully', async () => {
      const mockResponse = {
        code: 'ABC123',
        title: 'Test Meeting',
        facilitator: 'John Doe',
        participantCount: 0,
        isActive: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.getMeeting('ABC123');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/meetings/ABC123');
      expect(result).toEqual(mockResponse);
    });

    it('should throw AppError for invalid meeting code', async () => {
      await expect(apiService.getMeeting(''))
        .rejects.toThrow(AppError);
      
      await expect(apiService.getMeeting('ABC'))
        .rejects.toThrow(AppError);
      
      await expect(apiService.getMeeting('ABCDEFG'))
        .rejects.toThrow(AppError);
      
      await expect(apiService.getMeeting(null))
        .rejects.toThrow(AppError);
    });

    it('should handle 404 meeting not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Meeting not found' })
      });

      await expect(apiService.getMeeting('ABC123'))
        .rejects.toThrow(AppError);
    });

    it('should convert meeting code to uppercase', async () => {
      const mockResponse = {
        code: 'ABC123',
        title: 'Test Meeting',
        facilitator: 'John Doe',
        participantCount: 0,
        isActive: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await apiService.getMeeting('abc123');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/meetings/ABC123');
    });
  });

  describe('getJoinUrl', () => {
    it('should return correct join URL', () => {
      const url = apiService.getJoinUrl('ABC123');
      expect(url).toBe('http://localhost:3000/join/ABC123');
    });
  });

  describe('getSocketUrl', () => {
    it('should return correct socket URL', () => {
      const url = apiService.getSocketUrl();
      expect(url).toBe('http://localhost:3000');
    });
  });
});