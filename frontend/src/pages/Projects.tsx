import { Header } from '@/components/Header'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
    Search,
    Filter,
    ChevronDown,
    Folder,
    Plus,
    Calendar,
    Loader2,
    MapPin,
    Briefcase,
    Layers,
    X,
    FileText,
    ClipboardList,
    ShieldCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type Project } from '@/lib/api'
import { useLanguage } from '@/contexts/LanguageContext'

// Dropdown Options - All Indian States/UTs and Pan-India Schemes
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
    'Force Modernisation Plan': [
        'Weapons & Ammunition', 'Vehicles & Mobility', 'Surveillance & Security Systems', 'Training Equipment & Simulators', 'Uniform & Clothing & Gear'
    ],
    'CAPF Infrastructure Development': [
        'Infrastructure & Construction', 'Barracks & Accommodation', 'Border Outposts', 'Road Connectivity', 'Helipads & Airstrips'
    ],
    'Smart Camp Initiative': [
        'IT & Communication Equipment', 'Surveillance Systems', 'Access Control', 'Smart Lighting', 'CCTV & Monitoring'
    ],
    'Make in India (Defence)': [
        'Weapons & Ammunition', 'Vehicles & Mobility', 'IT & Communication Equipment', 'Uniform & Clothing & Gear', 'Training Equipment & Simulators'
    ],
    'CAPF Welfare & Housing': [
        'Welfare & Sports Equipment', 'Medical & Healthcare Supplies', 'Canteen Stores', 'Recreation Facilities', 'Education & Schools'
    ],
    'Digital Police / e-Office': [
        'IT & Communication Equipment', 'Software & Licenses', 'Data Centers', 'e-Governance Systems', 'Networking'
    ],
    'Swachh Bharat (Barracks)': [
        'Sanitation Equipment', 'Water Supply', 'Solid Waste Management', 'Hygiene Supplies', 'Green Infrastructure'
    ]
}

// Combined list of all sectors for filtering
const ALL_SECTORS = Array.from(new Set(Object.values(SECTOR_OPTIONS).flat())).sort()

export default function ProjectsPage() {
    const navigate = useNavigate()
    const { t } = useLanguage()
    const [searchQuery, setSearchQuery] = useState('')
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filter State
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        state: 'ALL',
        scheme: 'ALL',
        sector: 'ALL'
    })

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newProject, setNewProject] = useState({
        name: '',
        state: STATE_OPTIONS[0],
        scheme: SCHEME_OPTIONS[0],
        sector: SECTOR_OPTIONS[SCHEME_OPTIONS[0]][0]
    })
    const [creating, setCreating] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    // Delete Modal State
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null)

    useEffect(() => {
        loadProjects()
    }, [])

    // Update sector when scheme changes (Forward Dependency)
    useEffect(() => {
        if (newProject.scheme) {
            const validSectors = SECTOR_OPTIONS[newProject.scheme] || []
            if (!validSectors.includes(newProject.sector)) {
                setNewProject(prev => ({ ...prev, sector: validSectors[0] }))
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newProject.scheme])

    // Update scheme when sector changes (Reverse Dependency)
    // We don't automatically change scheme, but we filter the options in the render

    const loadProjects = async () => {
        try {
            setLoading(true)
            const data = await api.getProjects()
            setProjects(data)
        } catch (err) {
            setError('Failed to load projects')
            console.error('Error loading projects:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!newProject.name.trim()) {
            setValidationError(t('projects.validationName'))
            return
        }
        if (!newProject.state) {
            setValidationError(t('projects.validationState'))
            return
        }
        if (!newProject.scheme) {
            setValidationError(t('projects.validationScheme'))
            return
        }
        if (!newProject.sector) {
            setValidationError(t('projects.validationSector'))
            return
        }

        try {
            setCreating(true)
            setValidationError(null)
            await api.createProject({
                name: newProject.name,
                state: newProject.state,
                scheme: newProject.scheme,
                sector: newProject.sector
            })
            setIsModalOpen(false)
            setNewProject({
                name: '',
                state: STATE_OPTIONS[1],
                scheme: SCHEME_OPTIONS[1],
                sector: SECTOR_OPTIONS[SCHEME_OPTIONS[1]][0]
            })
            setValidationError(null)
            loadProjects()
        } catch (err) {
            setValidationError(t('projects.creatingFailed'))
            console.error('Error creating project:', err)
        } finally {
            setCreating(false)
        }
    }

    const confirmDelete = async () => {
        if (!projectToDelete) return

        try {
            console.log('Calling deleteProject API for:', projectToDelete)
            await api.deleteProject(projectToDelete)
            console.log('Delete successful, updating state')
            setProjects(projects.filter(p => p.id !== projectToDelete))
            setProjectToDelete(null)
        } catch (err) {
            alert('Failed to delete project')
            console.error('Error deleting project:', err)
        }
    }

    const handleDeleteClick = (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation()
        setProjectToDelete(projectId)
    }



    // Get valid sectors based on selected scheme
    const getValidSectors = () => {
        return SECTOR_OPTIONS[newProject.scheme] || []
    }

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
    const activeFilterCount = [filters.state, filters.scheme, filters.sector].filter(value => value !== 'ALL').length

    const getReviewStatus = (project: Project) => {
        if (project.has_comparison) return { label: 'Comparison Ready', className: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-200 dark:border-green-800/70' }
        if ((project.dpr_count || 0) > 0) return { label: 'Documents Added', className: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-800/70' }
        return { label: 'Awaiting Bids', className: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800/60 dark:text-stone-200 dark:border-stone-700' }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.08),transparent_32rem)]">
                <div className="container mx-auto px-4 py-8">
                    <section className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm animate-slide-up">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Procurement Workspace
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t('projects.title')}</h1>
                                <p className="mt-2 max-w-2xl text-muted-foreground">
                                    {t('projects.subtitle')} Manage tender files, bid documents, and comparison readiness from one structured review console.
                                </p>
                            </div>
                            <Button size="lg" onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                {t('projects.addProject')}
                            </Button>
                        </div>
                    </section>

                    <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-slide-up animate-delay-100">
                        <Card className="border-l-4 border-l-primary p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total tenders</p>
                                    <p className="mt-2 text-3xl font-bold">{projects.length}</p>
                                </div>
                                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                    <ClipboardList className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                        <Card className="border-l-4 border-l-accent p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Bid documents</p>
                                    <p className="mt-2 text-3xl font-bold">{totalBidDocuments}</p>
                                </div>
                                <div className="rounded-lg bg-accent/10 p-3 text-accent">
                                    <FileText className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                        <Card className="border-l-4 border-l-indigo p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">With documents</p>
                                    <p className="mt-2 text-3xl font-bold">{projectsWithDocuments}</p>
                                </div>
                                <div className="rounded-lg bg-indigo/10 p-3 text-indigo">
                                    <Folder className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                        <Card className="border-l-4 border-l-green-700 p-5 shadow-sm dark:border-l-green-500">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Ready to compare</p>
                                    <p className="mt-2 text-3xl font-bold">{readyForComparison}</p>
                                </div>
                                <div className="rounded-lg bg-green-700/10 p-3 text-green-800 dark:text-green-300">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                    </section>

                    <section className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm animate-slide-up animate-delay-200">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder={t('projects.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <Button
                                    variant={showFilters ? "primary" : "outline"}
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="justify-center"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    {t('projects.filter')}
                                    {activeFilterCount > 0 && (
                                        <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">{activeFilterCount}</span>
                                    )}
                                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                </Button>
                            </div>

                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-border bg-muted/35 p-4 animate-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">{t('projects.state')}</label>
                                        <select
                                            value={filters.state}
                                            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        >
                                            <option value="ALL">ALL</option>
                                            {STATE_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">{t('projects.scheme')}</label>
                                        <select
                                            value={filters.scheme}
                                            onChange={(e) => setFilters({ ...filters, scheme: e.target.value })}
                                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        >
                                            <option value="ALL">ALL</option>
                                            {SCHEME_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">{t('projects.sector')}</label>
                                        <select
                                            value={filters.sector}
                                            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        >
                                            <option value="ALL">ALL</option>
                                            {ALL_SECTORS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-6 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {!loading && !error && filteredProjects.length === 0 && (
                        <Card className="p-12 text-center shadow-sm">
                            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{t('projects.noProjects')}</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || showFilters ? t('projects.tryAdjusting') : t('projects.noProjectsDesc')}
                            </p>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Tender
                            </Button>
                        </Card>
                    )}

                    {!loading && !error && filteredProjects.length > 0 && (
                        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                            <span>Showing {filteredProjects.length} of {projects.length} tenders</span>
                            <span className="hidden sm:inline">Sorted by recent activity</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredProjects.map((project, index) => {
                            const reviewStatus = getReviewStatus(project)
                            return (
                                <Card
                                    key={project.id}
                                    className="group relative overflow-hidden border-l-4 border-l-primary/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md cursor-pointer animate-slide-up"
                                    style={{ animationDelay: `${(index % 6) * 80}ms` }}
                                    onClick={() => navigate(`/admin/projects/${project.id}`)}
                                >
                                    <div className="absolute top-4 right-4 z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                                        <button
                                            onClick={(e) => handleDeleteClick(e, project.id)}
                                            className="rounded-md border border-border bg-card p-2 text-muted-foreground shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                            title={t('projects.deleteProject')}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mb-4 flex items-start gap-4 pr-10">
                                        <div className="rounded-lg border border-primary/15 bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/15">
                                            <Folder className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${reviewStatus.className}`}>
                                                    {reviewStatus.label}
                                                </span>
                                            </div>
                                            <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{project.name}</h3>
                                        </div>
                                    </div>

                                    <dl className="space-y-3 rounded-xl border border-border bg-muted/25 p-4 text-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <dt className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                State
                                            </dt>
                                            <dd className="text-right font-medium text-foreground">{project.state}</dd>
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <dt className="flex items-center gap-2 text-muted-foreground">
                                                <Layers className="h-4 w-4" />
                                                Scheme
                                            </dt>
                                            <dd className="text-right font-medium text-foreground">{project.scheme}</dd>
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <dt className="flex items-center gap-2 text-muted-foreground">
                                                <Briefcase className="h-4 w-4" />
                                                Sector
                                            </dt>
                                            <dd className="text-right font-medium text-foreground">{project.sector}</dd>
                                        </div>
                                    </dl>

                                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="rounded-md bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                                            {project.dpr_count || 0} Bid Documents
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </main>

            {/* Add Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{t('projects.addNewProject')}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('projects.projectName')} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder={t('projects.projectNamePlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('projects.state')} <span className="text-red-500">*</span></label>
                                <select
                                    value={newProject.state}
                                    onChange={(e) => setNewProject({ ...newProject, state: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {STATE_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('projects.scheme')} <span className="text-red-500">*</span></label>
                                <select
                                    value={newProject.scheme}
                                    onChange={(e) => setNewProject({ ...newProject, scheme: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {SCHEME_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('projects.sector')} <span className="text-red-500">*</span></label>
                                <select
                                    value={newProject.sector}
                                    onChange={(e) => setNewProject({ ...newProject, sector: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {getValidSectors().map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            {validationError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                                    {validationError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1" disabled={creating}>
                                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Create Tender
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {projectToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-red-600">{t('projects.deleteProject')}</h2>
                            <button onClick={() => setProjectToDelete(null)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this tender? This action cannot be undone and all associated bids will be unlinked.
                        </p>

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setProjectToDelete(null)}>
                                Cancel
                            </Button>
                            <Button type="button" className="flex-1 bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
                                Delete Tender
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
