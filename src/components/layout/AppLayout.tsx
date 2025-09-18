import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Plus, UserPlus, MessageSquare, QrCode } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import { useMouseFollow } from '@/hooks/use-mouse-follow'

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

  const { containerRef, mousePosition, isHovering, handleMouseMove, handleMouseEnter, handleMouseLeave } = useMouseFollow({
    enabled: true,
    smoothness: 0.2
  })

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-zinc-950 dark:to-zinc-900 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800" role="banner">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            aria-current={isActive('/') ? 'page' : undefined}
            aria-label="Home"
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
            <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
              {/* Manual/Create/Join toggle */}
              {(() => {
                const mode = isActive('/manual') ? 'manual' : (isActive('/join') ? 'join' : (isActive('/create') ? 'create' : 'create'))
                
                // Calculate indicator position based on mouse or selected state
                const getIndicatorStyle = () => {
                  if (isHovering) {
                    // Follow mouse position when hovering
                    const containerWidth = containerRef.current?.offsetWidth || 0
                    const indicatorWidth = containerWidth / 3 - 4
                    const mouseX = mousePosition.x
                    
                    // Determine which section we're in
                    const sectionWidth = containerWidth / 3
                    let leftPosition, background
                    
                    if (mouseX < sectionWidth) {
                      // Manual section
                      leftPosition = Math.max(4, Math.min(mouseX - indicatorWidth / 2, sectionWidth - indicatorWidth - 4))
                      background = 'linear-gradient(to right, hsl(var(--secondary)), hsl(var(--secondary-foreground)))'
                    } else if (mouseX < sectionWidth * 2) {
                      // Create section
                      leftPosition = Math.max(sectionWidth + 2, Math.min(mouseX - indicatorWidth / 2, sectionWidth * 2 - indicatorWidth - 2))
                      background = 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))'
                    } else {
                      // Join section
                      leftPosition = Math.max(sectionWidth * 2 + 2, Math.min(mouseX - indicatorWidth / 2, containerWidth - indicatorWidth - 4))
                      background = 'linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--sage-green)))'
                    }
                    
                    return {
                      left: `${leftPosition}px`,
                      width: `${indicatorWidth}px`,
                      background
                    }
                  } else {
                    // Use selected state when not hovering
                    if (mode === 'manual') {
                      return {
                        left: '4px',
                        width: 'calc(33.333% - 4px)',
                        background: 'linear-gradient(to right, hsl(var(--secondary)), hsl(var(--secondary-foreground)))'
                      }
                    } else if (mode === 'create') {
                      return {
                        left: 'calc(33.333% + 2px)',
                        width: 'calc(33.333% - 4px)',
                        background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))'
                      }
                    } else {
                      return {
                        left: 'calc(66.666% + 2px)',
                        width: 'calc(33.333% - 4px)',
                        background: 'linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--sage-green)))'
                      }
                    }
                  }
                }

                return (
                  <div 
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="relative bg-gradient-to-r from-muted/50 to-muted/30 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-xl p-1 flex backdrop-blur-sm border border-border/50 shadow-elegant w-[360px]"
                  >
                    <div 
                      className="toggle-indicator"
                      style={getIndicatorStyle()}
                    />
                    <button
                      onClick={() => navigate('/manual')}
                      className={`toggle-button relative z-10 px-3 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
                        mode === 'manual'
                          ? 'text-white shadow-sm'
                          : 'text-foreground/70 hover:text-foreground dark:text-zinc-300 dark:hover:text-zinc-100'
                      }`}
                      aria-current={mode === 'manual' ? 'page' : undefined}
                    >
                      <span className="text-xs">Manual</span>
                    </button>
                    <button
                      onClick={() => navigate('/create')}
                      className={`toggle-button relative z-10 px-3 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
                        mode === 'create'
                          ? 'text-white shadow-sm'
                          : 'text-foreground/70 hover:text-foreground dark:text-zinc-300 dark:hover:text-zinc-100'
                      }`}
                      aria-current={mode === 'create' ? 'page' : undefined}
                    >
                      <Plus className={`w-3 h-3 mr-1 transition-all duration-300 ${
                        mode === 'create' ? 'text-white' : 'text-primary'
                      }`} />
                      <span className="text-xs">Create</span>
                    </button>
                    <button
                      onClick={() => navigate('/join')}
                      className={`toggle-button relative z-10 px-3 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
                        mode === 'join'
                          ? 'text-white shadow-sm'
                          : 'text-foreground/70 hover:text-foreground dark:text-zinc-300 dark:hover:text-zinc-100'
                      }`}
                      aria-current={mode === 'join' ? 'page' : undefined}
                    >
                      <UserPlus className={`w-3 h-3 mr-1 transition-all duration-300 ${
                        mode === 'join' ? 'text-white' : 'text-moss-green'
                      }`} />
                      <span className="text-xs">Join</span>
                    </button>
                  </div>
                )
              })()}
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
      <main className="flex-grow" role="main">
        {children}
      </main>
      <footer className="bg-white/70 backdrop-blur border-t border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800 mt-auto" role="contentinfo">
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
