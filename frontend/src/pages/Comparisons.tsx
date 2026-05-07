import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Comparison, DPR } from '../lib/api'
import { useLanguage } from '../contexts/LanguageContext'
import { useRole } from '../contexts/RoleContext'
import { LanguageDropdown } from '../components/LanguageDropdown'
import { Network, LayoutDashboard, Gavel, ArrowLeftRight, Settings, LogOut, Loader2 } from 'lucide-react'

export default function ComparisonsPage() {
    const navigate = useNavigate()
    const { t } = useLanguage()
    const { logout } = useRole()
    
    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const [comparisons, setComparisons] = useState<Comparison[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        loadComparisons()
    }, [])

    const loadComparisons = async () => {
        try {
            setLoading(true)
            const data = await api.getComparisons()
            setComparisons(data)
        } catch (error) {
            console.error('Failed to load comparisons:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        if (!confirm(t('comparisons.deleteConfirm') || 'Are you sure you want to delete this comparison?')) return
        try {
            await api.deleteComparison(id)
            setComparisons(prev => prev.filter(c => c.id !== id))
        } catch (error) {
            console.error('Failed to delete comparison:', error)
            alert('Failed to delete comparison')
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        })
    }

    return (
        <div className="bg-black text-[#e5e2e1] min-h-screen flex flex-col font-body antialiased selection:bg-white/20 selection:text-white">
            {/* Top Navigation Bar */}
            <header className="h-16 sticky top-0 z-40 bg-[#000000]/80 backdrop-blur-sm border-b border-[rgba(255,255,255,0.05)] flex items-center px-6 w-full gap-8">
                <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/admin')}>
                    <div className="w-8 h-8 rounded-lg bg-[#353434] flex items-center justify-center">
                        <Network className="text-[#ffffff] w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="font-semibold text-[20px] text-[#ffffff] tracking-tight">Nexus AI</div>
                </div>
                <nav className="hidden lg:flex items-center gap-1 flex-1">
                    <button onClick={() => navigate('/admin')} className="text-[#c4c7c8] hover:text-[#e5e2e1] hover:bg-[#1c1b1b] transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98]">
                        <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                        <span>Overview</span>
                    </button>
                    <button onClick={() => navigate('/admin/projects')} className="text-[#c4c7c8] hover:text-[#e5e2e1] hover:bg-[#1c1b1b] transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98]">
                        <Gavel className="w-4 h-4" strokeWidth={1.5} />
                        <span>Tenders</span>
                    </button>
                    <button className="bg-[#353434] text-[#ffffff] font-medium flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98] transition-transform">
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

            <main className="pt-12 pb-20 px-6 max-w-[72rem] mx-auto space-y-12 w-full flex-grow">
                {/* Page Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center px-2 py-1 rounded border border-white/10 bg-white/[0.02]">
                            <span className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-[0.1em]">COMPARISON WORKSPACE</span>
                        </div>
                        <h1 className="text-[60px] font-bold leading-[1.1] tracking-[-0.025em] text-[#ffffff]">Comparisons</h1>
                        <p className="text-[#c4c7c8] text-lg leading-[1.625]">
                            Build and manage side-by-side evaluations. Select multiple bids within a tender to analyze compliance, pricing, and technical scores simultaneously.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 shrink-0">
                        <button className="px-5 py-2.5 rounded-full bg-[rgba(255,255,255,0.02)] border border-white/20 text-[#ffffff] font-medium hover:bg-white/[0.06] transition-colors duration-200 backdrop-blur-sm text-sm">
                            Import Selection
                        </button>
                        <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 rounded-full bg-[#ffffff] text-[#000000] font-medium hover:bg-[#ffffff]/90 transition-colors duration-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] text-sm flex items-center space-x-2">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span>New Comparison</span>
                        </button>
                    </div>
                </header>

                {/* KPI Strip */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:bg-white/[0.04] transition-colors duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[#c4c7c8] text-sm font-medium">Total Comparisons</span>
                            <span className="material-symbols-outlined text-[#c4c7c8] opacity-50">folder_open</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-3xl font-semibold text-[#ffffff]">{loading ? '--' : comparisons.length}</span>
                            <p className="text-xs text-[#c4c7c8] opacity-70">Active in workspace</p>
                        </div>
                    </div>
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:bg-white/[0.04] transition-colors duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[#c4c7c8] text-sm font-medium">Ready to Review</span>
                            <span className="material-symbols-outlined text-[#c4c7c8] opacity-50">check_circle</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-3xl font-semibold text-[#ffffff]">{loading ? '--' : comparisons.length}</span>
                            <p className="text-xs text-[#c4c7c8] opacity-70">All vendors submitted</p>
                        </div>
                    </div>
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:bg-white/[0.04] transition-colors duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[#c4c7c8] text-sm font-medium">Draft Comparisons</span>
                            <span className="material-symbols-outlined text-[#c4c7c8] opacity-50">edit_document</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-3xl font-semibold text-[#ffffff]">0</span>
                            <p className="text-xs text-[#c4c7c8] opacity-70">Awaiting more bids</p>
                        </div>
                    </div>
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:bg-white/[0.04] transition-colors duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[#c4c7c8] text-sm font-medium">Recently Updated</span>
                            <span className="material-symbols-outlined text-[#c4c7c8] opacity-50">history</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-3xl font-semibold text-[#ffffff]">{loading ? '--' : comparisons.length}</span>
                            <p className="text-xs text-[#c4c7c8] opacity-70">Last 7 days</p>
                        </div>
                    </div>
                </section>

                {/* Workspace Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2 border-b border-white/5 pb-4">
                    <div className="relative w-full sm:max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c7c8] opacity-50 text-[20px]">search</span>
                        <input className="w-full bg-white/[0.02] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-[#ffffff] placeholder-[#c4c7c8]/50 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all duration-200" placeholder="Search comparisons..." type="text"/>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-[#c4c7c8] text-sm flex items-center space-x-2 hover:bg-white/[0.06] transition-colors">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            <span>Filter</span>
                        </button>
                        <button className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-[#c4c7c8] text-sm flex items-center space-x-2 hover:bg-white/[0.06] transition-colors">
                            <span className="material-symbols-outlined text-[18px]">sort</span>
                            <span>Sort</span>
                        </button>
                        <div className="h-6 w-px bg-white/10 mx-2"></div>
                        <div className="flex rounded-lg bg-white/[0.02] border border-white/5 p-0.5">
                            <button aria-label="Grid view" className="p-1.5 rounded-md bg-white/10 text-[#ffffff] shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                            </button>
                            <button aria-label="List view" className="p-1.5 rounded-md text-[#c4c7c8] hover:text-[#ffffff] transition-colors">
                                <span className="material-symbols-outlined text-[18px]">list</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-white" />
                            </div>
                        ) : comparisons.length === 0 ? (
                            <div className="rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center p-12 min-h-[400px] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[rgba(59,130,246,0.2)] opacity-5 mix-blend-screen pointer-events-none transition-opacity duration-500 group-hover:opacity-10 rounded-2xl blur-3xl"></div>
                                <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                                        <span className="material-symbols-outlined text-4xl text-[#c4c7c8]">difference</span>
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-[20px] font-semibold text-[#ffffff]">No comparisons yet</h2>
                                        <p className="text-[14px] leading-[1.625] text-[#c4c7c8]">
                                            Start by creating a new workspace to evaluate bids side-by-side. You can compare up to 5 vendors simultaneously.
                                        </p>
                                    </div>
                                    <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 rounded-full bg-[#ffffff] text-[#000000] font-medium hover:bg-[#ffffff]/90 transition-colors duration-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center space-x-2 mt-4">
                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                        <span>Create New Comparison</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <section className="space-y-4">
                                <h3 className="font-semibold text-lg text-[#ffffff]">Recent Activity</h3>
                                <div className="grid gap-4">
                                    {comparisons.map((comparison) => (
                                        <div
                                            key={comparison.id}
                                            className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer group relative overflow-hidden"
                                            onClick={() => navigate(`/admin/comparison-chat/${comparison.id}/detail`)}
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffffff]/20 group-hover:bg-[#ffffff] transition-colors"></div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 ml-4">
                                                    <h3 className="text-xl font-semibold text-[#ffffff] mb-2">{comparison.name}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-[#c4c7c8]">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[16px]">description</span>
                                                            <span>{comparison.dpr_count || 0} documents</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                            <span>{formatDate(comparison.created_ts)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        className="text-[#ffb4ab] hover:text-white hover:bg-[#ffb4ab]/20 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                        onClick={(e) => handleDelete(e, comparison.id)}
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                    <span className="material-symbols-outlined text-[#ffffff] opacity-50 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column (Operational) */}
                    <div className="space-y-6">
                        {/* Comparison Readiness Panel */}
                        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-6">
                            <h3 className="font-semibold text-base text-[#ffffff] mb-5 flex items-center space-x-2">
                                <span className="material-symbols-outlined text-[18px] text-[#c4c7c8]">monitoring</span>
                                <span>Comparison Readiness</span>
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-[#353434]"></div>
                                        <span className="text-sm text-[#c4c7c8]">Ready Tenders</span>
                                    </div>
                                    <span className="font-mono text-sm text-[#ffffff]">{comparisons.length}</span>
                                </div>
                                <div className="h-px w-full bg-white/5"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-[#353434]"></div>
                                        <span className="text-sm text-[#c4c7c8]">Draft Sets</span>
                                    </div>
                                    <span className="font-mono text-sm text-[#ffffff]">0</span>
                                </div>
                                <div className="h-px w-full bg-white/5"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-[#ffb4ab]/50"></div>
                                        <span className="text-sm text-[#c4c7c8]">Missing Docs</span>
                                    </div>
                                    <span className="font-mono text-sm text-[#ffffff]">0</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Start */}
                        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-6">
                            <h3 className="font-semibold text-base text-[#ffffff] mb-5 flex items-center space-x-2">
                                <span className="material-symbols-outlined text-[18px] text-[#c4c7c8]">bolt</span>
                                <span>Quick Start</span>
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group text-left">
                                    <div className="flex items-center space-x-3">
                                        <span className="material-symbols-outlined text-[#c4c7c8] group-hover:text-[#ffffff] transition-colors text-[20px]">folder_special</span>
                                        <span className="text-sm font-medium text-[#c4c7c8] group-hover:text-[#ffffff] transition-colors">Compare by Tender</span>
                                    </div>
                                    <span className="material-symbols-outlined text-[#c4c7c8]/50 text-[18px]">chevron_right</span>
                                </button>
                                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group text-left">
                                    <div className="flex items-center space-x-3">
                                        <span className="material-symbols-outlined text-[#c4c7c8] group-hover:text-[#ffffff] transition-colors text-[20px]">format_list_bulleted</span>
                                        <span className="text-sm font-medium text-[#c4c7c8] group-hover:text-[#ffffff] transition-colors">Compare by Shortlist</span>
                                    </div>
                                    <span className="material-symbols-outlined text-[#c4c7c8]/50 text-[18px]">chevron_right</span>
                                </button>
                                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group text-left opacity-50 cursor-not-allowed">
                                    <div className="flex items-center space-x-3">
                                        <span className="material-symbols-outlined text-[#c4c7c8] text-[20px]">lock_clock</span>
                                        <span className="text-sm font-medium text-[#c4c7c8]">Reopen Previous</span>
                                    </div>
                                    <span className="material-symbols-outlined text-[#c4c7c8]/30 text-[18px]">lock</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showCreateModal && (
                <CreateComparisonModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={(id) => {
                        setShowCreateModal(false)
                        navigate(`/admin/comparison-chat/${id}/detail`)
                    }}
                />
            )}
        </div>
    )
}

function CreateComparisonModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (id: number) => void }) {
    const [dprs, setDprs] = useState<DPR[]>([])
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadDPRs()
    }, [])

    const loadDPRs = async () => {
        try {
            const data = await api.getDPRs()
            setDprs(data)
        } catch (error) {
            console.error('Failed to load DPRs:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleCreate = async () => {
        if (!name.trim() || selectedIds.length < 2) return

        try {
            setCreating(true)
            const result = await api.createComparison(name, selectedIds)
            onSuccess(result.comparison_id)
        } catch (error) {
            console.error('Failed to create comparison:', error)
            alert('Failed to create comparison. Please try again.')
        } finally {
            setCreating(false)
        }
    }

    const filteredDprs = dprs.filter(dpr =>
        dpr.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dpr.summary_json?.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#111111] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-[20px] font-semibold text-[#ffffff]">Create New Comparison</h2>
                    <p className="text-[#c4c7c8] text-[14px] mt-1">Select at least 2 documents to compare</p>
                </div>

                <div className="p-6 border-b border-white/10">
                    <label className="block text-sm font-medium text-[#c4c7c8] mb-2">
                        Comparison Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Q1 2024 Projects Comparison"
                        className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-1 focus:ring-white focus:border-white bg-black text-[#ffffff] placeholder-[#c4c7c8]/50"
                    />
                </div>

                <div className="p-6 border-b border-white/10">
                    <label className="block text-sm font-medium text-[#c4c7c8] mb-2">
                        Search Documents
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c7c8]/50">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by filename or project name..."
                            className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-lg focus:ring-1 focus:ring-white focus:border-white bg-black text-[#ffffff] placeholder-[#c4c7c8]/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <label className="block text-sm font-medium text-[#c4c7c8] mb-3">
                        Select Documents ({selectedIds.length} selected)
                    </label>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#ffffff]" />
                        </div>
                    ) : filteredDprs.length === 0 ? (
                        <p className="text-center text-[#c4c7c8] py-8">No documents found</p>
                    ) : (
                        <div className="space-y-2">
                            {filteredDprs.map((dpr) => (
                                <label
                                    key={dpr.id}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedIds.includes(dpr.id)
                                        ? 'border-[#ffffff]/50 bg-white/[0.05]'
                                        : 'border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(dpr.id)}
                                        onChange={() => toggleSelection(dpr.id)}
                                        className="w-4 h-4 text-[#ffffff] rounded border-white/20 bg-black checked:bg-white checked:border-white"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[#ffffff] truncate">
                                            {dpr.summary_json?.projectName || dpr.original_filename}
                                        </p>
                                        <p className="text-sm text-[#c4c7c8] truncate">{dpr.original_filename}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#0a0a0a]">
                    <button onClick={onClose} disabled={creating} className="px-5 py-2.5 rounded-full border border-white/20 text-[#ffffff] font-medium hover:bg-white/[0.06] transition-colors duration-200">
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim() || selectedIds.length < 2 || creating}
                        className="px-5 py-2.5 rounded-full bg-[#ffffff] text-[#000000] font-medium hover:bg-[#ffffff]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {creating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Comparison'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
