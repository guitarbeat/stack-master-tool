import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-zinc-950 dark:to-zinc-900">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            aria-current={isActive('/') ? 'page' : undefined}
            className="flex items-center space-x-2"
          >
            <img
              src="/icc-removebg-preview.png"
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
              <Link
                to="/create"
                aria-current={isActive('/create') ? 'page' : undefined}
                className={`inline-flex h-10 items-center justify-center px-4 rounded-lg text-sm font-medium ${
                  isActive('/create') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="hidden sm:inline">Create Meeting</span>
                <span className="sm:hidden">Create</span>
              </Link>
              <Link
                to="/join"
                aria-current={isActive('/join') ? 'page' : undefined}
                className={`inline-flex h-10 items-center justify-center px-4 rounded-lg text-sm font-medium ${
                  isActive('/join') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="hidden sm:inline">Join Meeting</span>
                <span className="sm:hidden">Join</span>
              </Link>
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
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/create') ? 'page' : undefined}
                className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
                  isActive('/create') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Create Meeting
              </Link>
              <Link
                to="/join"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/join') ? 'page' : undefined}
                className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
                  isActive('/join') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Join Meeting
              </Link>
            </div>
          </nav>
        )}
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}

export default AppLayout
