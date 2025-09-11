import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, MessageSquare, QrCode } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu'

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-zinc-950 dark:to-zinc-900 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            aria-current={isActive('/') ? 'page' : undefined}
            className="flex items-center space-x-2"
          >
            <img
              src="https://stack.alw.lol/icc-removebg-preview.png"
              alt="ICC Austin logo"
              className="w-6 h-6 object-contain drop-shadow-sm dark:brightness-110"
            />
            <span className="font-semibold text-gray-900 dark:text-zinc-100">ICC Austin Stack</span>
          </Link>
          <div className="flex items-center space-x-3">
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                aria-current={isActive('/') ? 'page' : undefined}
                className={`inline-flex h-10 items-center justify-center px-4 rounded-lg text-sm font-medium ${
                  isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Home
              </Link>
              <Link
                to="/manual"
                aria-current={isActive('/manual') ? 'page' : undefined}
                className={`inline-flex h-10 items-center justify-center px-4 rounded-lg text-sm font-medium ${
                  isActive('/manual') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Manual
              </Link>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className={`h-10 px-4 rounded-lg text-sm font-medium ${
                        isActive('/create') || isActive('/join') || isActive('/create-or-join') 
                          ? 'bg-primary text-white' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className="hidden sm:inline">Create or Join</span>
                      <span className="sm:hidden">Meeting</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[400px]">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/create-or-join"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="w-4 h-4 text-primary" />
                              <div className="text-sm font-medium leading-none">Create or Join Meeting</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Unified interface to create new meetings or join existing ones
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        <div className="h-px bg-border" />
                        <NavigationMenuLink asChild>
                          <Link
                            to="/create"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="w-4 h-4 text-primary" />
                              <div className="text-sm font-medium leading-none">Create Meeting</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Start a new meeting and share the code with participants
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/join"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center space-x-2">
                              <QrCode className="w-4 h-4 text-accent" />
                              <div className="text-sm font-medium leading-none">Join Meeting</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Enter a meeting code to join an existing meeting
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
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
          >
            <div className="container mx-auto px-4 py-3 flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/') ? 'page' : undefined}
                className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
                  isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Home
              </Link>
              <Link
                to="/manual"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/manual') ? 'page' : undefined}
                className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
                  isActive('/manual') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Manual
              </Link>
              <Link
                to="/create-or-join"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/create-or-join') ? 'page' : undefined}
                className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
                  isActive('/create-or-join') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Create or Join Meeting
              </Link>
              <div className="ml-6 space-y-1">
                <Link
                  to="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive('/create') ? 'page' : undefined}
                  className={`h-8 flex items-center px-4 rounded-lg text-sm font-medium ${
                    isActive('/create') ? 'bg-primary/20 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 mr-2" />
                  Create Meeting
                </Link>
                <Link
                  to="/join"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive('/join') ? 'page' : undefined}
                  className={`h-8 flex items-center px-4 rounded-lg text-sm font-medium ${
                    isActive('/join') ? 'bg-primary/20 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <QrCode className="w-3 h-3 mr-2" />
                  Join Meeting
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white/70 backdrop-blur border-t border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800 mt-auto">
        <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center space-y-4">
          <img
            src="https://stack.alw.lol/icc2-removebg-preview.png"
            alt="ICC2 Logo"
            className="h-12 w-auto object-contain drop-shadow-sm dark:brightness-110"
          />
          <p className="text-sm text-gray-600 dark:text-zinc-400 text-center">
            Powered by ICC Austin Stack
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout
