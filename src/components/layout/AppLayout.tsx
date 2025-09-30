import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Users, Settings } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleFacilitateClick = () => {
    // Check if we're already in a meeting context
    if (location.pathname.startsWith("/facilitate/")) {
      return; // Already in facilitate view
    }

    // Check if we're in a meeting room and can extract meeting ID
    if (location.pathname.startsWith("/meeting/")) {
      const meetingId = location.pathname.split("/meeting/")[1];
      if (meetingId) {
        navigate(`/facilitate/${meetingId}`);
        return;
      }
    }

    // Check localStorage for stored meeting data
    const storedMeetingData = localStorage.getItem("currentMeeting");
    if (storedMeetingData) {
      try {
        const { meetingCode, facilitatorName, meetingName } =
          JSON.parse(storedMeetingData);
        navigate(`/facilitate/${meetingCode}`, {
          state: {
            facilitatorName,
            meetingName,
            meetingCode,
          },
        });
        return;
      } catch (error) {
        console.error("Error parsing stored meeting data:", error);
        localStorage.removeItem("currentMeeting");
      }
    }

    // If no meeting context found, prompt for meeting code
    const meetingCode = prompt("Enter meeting code to facilitate:");
    if (meetingCode && meetingCode.trim()) {
      navigate(`/facilitate/${meetingCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-zinc-950 dark:to-zinc-900 flex flex-col">
      <header
        className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800"
        role="banner"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            aria-current={isActive("/") ? "page" : undefined}
            aria-label="Home"
            className="flex items-center space-x-2"
          >
            <img
              src="/icc-removebg-preview.png"
              alt="ICC Austin logo"
              className="w-6 h-6 object-contain drop-shadow-sm dark:brightness-110"
            />
            <span className="font-semibold text-gray-900 dark:text-zinc-100">
              ICC Austin Stack
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <nav
              className="hidden md:flex items-center space-x-2"
              role="navigation"
              aria-label="Main navigation"
            >
              {/* Manual and Facilitate buttons side by side */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
                <Link
                  to="/manual"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive("/manual")
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-sm"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-zinc-700/50"
                  }`}
                  aria-current={isActive("/manual") ? "page" : undefined}
                >
                  <Users className="w-4 h-4 mr-2 inline" />
                  Manual
                </Link>

                <button
                  onClick={handleFacilitateClick}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    location.pathname.startsWith("/facilitate/")
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-sm"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-zinc-700/50"
                  }`}
                  aria-current={
                    location.pathname.startsWith("/facilitate/")
                      ? "page"
                      : undefined
                  }
                  title="Facilitate Meeting"
                >
                  <Settings className="w-4 h-4 mr-2 inline" />
                  Facilitate
                </button>
              </div>
            </nav>

            <ThemeToggle />

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col space-y-1">
              <Link
                to="/manual"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive("/manual") ? "page" : undefined}
                className="h-10 flex items-center px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Users className="w-4 h-4 mr-2" />
                Manual Stack
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleFacilitateClick();
                }}
                className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
                  location.pathname.startsWith("/facilitate/")
                    ? "text-primary dark:text-primary-light bg-primary/10"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Facilitate Meeting
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-grow" role="main">
        {children}
      </main>

      <footer
        className="bg-white/70 backdrop-blur border-t border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800 mt-auto"
        role="contentinfo"
      >
        <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center space-y-4">
          <img
            src="/icc2-removebg-preview.png"
            alt="ICC2 Logo"
            className="h-12 w-auto object-contain drop-shadow-sm dark:brightness-110"
          />
          <p className="text-sm text-gray-600 dark:text-zinc-400 text-center">
            Powered by ICC Austin Stack
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
