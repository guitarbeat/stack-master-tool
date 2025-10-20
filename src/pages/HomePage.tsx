import { ActionCards } from '@/components/features/homepage/ActionCards'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut, Users, QrCode, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

function HomePage() {
  const { user, signOut } = useAuth()
  const { showToast } = useToast()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to sign out',
      })
    } else {
      showToast({
        type: 'success',
        title: 'Signed out',
        message: 'Successfully signed out',
      })
    }
  }

  return (
    <main className="min-h-screen bg-background" role="main">
      {user && (
        <div className="border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void handleSignOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* * Consolidated Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Stack Master Tool
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Democratic meeting facilitation with organized speaking queues. 
            Choose your role to participate in fair, structured discussions.
          </p>
          
          {/* * Mode Overview - Differentiated */}
          <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base mb-12">
            <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-full shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">HOST</span>
                <span className="text-xs text-muted-foreground">Facilitate & Control</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-4 py-3 rounded-full shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-green-600 dark:text-green-400 text-sm">JOIN</span>
                <span className="text-xs text-muted-foreground">Participate & Speak</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 px-4 py-3 rounded-full shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-purple-600 dark:text-purple-400 text-sm">WATCH</span>
                <span className="text-xs text-muted-foreground">Observe & Display</span>
              </div>
            </div>
          </div>
        </div>

        <ActionCards />
      </div>
    </main>
  )
}

export default HomePage
