import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "./App";

// Mock the QueryClient to avoid issues in tests
vi.mock("@tanstack/react-query", () => ({
  QueryClient: vi.fn(() => ({
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: ReactNode }) => children,
}));

// Mock the toast components
vi.mock("./components/ui/toaster", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock("./components/ui/sonner", () => ({
  Toaster: () => <div data-testid="sonner" />,
}));

// Mock the AppLayout component
vi.mock("./components/layout/AppLayout", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Mock the pages
vi.mock("./pages/HomePage", () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock("./pages/MeetingRoom", () => ({
  default: () => <div data-testid="meeting-room">Meeting Room</div>,
}));

vi.mock("./pages/NotFound", () => ({
  default: () => <div data-testid="not-found">Not Found</div>,
}));

const futureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

const renderWithRouter = () =>
  render(
    <BrowserRouter future={futureConfig}>
      <App />
    </BrowserRouter>
  );

describe("App", () => {
  it("renders without crashing", () => {
    renderWithRouter();

    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
  });

  it("renders home page by default", () => {
    renderWithRouter();

    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });
});
