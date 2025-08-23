import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Users, Menu, X } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle.jsx'

function AppLayout({ children }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-zinc-950 dark:to-zinc-900">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-full">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-zinc-100">ICC Austin Stack</span>
          </Link>
          <div className="flex items-center space-x-3">
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Home
              </Link>
              <Link
                to="/manual"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/manual') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Manual
              </Link>
              <Link
                to="/create"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/create') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Create
              </Link>
              <Link
                to="/join"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/join') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Join
              </Link>
            </nav>
            <ThemeToggle />
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          <nav className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur">
            <div className="container mx-auto px-4 py-3 flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Home
              </Link>
              <Link
                to="/manual"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/manual') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Manual
              </Link>
              <Link
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/create') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Create
              </Link>
              <Link
                to="/join"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/join') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Join
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
