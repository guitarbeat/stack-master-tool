import { render, screen } from "@testing-library/react";
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
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock the toast components
vi.mock("@/components/ui/toaster", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="sonner" />,
}));

// Mock the AppLayout component
vi.mock("@/components/layout/AppLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
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

describe("App", () => {
  it("renders without crashing", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
  });

  it("renders home page by default", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });
});
