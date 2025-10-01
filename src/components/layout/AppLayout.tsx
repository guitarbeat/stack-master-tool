import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, UserPlus, Users } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
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
              className="hidden md:flex items-center space-x-1"
              role="navigation"
              aria-label="Main navigation"
            >
              <Link
                to="/watch"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/watch")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Users className="w-4 h-4 mr-1 inline" />
                Watch
              </Link>
              <Link
                to="/create"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  isActive("/create")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Plus className="w-4 h-4 mr-1" />
                Host
              </Link>
              <Link
                to="/join"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  isActive("/join")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Join
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
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