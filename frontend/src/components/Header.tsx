import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useRole } from '../contexts/RoleContext'
import { LanguageDropdown } from './LanguageDropdown'
import { Network, LayoutDashboard, Gavel, ArrowLeftRight, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
    const navigate = useNavigate()
    const { logout } = useRole()
    const location = useLocation()
    
    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

    return (
        <header className="h-16 sticky top-0 z-40 bg-[#000000]/80 backdrop-blur-sm border-b border-[rgba(255,255,255,0.05)] flex items-center px-6 w-full gap-8">
            <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/admin')}>
                <div className="w-8 h-8 rounded-lg bg-[#353434] flex items-center justify-center">
                    <Network className="text-[#ffffff] w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="font-semibold text-[20px] text-[#ffffff] tracking-tight">Nexus AI</div>
            </div>
            <nav className="hidden lg:flex items-center gap-1 flex-1">
                <button 
                    onClick={() => navigate('/admin')} 
                    className={cn(
                        "transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98]",
                        location.pathname === '/admin' ? "bg-[#353434] text-[#ffffff] font-medium" : "text-[#c4c7c8] hover:text-[#e5e2e1] hover:bg-[#1c1b1b]"
                    )}>
                    <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                    <span>Overview</span>
                </button>
                <button 
                    onClick={() => navigate('/admin/projects')} 
                    className={cn(
                        "transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98]",
                        location.pathname.startsWith('/admin/project') || location.pathname.startsWith('/admin/documents') ? "bg-[#353434] text-[#ffffff] font-medium" : "text-[#c4c7c8] hover:text-[#e5e2e1] hover:bg-[#1c1b1b]"
                    )}>
                    <Gavel className="w-4 h-4" strokeWidth={1.5} />
                    <span>Tenders</span>
                </button>
                <button 
                    onClick={() => navigate('/admin/comparisons')}
                    className={cn(
                        "transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98]",
                        location.pathname.startsWith('/admin/comparison') ? "bg-[#353434] text-[#ffffff] font-medium" : "text-[#c4c7c8] hover:text-[#e5e2e1] hover:bg-[#1c1b1b]"
                    )}>
                    <ArrowLeftRight className="w-4 h-4" strokeWidth={1.5} />
                    <span>Compare Bids</span>
                </button>
            </nav>
            <div className="flex items-center gap-4 flex-1 justify-end"></div>
            <div className="flex items-center gap-4 shrink-0">
                <LanguageDropdown />
                <button className="text-[#c4c7c8] hover:text-[#e5e2e1] hover:bg-[#1c1b1b] transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98]">
                    <Settings className="w-4 h-4" strokeWidth={1.5} />
                    <span>Settings</span>
                </button>
                <button onClick={handleLogout} className="text-[#c4c7c8] hover:text-[#e5e2e1] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98] ml-2">
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    )
}
