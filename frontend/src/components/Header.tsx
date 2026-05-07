import { FileText, Moon, Sun, CheckCircle2, LogOut } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './ui/Button'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useRole } from '../contexts/RoleContext'
import { Card } from './ui/Card'
import { LanguageDropdown } from './LanguageDropdown'

export function Header() {
  const [isDark, setIsDark] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useRole()



  useEffect(() => {
    // Check localStorage first, then check current state
    const savedTheme = localStorage.getItem('theme')
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && document.documentElement.classList.contains('dark'))

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    document.documentElement.classList.toggle('dark')
    setIsDark(newDarkMode)
    // Save preference to localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  const isActive = (path: string) => location.pathname === path
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
              <FileText className="h-5 w-5 text-white" />
            </div>

            <div className="hidden sm:block leading-tight">
              <span className="block text-base font-heading font-semibold text-foreground">
                Tender Evaluation Portal
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Bid Review Console
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/admin"
              className={cn(
                'px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-lg',
                isActive('/admin')
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              Home
            </Link>
            <Link
              to="/admin/projects"
              className={cn(
                'px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-lg',
                isActive('/admin/projects') || location.pathname.startsWith('/admin/projects/')
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              Tenders
            </Link>
            <Link
              to="/admin/comparisons"
              className={cn(
                'px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-lg',
                isActive('/admin/comparisons') || location.pathname.startsWith('/admin/comparison-chat/')
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              Compare Bids
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageDropdown />
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="h-4.5 w-4.5 text-muted-foreground" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-muted-foreground" />
              )}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>


    </>
  )
}
