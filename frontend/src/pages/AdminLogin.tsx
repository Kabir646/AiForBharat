import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '@/contexts/RoleContext'
import { Shield, Globe, ShieldCheck, ShieldAlert, Activity, Lock, User, ArrowLeft, Info, AlertCircle } from 'lucide-react'
import { API_ENDPOINTS } from '../config/api'

export default function AdminLogin() {
    const [adminId, setAdminId] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useRole()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!adminId || !password) {
            setError('Please enter both Admin ID and Password')
            return
        }

        // Alphanumeric check for admin ID (allowing hyphens)
        const alphanumericRegex = /^[a-zA-Z0-9-]+$/
        if (!alphanumericRegex.test(adminId)) {
            setError('Admin ID must be alphanumeric (letters, numbers, and hyphens only)')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(API_ENDPOINTS.adminLogin(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    admin_id: adminId,
                    password: password,
                }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                // Login successful
                login()
                navigate('/admin')
            } else {
                setError(data.message || 'Invalid credentials')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Failed to connect to server. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-[#000000] text-[#e5e2e1] font-sans min-h-screen flex flex-col antialiased selection:bg-white/20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-sm border-b border-[rgba(255,255,255,0.05)]">
                <div className="max-w-[72rem] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="text-[#ffffff] w-6 h-6" fill="currentColor" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-[20px] text-[#ffffff] tracking-[0.025em]">Nexus AI</span>
                            <span className="text-[12px] text-[#c4c7c8] uppercase tracking-[0.05em] font-medium hidden sm:block">
                                Government Infrastructure Platform
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-[#c4c7c8] hover:text-[#ffffff] transition-colors text-sm font-medium">
                            <Globe className="w-[18px] h-[18px]" />
                            EN
                        </button>
                        <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.02)] px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.05)]">
                            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <span className="text-[12px] font-medium text-[#22C55E] uppercase tracking-[0.05em]">System: Operational</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-20 px-6">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left Column: Info Panel */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.20)] bg-[rgba(255,255,255,0.02)] text-[12px] font-medium text-[#ffffff] uppercase tracking-[0.05em] mb-6">
                                SECURE ADMIN ACCESS
                            </span>
                            <h2 className="text-[30px] font-semibold text-[#ffffff] mb-4 leading-[1.2] tracking-[-0.025em]">
                                Review infrastructure submissions with confidence.
                            </h2>
                            <p className="text-[14px] leading-[1.625] text-[#c4c7c8] max-w-md">
                                Access the administrative workspace to manage DPR submissions, oversee platform telemetry, and control access protocols across the government infrastructure network.
                            </p>
                        </div>
                        <ul className="flex flex-col gap-4">
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="text-[#4ae176] mt-0.5 w-6 h-6" />
                                <div>
                                    <span className="block text-[#ffffff] font-medium text-sm">Secure Authentication</span>
                                    <span className="block text-[#c4c7c8] text-sm mt-0.5">Multi-layered verification protocols active.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldAlert className="text-[#4ae176] mt-0.5 w-6 h-6" />
                                <div>
                                    <span className="block text-[#ffffff] font-medium text-sm">Role-based Dashboard Access</span>
                                    <span className="block text-[#c4c7c8] text-sm mt-0.5">Granular permissions enforced via GovID.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Activity className="text-[#4ae176] mt-0.5 w-6 h-6" />
                                <div>
                                    <span className="block text-[#ffffff] font-medium text-sm">Submission Workflow Monitoring</span>
                                    <span className="block text-[#c4c7c8] text-sm mt-0.5">Real-time oversight of all infrastructure requests.</span>
                                </div>
                            </li>
                        </ul>
                        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-5 flex items-center justify-between mt-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-[#c4c7c8] uppercase tracking-wider font-medium">Network Status</span>
                                <span className="text-sm text-[#ffffff] font-medium flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                                    Operational • Last sync: Just now
                                </span>
                            </div>
                            <span className="px-2 py-1 bg-[#2a2a2a] rounded text-xs text-[#c4c7c8] font-medium border border-[rgba(255,255,255,0.05)] uppercase tracking-wider">
                                Admin Only
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Login Card */}
                    <div className="relative w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
                        {/* Subtle background glow */}
                        <div className="absolute inset-0 bg-[#ffffff]/5 blur-[100px] rounded-full pointer-events-none"></div>
                        <div className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[1.5rem] p-8 md:p-10 backdrop-blur-md shadow-2xl">
                            <div className="w-12 h-12 bg-[#1c1b1b] border border-[rgba(255,255,255,0.05)] rounded-lg flex items-center justify-center mb-6">
                                <Lock className="text-[#ffffff] w-6 h-6" />
                            </div>
                            <h3 className="text-[20px] font-semibold text-[#ffffff] mb-2 tracking-[0.025em]">Admin Login</h3>
                            <p className="text-[14px] leading-[1.625] text-[#c4c7c8] mb-8">Enter your credentials to access the secure workspace.</p>
                            
                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-[#93000a] border border-[#ffb4ab] rounded-lg flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-[#ffdad6] flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-[#ffdad6]">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5" autoComplete="off">
                                {/* Admin ID Field */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#c4c7c8]" htmlFor="admin-id">Admin ID</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="text-[#c4c7c8] w-5 h-5" />
                                        </div>
                                        <input 
                                            className="block w-full pl-10 pr-3 py-2.5 bg-[#111111] border border-[rgba(255,255,255,0.10)] rounded-lg text-[#ffffff] placeholder-[#636565] focus:outline-none focus:ring-1 focus:ring-[#ffffff] focus:border-[#ffffff] sm:text-sm transition-colors" 
                                            id="admin-id" 
                                            name="admin-id" 
                                            placeholder="e.g. OP-8821" 
                                            type="text"
                                            value={adminId}
                                            onChange={(e) => setAdminId(e.target.value)}
                                            disabled={isLoading}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                {/* Password Field */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#c4c7c8]" htmlFor="password">Access Token</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="text-[#c4c7c8] w-5 h-5" />
                                        </div>
                                        <input 
                                            className="block w-full pl-10 pr-3 py-2.5 bg-[#111111] border border-[rgba(255,255,255,0.10)] rounded-lg text-[#ffffff] placeholder-[#636565] focus:outline-none focus:ring-1 focus:ring-[#ffffff] focus:border-[#ffffff] sm:text-sm transition-colors" 
                                            id="password" 
                                            name="password" 
                                            placeholder="••••••••••••" 
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button 
                                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-[#111111] bg-[#ffffff] hover:bg-[#c6c6c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffffff] focus:ring-offset-[#000000] transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed" 
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-[#111111]" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Authenticating...
                                            </>
                                        ) : (
                                            'Continue to Dashboard'
                                        )}
                                    </button>
                                </div>
                            </form>
                            <div className="mt-6 text-center">
                                <button 
                                    onClick={() => navigate('/role-selection')}
                                    className="text-sm text-[#c4c7c8] hover:text-[#ffffff] transition-colors inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to role selection
                                </button>
                            </div>
                            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center">
                                <p className="text-xs text-[#636565] flex items-center justify-center gap-1">
                                    <Info className="w-3.5 h-3.5" />
                                    Unauthorized access is strictly prohibited and monitored.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[rgba(255,255,255,0.05)] py-6 mt-auto">
                <div className="max-w-[72rem] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[12px] text-[#636565]">
                        © 2025 Nexus AI — Government Infrastructure Platform.
                    </p>
                    <div className="flex items-center gap-6 text-[12px] text-[#636565]">
                        <a className="hover:text-[#ffffff] transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-[#ffffff] transition-colors" href="#">Terms of Service</a>
                        <a className="hover:text-[#ffffff] transition-colors" href="#">Security Protocols</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
