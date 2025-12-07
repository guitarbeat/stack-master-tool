import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, DoorOpen, Menu, X, MessageSquare, LogOut } from "lucide-react";
import { NavLink } from "@/components/ui/nav-link";
import ThemeToggle from "../ui/ThemeToggle";
import { getSimplePoweredByString } from "@/utils/version";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ConnectionStatusBanner from "@/components/shared/ConnectionStatusBanner";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const getUserInitial = () => {
    if (profile?.display_name) return profile.display_name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-background flex flex-col">
      <header
        className="sticky top-0 z-50 bg-card/70 backdrop-blur border-b border-border"
        role="banner"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            aria-label="Home"
            className="flex items-center space-x-2"
          >
            <img
              src="/icc-removebg-preview.png"
              alt="ICC Austin logo"
              className="w-6 h-6 object-contain drop-shadow-sm dark:brightness-110"
            />
            <span className="font-semibold text-foreground">
              Speaking Queue
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <nav
              className="hidden md:flex items-center space-x-1"
              role="navigation"
              aria-label="Main navigation"
            >
              <NavLink to="/facilitator" icon={Plus}>Host</NavLink>
              <NavLink to="/enter" icon={DoorOpen}>Enter Room</NavLink>
              <NavLink to="/rooms" icon={MessageSquare}>Rooms</NavLink>
            </nav>
            <ThemeToggle />
            
            {/* User Menu - only show when logged in */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitial()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {profile?.display_name || user.email || 'User'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/facilitator')}>
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void handleSignOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg"
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
          <div className="md:hidden border-t border-border bg-card">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <NavLink to="/facilitator" icon={Plus} variant="mobile" onClick={closeMobileMenu}>
                Host
              </NavLink>
              <NavLink to="/enter" icon={DoorOpen} variant="mobile" onClick={closeMobileMenu}>
                Enter Room
              </NavLink>
              <NavLink to="/rooms" icon={MessageSquare} variant="mobile" onClick={closeMobileMenu}>
                Rooms
              </NavLink>
            </nav>
          </div>
        )}
      </header>
      <ConnectionStatusBanner />
      <main id="main-content" className="flex-grow" role="main">
        {children}
      </main>
      <footer
        className="bg-card/70 backdrop-blur border-t border-border mt-auto"
        role="contentinfo"
      >
        <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center space-y-4">
          <img
            src="/icc2-removebg-preview.png"
            alt="ICC2 Logo"
            className="h-12 w-auto object-contain drop-shadow-sm dark:brightness-110"
          />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
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