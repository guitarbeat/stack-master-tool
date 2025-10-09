import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, UserPlus, Users, Menu, X, MessageSquare } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { getSimplePoweredByString } from "@/utils/version";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
      >
        Skip to main content
      </a>
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
              className="hidden md:flex items-center space-x-1"
              role="navigation"
              aria-label="Main navigation"
            >
              <Link
                to="/meeting?mode=host"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  isActive("/meeting") && location.search.includes("mode=host")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Plus className="w-4 h-4 mr-1" />
                Host
              </Link>
              <Link
                to="/meeting?mode=join"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  isActive("/meeting") && location.search.includes("mode=join")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Join
              </Link>
              <Link
                to="/meeting?mode=watch"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/meeting") && location.search.includes("mode=watch")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Users className="w-4 h-4 mr-1 inline" />
                Watch
              </Link>
              <Link
                to="/rooms"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  isActive("/rooms")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Rooms
              </Link>
            </nav>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Link
                to="/meeting?mode=watch"
                onClick={closeMobileMenu}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/meeting") && location.search.includes("mode=watch")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Watch Meeting
              </Link>
              <Link
                to="/meeting?mode=host"
                onClick={closeMobileMenu}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/meeting") && location.search.includes("mode=host")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Host Meeting
              </Link>
              <Link
                to="/meeting?mode=join"
                onClick={closeMobileMenu}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/meeting") && location.search.includes("mode=join")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Meeting
              </Link>
              <Link
                to="/rooms"
                onClick={closeMobileMenu}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/rooms")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Browse Rooms
              </Link>
            </nav>
          </div>
        )}
      </header>
      <main id="main-content" className="flex-grow" role="main">
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
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              {getSimplePoweredByString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

export default AppLayout;