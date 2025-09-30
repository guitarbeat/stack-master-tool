import { renderHook } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import {
  useMeetingMode,
  getRoleFromMode,
  getModeFromRole,
} from "../useMeetingMode";

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

describe("useMeetingMode", () => {
  beforeEach(() => {
    mockSearchParams.clear();
  });

  it('should return "join" as default when no mode parameter', () => {
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: BrowserRouter,
    });
    expect(result.current).toBe("join");
  });

  it('should return "host" when mode=host', () => {
    mockSearchParams.set("mode", "host");
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: BrowserRouter,
    });
    expect(result.current).toBe("host");
  });

  it('should return "watch" when mode=watch', () => {
    mockSearchParams.set("mode", "watch");
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: BrowserRouter,
    });
    expect(result.current).toBe("watch");
  });

  it('should return "join" when invalid mode provided', () => {
    mockSearchParams.set("mode", "invalid");
    const { result } = renderHook(() => useMeetingMode(), {
      wrapper: BrowserRouter,
    });
    expect(result.current).toBe("join");
  });
});

describe("getRoleFromMode", () => {
  it("should return facilitator role for host mode", () => {
    const result = getRoleFromMode("host");
    expect(result).toEqual({ isFacilitator: true, isWatcher: false });
  });

  it("should return participant role for join mode", () => {
    const result = getRoleFromMode("join");
    expect(result).toEqual({ isFacilitator: false, isWatcher: false });
  });

  it("should return watcher role for watch mode", () => {
    const result = getRoleFromMode("watch");
    expect(result).toEqual({ isFacilitator: false, isWatcher: true });
  });
});

describe("getModeFromRole", () => {
  it('should return "host" for facilitator role', () => {
    const result = getModeFromRole(true, false);
    expect(result).toBe("host");
  });

  it('should return "watch" for watcher role', () => {
    const result = getModeFromRole(false, true);
    expect(result).toBe("watch");
  });

  it('should return "join" for participant role', () => {
    const result = getModeFromRole(false, false);
    expect(result).toBe("join");
  });
});
