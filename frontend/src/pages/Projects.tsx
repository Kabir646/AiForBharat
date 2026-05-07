import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type Project } from '@/lib/api'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRole } from '@/contexts/RoleContext'
import { LanguageDropdown } from '@/components/LanguageDropdown'
import { Network, LayoutDashboard, Gavel, ArrowLeftRight, Settings, LogOut, X, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Dropdown Options
const STATE_OPTIONS = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]

const SCHEME_OPTIONS = [
    'Force Modernisation Plan',
    'CAPF Infrastructure Development',
    'Smart Camp Initiative',
    'Make in India (Defence)',
    'CAPF Welfare & Housing',
    'Digital Police / e-Office',
    'Swachh Bharat (Barracks)'
]

const SECTOR_OPTIONS: Record<string, string[]> = {
    'Force Modernisation Plan': ['Weapons & Ammunition', 'Vehicles & Mobility', 'Surveillance & Security Systems', 'Training Equipment & Simulators', 'Uniform & Clothing & Gear'],
    'CAPF Infrastructure Development': ['Infrastructure & Construction', 'Barracks & Accommodation', 'Border Outposts', 'Road Connectivity', 'Helipads & Airstrips'],
    'Smart Camp Initiative': ['IT & Communication Equipment', 'Surveillance Systems', 'Access Control', 'Smart Lighting', 'CCTV & Monitoring'],
    'Make in India (Defence)': ['Weapons & Ammunition', 'Vehicles & Mobility', 'IT & Communication Equipment', 'Uniform & Clothing & Gear', 'Training Equipment & Simulators'],
    'CAPF Welfare & Housing': ['Welfare & Sports Equipment', 'Medical & Healthcare Supplies', 'Canteen Stores', 'Recreation Facilities', 'Education & Schools'],
    'Digital Police / e-Office': ['IT & Communication Equipment', 'Software & Licenses', 'Data Centers', 'e-Governance Systems', 'Networking'],
    'Swachh Bharat (Barracks)': ['Sanitation Equipment', 'Water Supply', 'Solid Waste Management', 'Hygiene Supplies', 'Green Infrastructure']
}

const ALL_SECTORS = Array.from(new Set(Object.values(SECTOR_OPTIONS).flat())).sort()

export default function ProjectsPage() {
    const navigate = useNavigate()
    const { t } = useLanguage()
    const { logout } = useRole()
    
    const handleLogout = () => {
        logout()
        navigate('/')
    }
    
    const [searchQuery, setSearchQuery] = useState('')
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({ state: 'ALL', scheme: 'ALL', sector: 'ALL' })

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newProject, setNewProject] = useState({
        name: '', state: STATE_OPTIONS[0], scheme: SCHEME_OPTIONS[0], sector: SECTOR_OPTIONS[SCHEME_OPTIONS[0]][0]
    })
    const [creating, setCreating] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null)

    useEffect(() => { loadProjects() }, [])

    useEffect(() => {
        if (newProject.scheme) {
            const validSectors = SECTOR_OPTIONS[newProject.scheme] || []
            if (!validSectors.includes(newProject.sector)) {
                setNewProject(prev => ({ ...prev, sector: validSectors[0] }))
            }
        }
    }, [newProject.scheme, newProject.sector])

    const loadProjects = async () => {
        try {
            setLoading(true)
            const data = await api.getProjects()
            setProjects(data)
        } catch (err) {
            setError('Failed to load projects')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newProject.name.trim()) return setValidationError(t('projects.validationName'))
        if (!newProject.state) return setValidationError(t('projects.validationState'))
        if (!newProject.scheme) return setValidationError(t('projects.validationScheme'))
        if (!newProject.sector) return setValidationError(t('projects.validationSector'))

        try {
            setCreating(true); setValidationError(null)
            await api.createProject({
                name: newProject.name, state: newProject.state, scheme: newProject.scheme, sector: newProject.sector
            })
            setIsModalOpen(false)
            setNewProject({ name: '', state: STATE_OPTIONS[1], scheme: SCHEME_OPTIONS[1], sector: SECTOR_OPTIONS[SCHEME_OPTIONS[1]][0] })
            loadProjects()
        } catch (err) {
            setValidationError(t('projects.creatingFailed'))
        } finally {
            setCreating(false)
        }
    }

    const confirmDelete = async () => {
        if (!projectToDelete) return
        try {
            await api.deleteProject(projectToDelete)
            setProjects(projects.filter(p => p.id !== projectToDelete))
            setProjectToDelete(null)
        } catch (err) {
            alert('Failed to delete project')
        }
    }

    const handleDeleteClick = (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation()
        setProjectToDelete(projectId)
    }

    const getValidSectors = () => SECTOR_OPTIONS[newProject.scheme] || []

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesState = filters.state === 'ALL' || p.state === filters.state
        const matchesScheme = filters.scheme === 'ALL' || p.scheme === filters.scheme
        const matchesSector = filters.sector === 'ALL' || p.sector === filters.sector
        return matchesSearch && matchesState && matchesScheme && matchesSector
    })

    const totalBidDocuments = projects.reduce((sum, project) => sum + (project.dpr_count || 0), 0)
    const projectsWithDocuments = projects.filter(project => (project.dpr_count || 0) > 0).length
    const readyForComparison = projects.filter(project => project.has_comparison || (project.dpr_count || 0) > 1).length
    
    // Status metrics for Review Readiness
    const totalProjects = projects.length || 1
    const readyPercentage = Math.round((readyForComparison / totalProjects) * 100)
    const pendingPercentage = Math.round(((totalProjects - readyForComparison) / totalProjects) * 100)

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
                    <button className="bg-[#353434] text-[#ffffff] font-medium flex items-center gap-2 px-3 py-2 rounded-lg text-sm active:scale-[0.98] transition-transform">
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

            <main className="flex-grow w-full max-w-[120rem] mx-auto px-6 pt-12 pb-24 flex flex-col gap-12">
                {/* Page Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-3">
                        <span className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            PROCUREMENT WORKSPACE
                        </span>
                        <h1 className="text-[60px] font-bold leading-[1.1] tracking-[-0.025em] text-white">Tenders</h1>
                        <p className="text-[#c4c7c8] max-w-2xl text-[16px] leading-[1.6]">
                            Manage and evaluate all active procurement dossiers. Upload bid documents, monitor readiness, and initiate AI-assisted comparative reviews.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-full border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2 text-[14px]">
                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                            Upload Documents
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-white text-black px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2 font-medium text-[14px]"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Create Tender
                        </button>
                    </div>
                </header>

                {/* KPI Strip */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-[48px]">folder_open</span>
                        </div>
                        <span className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest">Total Tenders</span>
                        <span className="text-[30px] font-semibold text-white tracking-[-0.025em]">{projects.length}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-[48px]">description</span>
                        </div>
                        <span className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest">Bid Documents</span>
                        <span className="text-[30px] font-semibold text-white tracking-[-0.025em]">{totalBidDocuments}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-[48px]">check_circle</span>
                        </div>
                        <span className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest">With Documents</span>
                        <span className="text-[30px] font-semibold text-white tracking-[-0.025em]">{projectsWithDocuments}</span>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                            <span className="material-symbols-outlined text-[48px]">compare_arrows</span>
                        </div>
                        <span className="text-[12px] font-medium text-white uppercase tracking-widest">Ready to Compare</span>
                        <span className="text-[30px] font-semibold text-white tracking-[-0.025em]">{readyForComparison}</span>
                    </div>
                </section>

                {/* Main Workspace Area */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Toolbar & Grid */}
                    <div className="flex-grow flex flex-col gap-6">
                        {/* Workspace Toolbar */}
                        <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 border border-white/5 rounded-lg">
                            <div className="flex-grow relative flex items-center">
                                <span className="material-symbols-outlined absolute left-3 text-[#c4c7c8] text-[20px]">search</span>
                                <input 
                                    className="w-full bg-transparent border-none text-[14px] text-white placeholder:text-[#c4c7c8] focus:ring-0 pl-10 outline-none" 
                                    placeholder="Search tender name, ID, or scheme..." 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="h-8 w-px bg-white/10 hidden sm:block self-center"></div>
                            <div className="flex items-center gap-2 px-2">
                                <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors text-[14px] ${showFilters ? 'bg-white/10 text-white' : 'text-[#c4c7c8] hover:text-white'}`}>
                                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-white/5 bg-white/5 p-4 animate-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-[12px] font-medium mb-1.5 text-[#c4c7c8] uppercase tracking-widest">State</label>
                                    <select
                                        value={filters.state}
                                        onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                                        className="w-full rounded-md border border-white/10 bg-black text-white px-3 py-2 text-[14px] focus:outline-none focus:border-white/30"
                                    >
                                        <option value="ALL">ALL STATES</option>
                                        {STATE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium mb-1.5 text-[#c4c7c8] uppercase tracking-widest">Scheme</label>
                                    <select
                                        value={filters.scheme}
                                        onChange={(e) => setFilters({ ...filters, scheme: e.target.value })}
                                        className="w-full rounded-md border border-white/10 bg-black text-white px-3 py-2 text-[14px] focus:outline-none focus:border-white/30"
                                    >
                                        <option value="ALL">ALL SCHEMES</option>
                                        {SCHEME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium mb-1.5 text-[#c4c7c8] uppercase tracking-widest">Sector</label>
                                    <select
                                        value={filters.sector}
                                        onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                                        className="w-full rounded-md border border-white/10 bg-black text-white px-3 py-2 text-[14px] focus:outline-none focus:border-white/30"
                                    >
                                        <option value="ALL">ALL SECTORS</option>
                                        {ALL_SECTORS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        )}

                        {/* Tender Dossier Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {!loading && filteredProjects.map(project => {
                                const isReady = project.has_comparison || (project.dpr_count || 0) > 1;
                                const isAdded = !isReady && (project.dpr_count || 0) > 0;
                                const statusClass = isReady ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' : isAdded ? 'text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/20' : 'text-[#c4c7c8] bg-white/5 border-white/10';
                                const statusText = isReady ? 'Ready to Compare' : isAdded ? 'Documents Added' : 'Awaiting Docs';
                                const readiness = isReady ? '100%' : isAdded ? '66%' : '33%';

                                return (
                                    <article 
                                        key={project.id}
                                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                                        className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col gap-4 hover:bg-white/[0.08] hover:border-white/10 transition-all group cursor-pointer relative"
                                    >
                                        <button
                                            onClick={(e) => handleDeleteClick(e, project.id)}
                                            className="absolute top-4 right-4 z-10 p-1.5 rounded bg-black/40 border border-white/10 text-[#c4c7c8] hover:text-[#ffb4ab] hover:border-[#ffb4ab]/30 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete Tender"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>

                                        <div className="flex items-start justify-between pr-8">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
                                            </div>
                                            <span className={`text-[12px] font-medium px-2.5 py-1 rounded-sm border ${statusClass}`}>{statusText}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-[20px] font-semibold tracking-[0.025em] text-white mb-1 line-clamp-1">{project.name}</h3>
                                            <p className="text-[14px] text-[#c4c7c8]">TEN-{(project.created_at || "").substring(0, 4)}-{project.id.toString().padStart(3, '0')}</p>
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 flex flex-col gap-2 mt-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-[#c4c7c8] text-[12px] font-medium uppercase tracking-widest">Sector</span>
                                                <span className="text-white text-[12px] max-w-[150px] truncate" title={project.sector}>{project.sector}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-[#c4c7c8] text-[12px] font-medium uppercase tracking-widest">State</span>
                                                <span className="text-white text-[12px]">{project.state}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 mt-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-[#c4c7c8] text-[12px]">Document Readiness</span>
                                                <span className="text-white text-[12px]">{readiness}</span>
                                            </div>
                                            <div className="flex gap-1 h-1.5 w-full">
                                                <div className={`h-full flex-1 rounded-l-full ${isReady ? 'bg-[#22C55E] shadow-[0_0_5px_rgba(34,197,94,0.3)]' : 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.2)]'}`}></div>
                                                <div className={`h-full flex-1 ${isReady ? 'bg-[#22C55E] shadow-[0_0_5px_rgba(34,197,94,0.3)]' : isAdded ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.2)]' : 'bg-white/10'}`}></div>
                                                <div className={`h-full flex-1 rounded-r-full ${isReady ? 'bg-[#22C55E] shadow-[0_0_5px_rgba(34,197,94,0.3)]' : 'bg-white/10'}`}></div>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
                                            <span className="text-xs text-[#c4c7c8]">{new Date(project.created_at).toLocaleDateString()}</span>
                                            <span className="text-xs text-white bg-white/10 px-2 py-1 rounded flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">description</span>
                                                {project.dpr_count || 0} Bids
                                            </span>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right: Workspace Insights Rail */}
                    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
                        <div className="rounded-xl border border-white/5 bg-[#1c1b1b] relative h-24 flex items-center px-5">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none"></div>
                            <span className="text-[12px] font-medium text-white uppercase tracking-widest flex items-center gap-2 relative z-10">
                                <span className="material-symbols-outlined text-[#4ae176] text-[18px]">bolt</span>
                                AI Engine Active
                            </span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col gap-5">
                            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                                <span className="material-symbols-outlined text-white">insights</span>
                                <h3 className="text-[20px] font-semibold tracking-[0.025em] text-white">Review Readiness</h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[14px] text-[#c4c7c8]">Ready for AI Review</span>
                                        <span className="font-medium text-white">{readyForComparison} Dossiers</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-white transition-all duration-500" style={{ width: `${readyPercentage}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[14px] text-[#c4c7c8]">Pending Documents</span>
                                        <span className="font-medium text-white">{totalProjects - readyForComparison} Dossiers</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#c4c7c8] transition-all duration-500" style={{ width: `${pendingPercentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                                <span className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest">Quick Actions</span>
                                <button className="flex items-center justify-between w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                                    <span className="text-[14px] text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#c4c7c8] group-hover:text-white transition-colors text-[18px]">cloud_upload</span>
                                        Bulk Upload Bids
                                    </span>
                                    <span className="material-symbols-outlined text-[#c4c7c8] text-[18px]">chevron_right</span>
                                </button>
                                <button className="flex items-center justify-between w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                                    <span className="text-[14px] text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#c4c7c8] group-hover:text-white transition-colors text-[18px]">magic_button</span>
                                        Start Batch Review
                                    </span>
                                    <span className="material-symbols-outlined text-[#c4c7c8] text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Modals */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-md p-6 bg-[#141313] border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{t('projects.addNewProject')}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#c4c7c8] hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-[14px] font-medium mb-1.5 text-[#c4c7c8]">{t('projects.projectName')} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border border-white/10 bg-black text-white focus:outline-none focus:border-white/30"
                                    placeholder={t('projects.projectNamePlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium mb-1.5 text-[#c4c7c8]">{t('projects.state')} <span className="text-red-500">*</span></label>
                                <select
                                    value={newProject.state}
                                    onChange={(e) => setNewProject({ ...newProject, state: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border border-white/10 bg-black text-white focus:outline-none focus:border-white/30"
                                >
                                    {STATE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium mb-1.5 text-[#c4c7c8]">{t('projects.scheme')} <span className="text-red-500">*</span></label>
                                <select
                                    value={newProject.scheme}
                                    onChange={(e) => setNewProject({ ...newProject, scheme: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border border-white/10 bg-black text-white focus:outline-none focus:border-white/30"
                                >
                                    {SCHEME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium mb-1.5 text-[#c4c7c8]">{t('projects.sector')} <span className="text-red-500">*</span></label>
                                <select
                                    value={newProject.sector}
                                    onChange={(e) => setNewProject({ ...newProject, sector: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border border-white/10 bg-black text-white focus:outline-none focus:border-white/30"
                                >
                                    {getValidSectors().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            {validationError && (
                                <div className="p-3 bg-[#93000a]/20 border border-[#93000a] rounded-md text-[#ffb4ab] text-[14px]">
                                    {validationError}
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button type="button" className="flex-1 px-4 py-2 border border-white/20 text-white rounded-md hover:bg-white/5 transition-colors" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-[#e2e2e2] transition-colors flex justify-center items-center" disabled={creating}>
                                    {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Create Tender'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {projectToDelete && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-md p-6 bg-[#141313] border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#ffb4ab]">{t('projects.deleteProject')}</h2>
                            <button onClick={() => setProjectToDelete(null)} className="text-[#c4c7c8] hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-[#c4c7c8] mb-6 text-[14px]">
                            Are you sure you want to delete this tender? This action cannot be undone and all associated bids will be unlinked.
                        </p>
                        <div className="flex gap-3">
                            <button type="button" className="flex-1 px-4 py-2 border border-white/20 text-white rounded-md hover:bg-white/5 transition-colors" onClick={() => setProjectToDelete(null)}>
                                Cancel
                            </button>
                            <button type="button" className="flex-1 px-4 py-2 bg-[#93000a] text-white font-medium rounded-md hover:bg-[#690005] transition-colors" onClick={confirmDelete}>
                                Delete Tender
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
