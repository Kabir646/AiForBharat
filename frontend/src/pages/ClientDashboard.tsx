import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '@/contexts/RoleContext'
import { 
    Upload, FileText, Download, Clock, Trash2, MessageSquare, X, CheckCircle, 
    AlertCircle, LayoutDashboard, UploadCloud, FolderOpen, BookOpen, HelpCircle, 
    Settings, User as UserIcon, Bell, LogOut, Crosshair, ChevronRight, AlertTriangle
} from 'lucide-react'
import { LanguageDropdown } from '@/components/LanguageDropdown'
import { API_BASE_URL } from '@/config/api'
import { authenticatedFetch } from '@/lib/api'

interface ClientDPR {
    id: number
    client_id: number
    project_name: string
    dpr_filename: string
    original_filename: string
    status: string
    created_at: string
    admin_feedback?: string
    feedback_timestamp?: string
}

interface Project {
    id: number
    name: string
    state: string
    scheme: string
    sector: string
}

export default function ClientDashboard() {
    const navigate = useNavigate()
    const { userInfo, logoutUser } = useRole()
    const [dprs, setDprs] = useState<ClientDPR[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingProjects, setLoadingProjects] = useState(true)
    
    // Tab State
    const [activeTab, setActiveTab] = useState('Dashboard')

    // Form state
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    // Modal state
    const [selectedFeedback, setSelectedFeedback] = useState<ClientDPR | null>(null)

    useEffect(() => {
        if (!userInfo) {
            navigate('/user/auth')
            return
        }
        fetchDPRs()
        fetchProjects()
    }, [userInfo, navigate])

    const fetchProjects = async () => {
        try {
            setLoadingProjects(true)
            const response = await authenticatedFetch(`${API_BASE_URL}/projects`)
            if (!response.ok) throw new Error('Failed to fetch projects')
            const data = await response.json()
            setProjects(data.projects)
        } catch (err) {
            setError('Failed to load projects. Please try again.')
        } finally {
            setLoadingProjects(false)
        }
    }

    const fetchDPRs = async () => {
        if (!userInfo) return
        try {
            setLoading(true)
            const response = await authenticatedFetch(`${API_BASE_URL}/api/client/dprs?client_id=${userInfo.id}`)
            if (!response.ok) throw new Error('Failed to fetch DPRs')
            const data = await response.json()
            setDprs(data.dprs)
        } catch (err) {
            setError('Failed to load your DPRs. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                setError('Only PDF files are allowed.')
                return
            }
            setSelectedFile(file)
            setError(null)
        }
    }

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = () => { setIsDragging(false) }
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.name.toLowerCase().endsWith('.pdf')) {
            setSelectedFile(file)
            setError(null)
        } else {
            setError('Only PDF files are allowed.')
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userInfo) return setError('Authentication required.')
        if (!selectedProjectId) return setError('Project selection mandatory.')
        if (!selectedFile) return setError('PDF file attachment missing.')

        setUploading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const selectedProject = projects.find(p => p.id === selectedProjectId)
            if (!selectedProject) throw new Error('Selected project not found')

            const formData = new FormData()
            formData.append('client_id', userInfo.id.toString())
            formData.append('project_id', selectedProjectId.toString())
            formData.append('project_name', selectedProject.name)
            formData.append('file', selectedFile)

            const response = await authenticatedFetch(`${API_BASE_URL}/api/client/dprs/upload`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Upload sequence failed')
            }

            const result = await response.json()
            setSuccessMessage(result.message)
            setSelectedProjectId(null)
            setSelectedFile(null)

            const fileInput = document.getElementById('dpr-file') as HTMLInputElement
            if (fileInput) fileInput.value = ''

            await fetchDPRs()
            // Optionally auto-switch to Submissions tab
            // setTimeout(() => setActiveTab('My Submissions'), 1500)
        } catch (err: any) {
            setError(err.message || 'Transmission failure.')
        } finally {
            setUploading(false)
        }
    }

    const handleDownload = async (dpr: ClientDPR) => {
        if (!userInfo) return
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/client/dprs/${dpr.id}/download?client_id=${userInfo.id}`)
            if (!response.ok) throw new Error('Failed to retrieve file payload')
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = dpr.original_filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            console.error('Download error:', err)
        }
    }

    const handleDelete = async (dpr: ClientDPR) => {
        if (!userInfo) return
        if (!confirm(`Confirm deletion of artifact: ${dpr.original_filename}?`)) return

        try {
            const url = `${API_BASE_URL}/api/client/dprs/${dpr.id}?client_id=${userInfo.id}`
            const response = await authenticatedFetch(url, { method: 'DELETE' })
            if (!response.ok) throw new Error('Deletion failed')
            await fetchDPRs()
        } catch (err: any) {
            console.error(err)
        }
    }

    const handleLogout = () => {
        logoutUser()
        navigate('/')
    }

    // -- Sub-Components for Tabs -- //

    const renderDashboard = () => {
        const approvedCount = dprs.filter(d => d.status === 'accepted').length;
        const pendingCount = dprs.filter(d => d.status === 'pending').length;
        const rejectedCount = dprs.filter(d => d.status === 'rejected').length;
        const coverageRatio = projects.length > 0 ? Math.round((dprs.length / projects.length) * 100) : 0;

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">Client Activity Summary</h2>
                <p className="text-sm text-white/50">Overview of DPR statuses and recent system updates for internal operators.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-5 flex flex-col justify-between h-32 relative">
                    <span className="text-[10px] text-white/50 font-mono tracking-widest uppercase flex justify-between">
                        TOTAL DPRS UPLOADED <FileText className="w-3.5 h-3.5" />
                    </span>
                    <div>
                        <span className="text-3xl font-semibold">{dprs.length}</span>
                        <span className="text-xs text-white/40 ml-2">Total</span>
                    </div>
                </div>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-5 flex flex-col justify-between h-32 relative">
                    <span className="text-[10px] text-white/50 font-mono tracking-widest uppercase flex justify-between">
                        UNDER REVIEW <Clock className="w-3.5 h-3.5" />
                    </span>
                    <div>
                        <span className="text-3xl font-semibold">{dprs.filter(d => d.status === 'pending').length}</span>
                        <span className="inline-block ml-3 px-2 py-0.5 border border-white/10 rounded text-[10px] text-white/50">
                            <span className="text-[#10b981] mr-1">•</span>Pending
                        </span>
                    </div>
                </div>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-5 flex flex-col justify-between h-32 relative">
                    <span className="text-[10px] text-white/50 font-mono tracking-widest uppercase flex justify-between">
                        APPROVED <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                    <div>
                        <span className="text-3xl font-semibold">{dprs.filter(d => d.status === 'accepted').length}</span>
                        {dprs.length > 0 && <span className="text-xs text-[#10b981] ml-2">{Math.round((dprs.filter(d => d.status === 'accepted').length / dprs.length) * 100)}% completion</span>}
                    </div>
                </div>
                <div className="bg-[#0A0A0A] border border-[#ffb4ab]/30 rounded-lg p-5 flex flex-col justify-between h-32 relative border-l-2 border-l-[#ffb4ab]">
                    <span className="text-[10px] text-[#ffb4ab]/80 font-mono tracking-widest uppercase flex justify-between">
                        REQUIRING ACTION <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                    <div>
                        <span className="text-3xl font-semibold text-[#ffb4ab]">{dprs.filter(d => d.status === 'rejected').length}</span>
                        <span className="text-xs text-[#ffb4ab]/60 ml-2">Immediate review</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 pt-4">
                {/* Recent Activity List */}
                <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-lg">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Recent Activity</h3>
                        <button className="text-[10px] font-mono text-[#10b981] uppercase tracking-wider hover:text-[#4edea3]">View All</button>
                    </div>
                    <div className="divide-y divide-white/5">
                        {dprs.slice(0, 5).map(dpr => (
                            <div key={dpr.id} className="p-4 flex gap-4 hover:bg-white/[0.02]">
                                <div className="mt-1">
                                    {dpr.status === 'accepted' ? <CheckCircle className="w-4 h-4 text-[#10b981]" /> :
                                     dpr.status === 'rejected' ? <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" /> :
                                     <UploadCloud className="w-4 h-4 text-white/40" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-white/90">
                                            {dpr.project_name} {dpr.status === 'accepted' ? 'Approved' : dpr.status === 'rejected' ? 'Action Required' : 'Uploaded'}
                                        </p>
                                        <span className="text-xs text-white/40">{new Date(dpr.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-white/50 mt-1">
                                        {dpr.status === 'accepted' ? 'Final review completed by internal auditor.' : 
                                         dpr.status === 'rejected' ? 'Automated scan detected issues or missing signatures.' : 
                                         'Document package uploaded by external client. Awaiting initial processing.'}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {dprs.length === 0 && (
                            <div className="p-8 text-center text-sm text-white/40">No recent activity detected.</div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Visual */}
                <div className="space-y-6">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
                        <h3 className="text-[10px] font-mono tracking-widest uppercase text-white/50 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button onClick={() => setActiveTab('Upload DPR')} className="w-full py-2.5 bg-[#10b981] hover:bg-[#4edea3] text-[#002113] rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                                + New Submission
                            </button>
                            <button className="w-full py-2.5 bg-transparent border border-white/10 hover:bg-white/5 rounded text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Export Report
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-5 flex flex-col justify-between">
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Infrastructure Coverage</h4>
                            <p className="text-xs text-white/50 mb-6">Percentage of active projects with submitted DPRs.</p>
                            
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-3xl font-semibold">{coverageRatio}%</span>
                                <span className="text-xs text-white/40 font-mono uppercase tracking-wider mb-1">{dprs.length} OF {projects.length} PROJECTS</span>
                            </div>
                            
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#10b981] transition-all duration-1000 ease-out" 
                                    style={{ width: `${coverageRatio}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-5 flex flex-col justify-between">
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Pipeline Health</h4>
                            <p className="text-xs text-white/50 mb-6">Review distribution of uploaded packages.</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-[#10b981] font-mono tracking-widest uppercase">Approved</span>
                                        <span className="text-white/70">{approvedCount}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#10b981] transition-all duration-1000 ease-out" style={{ width: `${dprs.length > 0 ? (approvedCount/dprs.length)*100 : 0}%` }}></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-[#eab308] font-mono tracking-widest uppercase">Pending</span>
                                        <span className="text-white/70">{pendingCount}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#eab308] transition-all duration-1000 ease-out" style={{ width: `${dprs.length > 0 ? (pendingCount/dprs.length)*100 : 0}%` }}></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-[#ffb4ab] font-mono tracking-widest uppercase">Action Required</span>
                                        <span className="text-white/70">{rejectedCount}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#ffb4ab] transition-all duration-1000 ease-out" style={{ width: `${dprs.length > 0 ? (rejectedCount/dprs.length)*100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    }

    const renderUpload = () => (
        <div className="max-w-3xl animate-in fade-in duration-300">
            <h2 className="text-2xl font-semibold mb-6">Upload Document Package</h2>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-6">
                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-[11px] font-mono tracking-widest text-white/50 uppercase mb-3">
                            Target Infrastructure Project
                        </label>
                        {loadingProjects ? (
                            <div className="w-full px-4 py-3 border border-white/10 rounded bg-[#131313] text-[13px] text-white/50">Loading infrastructure data...</div>
                        ) : projects.length === 0 ? (
                            <div className="w-full px-4 py-3 border border-[#ffb4ab]/20 bg-[#ffb4ab]/5 rounded text-[13px] text-[#ffb4ab]">ERR: No infrastructure targets available.</div>
                        ) : (
                            <select
                                value={selectedProjectId || ''}
                                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                                className="w-full px-4 py-3 border border-white/10 rounded bg-[#131313] text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#10b981] transition-colors appearance-none"
                                required
                                disabled={uploading}
                            >
                                <option value="">-- SELECT TARGET --</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name} ({project.state} - {project.scheme})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono tracking-widest text-white/50 uppercase mb-3">
                            Payload (PDF Data)
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border border-dashed rounded-lg p-12 text-center transition-all bg-[#131313] ${isDragging
                                ? 'border-[#10b981] bg-[#10b981]/5'
                                : 'border-white/20 hover:border-white/40'
                                }`}
                        >
                            <input
                                id="dpr-file"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer text-transparent file:hidden outline-none"
                                disabled={uploading}
                            />
                            <div className="pointer-events-none flex flex-col items-center">
                                {selectedFile ? (
                                    <>
                                        <FileText className="h-8 w-8 text-[#10b981] mb-3" />
                                        <p className="text-[14px] font-medium text-[#e5e2e1]">{selectedFile.name}</p>
                                        <p className="text-[12px] text-white/40 font-mono mt-1">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="h-8 w-8 text-white/30 mb-3" />
                                        <p className="text-[13px] font-medium mb-1 text-white/80">Drop payload here or click to browse</p>
                                        <p className="text-[11px] text-white/40 font-mono mt-2">MAX SIZE: 50MB • PDF ONLY</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-[#93000a]/20 border border-[#93000a] rounded text-[#ffb4ab] text-[13px] flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded text-[#4edea3] text-[13px] flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <button type="button" onClick={() => setActiveTab('Dashboard')} className="px-6 py-2.5 rounded bg-transparent border border-white/10 hover:bg-white/5 text-[13px] font-semibold transition-colors">
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-8 py-2.5 rounded bg-[#10b981] text-[#002113] font-bold text-[13px] tracking-wide uppercase hover:bg-[#4edea3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {uploading ? (
                                <><div className="w-4 h-4 border-2 border-[#002113] border-t-transparent rounded-full animate-spin mr-2"></div> TRANSMITTING...</>
                            ) : 'INITIATE UPLOAD'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )

    const renderSubmissions = () => (
        <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-semibold mb-6">Transmission Log</h2>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg flex flex-col">
                <div className="p-0 overflow-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-white/40">
                            <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="text-xs font-mono tracking-widest uppercase">Fetching Records...</span>
                        </div>
                    ) : dprs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-white/30">
                            <FolderOpen className="h-8 w-8 mb-3 opacity-50" />
                            <p className="text-[13px] font-medium">No transmission logs found.</p>
                            <button onClick={() => setActiveTab('Upload DPR')} className="mt-4 text-[#10b981] text-sm hover:underline">Upload a document</button>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-[#131313]">
                                    <th className="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-white/40 font-semibold">Project Entity</th>
                                    <th className="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-white/40 font-semibold">Artifact Identifier</th>
                                    <th className="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-white/40 font-semibold">Status Code</th>
                                    <th className="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-white/40 font-semibold">Timestamp (UTC)</th>
                                    <th className="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-white/40 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px]">
                                {dprs.map((dpr) => (
                                    <tr key={dpr.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                        <td className="py-4 px-6 font-medium">{dpr.project_name}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-white/30" />
                                                <span className="text-white/80">{dpr.original_filename}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-mono tracking-widest uppercase ${
                                                dpr.status === 'accepted' ? 'bg-[#10b981]/10 border border-[#10b981]/20 text-[#4edea3]' :
                                                dpr.status === 'rejected' ? 'bg-[#93000a]/20 border border-[#93000a]/30 text-[#ffb4ab]' :
                                                'bg-white/5 border border-white/10 text-white/70'
                                            }`}>
                                                {dpr.status === 'accepted' && <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></div>}
                                                {dpr.status === 'rejected' && <div className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></div>}
                                                {dpr.status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>}
                                                {dpr.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-white/50 font-mono text-[11px]">
                                            {new Date(dpr.created_at).toISOString().split('T')[0]} <span className="ml-1 opacity-50">{new Date(dpr.created_at).toISOString().split('T')[1].substring(0,5)}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleDownload(dpr)} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors" title="Download Artifact"><Download className="h-4 w-4" /></button>
                                                {dpr.admin_feedback && (
                                                    <button onClick={() => setSelectedFeedback(dpr)} className="p-1.5 text-[#6366F1] hover:text-white hover:bg-[#6366F1]/20 rounded transition-colors" title="View Feedback"><MessageSquare className="h-4 w-4" /></button>
                                                )}
                                                <button onClick={() => handleDelete(dpr)} className="p-1.5 text-[#ffb4ab]/70 hover:text-[#ffb4ab] hover:bg-[#93000a]/20 rounded transition-colors" title="Delete Record"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )

    const renderPlaceholder = (title: string, desc: string) => (
        <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-semibold mb-6">{title}</h2>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <BookOpen className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-lg font-medium mb-2">{desc}</h3>
                <p className="text-sm text-white/40 max-w-md mx-auto">This module is currently offline or restricted by current operator clearance levels.</p>
            </div>
        </div>
    )

    const SIDEBAR_TOP = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Upload DPR', icon: UploadCloud },
        { name: 'My Submissions', icon: FolderOpen },
        { name: 'Guidelines', icon: BookOpen },
        { name: 'Support', icon: HelpCircle },
    ]

    const SIDEBAR_BOTTOM = [
        { name: 'Settings', icon: Settings },
        { name: 'Profile', icon: UserIcon },
    ]

    return (
        <div className="min-h-screen bg-[#000000] text-[#e5e2e1] font-sans selection:bg-[#10b981]/30 flex">
            
            {/* Sidebar */}
            <aside className="w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col fixed inset-y-0 z-40">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-wide leading-tight">NexusAI</span>
                        <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Enterprise DPR Portal</span>
                    </div>
                </div>
                
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {SIDEBAR_TOP.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === item.name 
                                ? 'bg-white/10 text-white shadow-[inset_2px_0_0_0_#10b981]' 
                                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                            }`}
                        >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-white/10 space-y-1">
                    {SIDEBAR_BOTTOM.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === item.name 
                                ? 'bg-white/10 text-white shadow-[inset_2px_0_0_0_#10b981]' 
                                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                            }`}
                        >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {item.name}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Layout */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-30 px-8 flex justify-between items-center">
                    <h1 className="text-lg font-semibold tracking-wide">{activeTab}</h1>
                    <div className="flex items-center gap-5 text-white/60">
                        <LanguageDropdown />
                        <button className="hover:text-white transition-colors"><Bell className="w-5 h-5" /></button>
                        <button className="hover:text-white transition-colors"><HelpCircle className="w-5 h-5" /></button>
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        <button onClick={handleLogout} className="hover:text-white transition-colors flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded bg-white/10 border border-white/20 flex items-center justify-center text-[10px] text-white">
                                {userInfo?.name?.substring(0,2).toUpperCase() || 'OP'}
                            </div>
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-8">
                    {activeTab === 'Dashboard' && renderDashboard()}
                    {activeTab === 'Upload DPR' && renderUpload()}
                    {activeTab === 'My Submissions' && renderSubmissions()}
                    {activeTab === 'Guidelines' && renderPlaceholder('Operational Guidelines', 'Standard Operating Procedures')}
                    {activeTab === 'Support' && renderPlaceholder('Technical Support', 'Secure Communication Channel')}
                    {activeTab === 'Settings' && renderPlaceholder('System Settings', 'Operator Preferences')}
                    {activeTab === 'Profile' && renderPlaceholder('Operator Profile', 'Clearance & Identity')}
                </main>
            </div>

            {/* Feedback Modal */}
            {selectedFeedback && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg w-full max-w-xl shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#131313] rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-[#6366F1]" />
                                <h2 className="text-sm font-semibold tracking-wide uppercase">Command Feedback</h2>
                            </div>
                            <button onClick={() => setSelectedFeedback(null)} className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-4">
                                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Target Artifact</span>
                                <p className="text-[13px] font-medium mt-1">{selectedFeedback.original_filename}</p>
                            </div>
                            <div className="bg-[#131313] border border-white/5 rounded p-4 mb-4">
                                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-3">Intelligence Report</span>
                                <p className="text-[13px] leading-relaxed text-white/80 whitespace-pre-wrap font-mono">
                                    {selectedFeedback.admin_feedback}
                                </p>
                            </div>
                            {selectedFeedback.feedback_timestamp && (
                                <p className="text-[10px] font-mono text-white/40 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    LOGGED: {new Date(selectedFeedback.feedback_timestamp).toISOString().replace('T', ' ').substring(0, 19)}Z
                                </p>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-white/10 bg-[#131313] rounded-b-lg flex justify-end">
                            <button onClick={() => setSelectedFeedback(null)} className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[12px] font-semibold tracking-wide uppercase transition-colors">
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
