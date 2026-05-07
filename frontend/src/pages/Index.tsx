import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Network, LayoutDashboard, Gavel, ArrowLeftRight, BrainCircuit, 
    FileBarChart, Settings, Search, Bell, Wifi, CircleUser, Eye, 
    FolderOpen, FileUp, Hourglass, ShieldCheck, ArrowRight, Upload, 
    Clock, CheckCircle2, LogOut 
} from 'lucide-react'
import { api } from '@/lib/api'
import { useRole } from '@/contexts/RoleContext'
import { LanguageDropdown } from '@/components/LanguageDropdown'

export default function IndexPage() {
    const navigate = useNavigate()
    const { logout } = useRole()
    
    const handleLogout = () => {
        logout()
        navigate('/')
    }
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalDPRs: 0,
        pending: 0,
        approved: 0,
        loading: true
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [projects, dprs] = await Promise.all([
                    api.getProjects(),
                    api.getDPRs()
                ])

                const totalProjects = projects.length
                const totalDPRs = dprs.length
                const pending = dprs.filter(dpr => !(dpr as any).status || (dpr as any).status === 'pending' || (dpr as any).status === 'analyzing').length
                const approved = dprs.filter(dpr => (dpr as any).status === 'accepted').length

                setStats({ totalProjects, totalDPRs, pending, approved, loading: false })
            } catch (error) {
                console.error('Failed to fetch stats:', error)
                setStats(prev => ({ ...prev, loading: false }))
            }
        }

        fetchStats()

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchStats()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    return (
        <div className="bg-[#000000] text-[#e5e2e1] font-sans min-h-screen flex flex-col selection:bg-white/20">
            {/* TopNavBar */}
            <header className="h-16 sticky top-0 z-40 bg-[#000000]/80 backdrop-blur-sm border-b border-[rgba(255,255,255,0.05)] flex items-center px-6 w-full gap-8">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-[#353434] flex items-center justify-center">
                        <Network className="text-[#ffffff] w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="font-semibold text-[20px] text-[#ffffff] tracking-tight">Nexus AI</div>
                </div>
                <nav className="hidden lg:flex items-center gap-1 flex-1">
                    <button className="bg-[#353434] text-[#ffffff] font-medium flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98] transition-transform">
                        <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                        <span>Overview</span>
                    </button>
                    <button onClick={() => navigate('/admin/projects')} className="text-[#c4c7c8] hover:text-[#e5e2e1] hover:bg-[#1c1b1b] transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98]">
                        <Gavel className="w-4 h-4" strokeWidth={1.5} />
                        <span>Tenders</span>
                    </button>
                    <button onClick={() => navigate('/admin/comparisons')} className="text-[#c4c7c8] hover:text-[#e5e2e1] hover:bg-[#1c1b1b] transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98]">
                        <ArrowLeftRight className="w-4 h-4" strokeWidth={1.5} />
                        <span>Compare Bids</span>
                    </button>
                </nav>
                <div className="flex items-center gap-4 flex-1 justify-end">
                </div>
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

            {/* Canvas Area */}
            <main className="flex-1 p-6 max-w-[120rem] mx-auto w-full space-y-8 pb-20 mt-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                    <div>
                        <div className="inline-flex items-center gap-2 text-[12px] font-medium text-[#c4c7c8] tracking-wider uppercase mb-3">
                            <span className="w-1.5 h-1.5 bg-[#ffffff] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]"></span>
                            ADMIN CONSOLE
                        </div>
                        <h1 className="text-[36px] font-semibold text-[#ffffff] mb-2 leading-[1.2] tracking-[-0.025em]">Tender Evaluation Overview</h1>
                        <p className="text-[#c4c7c8] max-w-4xl text-[16px] leading-[1.625]">Monitor active tender submissions, track evaluation workflows, and leverage AI insights for comparative analysis across all organizational bid packs.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => navigate('/admin/projects')} className="bg-[rgba(255,255,255,0.02)] border border-white/10 hover:border-white/20 text-[#ffffff] px-4 py-2 rounded-full font-medium text-sm transition-colors backdrop-blur-sm inline-flex items-center gap-2">
                            <Eye className="w-4 h-4" strokeWidth={1.5} />
                            View Tenders
                        </button>
                        <button onClick={() => navigate('/admin/comparisons')} className="bg-[#ffffff] text-[#000000] px-4 py-2 rounded-full font-medium text-sm hover:bg-[#e2e2e2] transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] inline-flex items-center gap-2">
                            <ArrowLeftRight className="w-4 h-4" strokeWidth={1.5} />
                            Compare Bids
                        </button>
                    </div>
                </div>

                {/* KPI Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffffff]/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-[#ffffff]/10 transition-colors"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-[#c4c7c8] text-sm font-medium">Active Tenders</span>
                            <FolderOpen className="text-[#c4c7c8]/50 w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <div className="text-[60px] font-bold text-[#ffffff] leading-[1.1] tracking-[-0.025em] relative z-10">{stats.loading ? '--' : stats.totalProjects}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ae176]/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-[#4ae176]/10 transition-colors"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-[#c4c7c8] text-sm font-medium">Bids Submitted</span>
                            <FileUp className="text-[#c4c7c8]/50 w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <div className="text-[60px] font-bold text-[#ffffff] leading-[1.1] tracking-[-0.025em] relative z-10">{stats.loading ? '--' : stats.totalDPRs}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBBF24]/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-[#FBBF24]/10 transition-colors"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-[#c4c7c8] text-sm font-medium">Pending Evaluation</span>
                            <Hourglass className="text-[#c4c7c8]/50 w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <div className="text-[60px] font-bold text-[#ffffff] leading-[1.1] tracking-[-0.025em] relative z-10">{stats.loading ? '--' : stats.pending}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-[#22C55E]/10 transition-colors"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-[#c4c7c8] text-sm font-medium">Approved Bids</span>
                            <ShieldCheck className="text-[#c4c7c8]/50 w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <div className="text-[60px] font-bold text-[#ffffff] leading-[1.1] tracking-[-0.025em] relative z-10">{stats.loading ? '--' : stats.approved}</div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Recent Activity */}
                    <div className="space-y-6 flex flex-col h-full">
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[20px] font-semibold tracking-[0.025em] text-[#ffffff]">Recent Tender Activity</h3>
                                <button className="text-sm text-[#c4c7c8] hover:text-[#ffffff] transition-colors flex items-center gap-1">
                                    View All <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                            </div>
                            <div className="space-y-4 flex-1">
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0 mt-1">
                                        <Upload className="text-[#ffffff] w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium text-[#ffffff]">Highway Expansion Bid Pack uploaded</h4>
                                            <span className="text-xs text-[#c4c7c8] font-mono">10m ago</span>
                                        </div>
                                        <p className="text-sm text-[#c4c7c8] mb-2">Vendor 'Structura Corp' submitted updated compliance documents for Tender #A-204.</p>
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[rgba(255,255,255,0.02)] border border-white/10 text-[11px] font-medium text-[#c4c7c8] tracking-wider uppercase">
                                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                                            Document Upload
                                        </div>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-white/5"></div>
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0 mt-1">
                                        <Clock className="text-[#FBBF24] w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium text-[#ffffff]">Tender #A-204 moved to review</h4>
                                            <span className="text-xs text-[#c4c7c8] font-mono">1h ago</span>
                                        </div>
                                        <p className="text-sm text-[#c4c7c8] mb-2">Automated prescreening completed. 3 bids flagged for manual compliance review.</p>
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[11px] font-medium text-[#FBBF24] tracking-wider uppercase">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]"></span>
                                            Status Change
                                        </div>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-white/5"></div>
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0 mt-1">
                                        <CheckCircle2 className="text-[#22C55E] w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium text-[#ffffff]">AI Evaluation Complete: Project Nexus</h4>
                                            <span className="text-xs text-[#c4c7c8] font-mono">3h ago</span>
                                        </div>
                                        <p className="text-sm text-[#c4c7c8] mb-2">Comparative analysis generated for 5 shortlisted vendors. Ready for final committee review.</p>
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 text-[11px] font-medium text-[#22C55E] tracking-wider uppercase">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                                            Insight Ready
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 flex flex-col h-full">
                        {/* Workflow Status */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex-1 flex flex-col">
                            <h3 className="text-[20px] font-semibold tracking-[0.025em] text-[#ffffff] mb-6">Workflow Status</h3>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent flex-1 flex flex-col justify-between">
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#ffffff] bg-[#000000] shadow-[0_0_10px_rgba(255,255,255,0.2)] shrink-0 z-10">
                                        <span className="w-2 h-2 rounded-full bg-[#ffffff]"></span>
                                    </div>
                                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] flex flex-col justify-between ml-4 md:ml-0">
                                        <div className="p-3 bg-white/[0.03] border border-white/10 rounded-lg">
                                            <div className="font-medium text-[#ffffff] text-sm mb-1">Submitted</div>
                                            <div className="text-xs text-[#c4c7c8]">{stats.totalDPRs} Total Bids</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/20 bg-[#000000] shrink-0 z-10"></div>
                                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] flex flex-col justify-between ml-4 md:ml-0">
                                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg opacity-70">
                                            <div className="font-medium text-[#c4c7c8] text-sm mb-1">Under Review</div>
                                            <div className="text-xs text-[#c4c7c8]/70">{stats.pending} Pending</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/20 bg-[#000000] shrink-0 z-10"></div>
                                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] flex flex-col justify-between ml-4 md:ml-0">
                                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg opacity-70">
                                            <div className="font-medium text-[#c4c7c8] text-sm mb-1">Compared</div>
                                            <div className="text-xs text-[#c4c7c8]/70">12 Awaiting Decision</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/20 bg-[#000000] shrink-0 z-10"></div>
                                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] flex flex-col justify-between ml-4 md:ml-0">
                                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg opacity-70">
                                            <div className="font-medium text-[#c4c7c8] text-sm mb-1">Approved</div>
                                            <div className="text-xs text-[#c4c7c8]/70">{stats.approved} Finalized</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* System Status */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E]"></span>
                                </span>
                                <span className="text-sm font-medium text-[#ffffff]">System Operational</span>
                            </div>
                            <span className="text-xs text-[#c4c7c8] font-mono">Last checked: Just now</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto py-4 border-t border-[rgba(255,255,255,0.05)] bg-[#000000] w-full flex justify-between items-center px-6">
                <div className="text-[12px] font-medium uppercase tracking-wider text-[#c4c7c8]">
                    © 2025 Nexus AI Systems
                </div>
                <div className="flex items-center gap-6">
                    <a className="text-[12px] font-medium uppercase tracking-wider text-[#636565] hover:text-[#ffffff] transition-colors" href="#">Privacy</a>
                    <a className="text-[12px] font-medium uppercase tracking-wider text-[#636565] hover:text-[#ffffff] transition-colors" href="#">Terms</a>
                    <a className="text-[12px] font-medium uppercase tracking-wider text-[#636565] hover:text-[#ffffff] transition-colors" href="#">Support</a>
                </div>
            </footer>
        </div>
    )
}
