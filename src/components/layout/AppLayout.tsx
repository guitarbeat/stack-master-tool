import { ReactNode, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Users, Menu, X, Plus, UserPlus } from 'lucide-react'
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

  const activeSegment: 'create' | 'join' = useMemo(() => {
    if (location.pathname.startsWith('/create')) return 'create'
    if (location.pathname.startsWith('/join')) return 'join'
    return 'join'
  }, [location.pathname])

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
              src="/icc-logo-no-bg.png"
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
              <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-xl p-1.5 flex backdrop-blur-sm border border-gray-200/60 dark:border-zinc-700/60 shadow-sm w-full max-w-md">
                <div
                  className={`toggle-indicator absolute top-1.5 h-[calc(100%-12px)] w-[calc(50%-6px)] rounded-lg transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 shadow-sm ${
                    activeSegment === 'create' ? 'left-[3px]' : 'left-[calc(50%+3px)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => navigate('/create')}
                  className={`relative z-10 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
                    activeSegment === 'create'
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100'
                  }`}
                >
                  <Plus className={`w-4 h-4 mr-2 transition-all ${activeSegment === 'create' ? 'text-white' : 'text-primary'}`} />
                  <span className="hidden sm:inline">Create Meeting</span>
                  <span className="sm:hidden">Create</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/join')}
                  className={`relative z-10 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
                    activeSegment === 'join'
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100'
                  }`}
                >
                  <UserPlus className={`w-4 h-4 mr-2 transition-all ${activeSegment === 'join' ? 'text-white' : 'text-primary'}`} />
                  <span className="hidden sm:inline">Join Meeting</span>
                  <span className="sm:hidden">Join</span>
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
              <button
                className="w-full h-10 flex items-center px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800 text-left"
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate('/create')
                }}
              >
                Create Meeting
              </button>
              <button
                className="w-full h-10 flex items-center px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800 text-left"
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate('/join')
                }}
              >
                Join Meeting
              </button>
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
