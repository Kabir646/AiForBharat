import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '@/contexts/RoleContext'
import { Shield, Globe, Lock, RefreshCcw, Network, Mail, ArrowLeft, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { API_ENDPOINTS } from '@/config/api'

export default function UserAuth() {
    const [mode, setMode] = useState<'signup' | 'signin'>('signin')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { loginUser } = useRole()
    const navigate = useNavigate()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(API_ENDPOINTS.userRegister(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    confirm_password: confirmPassword,
                }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setSuccess('Registration successful! You can now sign in.')
                // Clear form
                setName('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
                // Switch to sign in mode after 2 seconds
                setTimeout(() => {
                    setMode('signin')
                    setSuccess('')
                }, 2000)
            } else {
                setError(data.detail || data.message || 'Registration failed')
            }
        } catch (err) {
            console.error('Registration error:', err)
            setError('Failed to connect to server. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!email || !password) {
            setError('Please enter your email and password')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(API_ENDPOINTS.userLogin(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                loginUser(data.user)
                navigate('/user/dashboard')
            } else {
                setError(data.detail || data.message || 'Invalid credentials')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Failed to connect to server. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#000000] text-[#e5e2e1] font-sans flex flex-col relative overflow-hidden selection:bg-white/20">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 pointer-events-none flex justify-center items-center overflow-hidden">
                <div className="absolute w-[800px] h-[800px] bg-[#ffffff] rounded-full blur-[120px] opacity-[0.03] translate-x-1/4"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-[#000000]/80 backdrop-blur-sm border-b border-[rgba(255,255,255,0.05)] h-16 flex justify-between items-center px-6">
                <div className="flex items-center gap-4">
                    <Shield className="text-[#ffffff] w-6 h-6" fill="currentColor" />
                    <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-[20px] tracking-tight text-[#ffffff]">Nexus AI</span>
                        <span className="text-[14px] text-[#c4c7c8] opacity-60 hidden sm:block">DPR Analyzer</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#ffffff] transition-colors text-[#c4c7c8] text-sm">
                        <Globe className="w-[18px] h-[18px]" />
                        <span>EN</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-full px-3 py-1 text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest hidden sm:flex">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                        System Operational
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-12 relative z-10">
                <div className="max-w-[1152px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Panel (Value Prop) */}
                    <div className="hidden lg:flex flex-col gap-8">
                        <div className="inline-flex items-center self-start px-3 py-1 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-full text-[12px] font-medium text-[#ffffff] uppercase tracking-widest">
                            CLIENT PORTAL
                        </div>
                        <div>
                            <h1 className="text-[60px] font-bold text-[#ffffff] mb-4 leading-[1.1] tracking-[-0.025em]">Submit and track DPRs securely</h1>
                            <p className="text-[18px] leading-[1.625] text-[#c4c7c8] max-w-md">
                                Upload project DPR documents, monitor review status, and manage resubmissions through a secure workflow.
                            </p>
                        </div>
                        <div className="flex flex-col gap-6 mt-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                                    <Lock className="text-[#ffffff] w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-semibold text-[#ffffff]">Secure document submission</h3>
                                    <p className="text-[14px] leading-[1.625] text-[#c4c7c8] mt-1">End-to-end encrypted upload channels for sensitive data.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                                    <RefreshCcw className="text-[#ffffff] w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-semibold text-[#ffffff]">Real-time submission status</h3>
                                    <p className="text-[14px] leading-[1.625] text-[#c4c7c8] mt-1">Live tracking of automated analysis and manual review phases.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                                    <Network className="text-[#ffffff] w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-semibold text-[#ffffff]">Guided resubmission workflow</h3>
                                    <p className="text-[14px] leading-[1.625] text-[#c4c7c8] mt-1">Clear actionable feedback for formatting or content errors.</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl flex flex-col gap-3">
                            <div className="flex justify-between items-center text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest border-b border-[rgba(255,255,255,0.05)] pb-3">
                                <span>Portal Status</span>
                                <span className="text-[#22C55E] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Operational
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest">
                                <span>Access Type</span>
                                <span className="text-[#ffffff]">Client Workspace</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel (Auth Card) */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="w-full max-w-[440px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-8 backdrop-blur-sm shadow-2xl relative">
                            <div className="w-12 h-12 bg-[#201f1f] border border-[rgba(255,255,255,0.05)] rounded-xl flex items-center justify-center mb-8">
                                <Shield className="text-[#ffffff] w-6 h-6" fill="currentColor" />
                            </div>
                            <div className="mb-8">
                                <h2 className="text-[30px] font-semibold text-[#ffffff] mb-2 leading-[1.2] tracking-[-0.025em]">
                                    {mode === 'signin' ? 'Welcome back' : 'Create account'}
                                </h2>
                                <p className="text-[14px] leading-[1.625] text-[#c4c7c8]">
                                    {mode === 'signin' ? 'Continue to your client workspace' : 'Join the government infrastructure network'}
                                </p>
                            </div>

                            {/* Segmented Control */}
                            <div className="flex p-1 bg-[#0e0e0e] border border-[rgba(255,255,255,0.05)] rounded-lg mb-8">
                                <button
                                    onClick={() => {
                                        setMode('signin')
                                        setError('')
                                        setSuccess('')
                                    }}
                                    className={`flex-1 py-2 text-center rounded-md font-medium text-sm transition-all shadow-sm ${mode === 'signin' ? 'bg-[#ffffff] text-[#000000]' : 'text-[#c4c7c8] hover:text-[#ffffff]'}`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        setMode('signup')
                                        setError('')
                                        setSuccess('')
                                    }}
                                    className={`flex-1 py-2 text-center rounded-md font-medium text-sm transition-all ${mode === 'signup' ? 'bg-[#ffffff] text-[#000000]' : 'text-[#c4c7c8] hover:text-[#ffffff]'}`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            {/* Success Message */}
                            {success && (
                                <div className="mb-6 p-4 bg-[#004119] border border-[#00b954] rounded-lg flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-[#6bff8f] flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-[#6bff8f]">{success}</p>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-[#93000a] border border-[#ffb4ab] rounded-lg flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-[#ffdad6] flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-[#ffdad6]">{error}</p>
                                </div>
                            )}

                            {mode === 'signup' ? (
                                <form onSubmit={handleSignUp} className="flex flex-col gap-5" autoComplete="off">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest ml-1" htmlFor="signup-name">Full Name</label>
                                        <div className="relative">
                                            <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c7c8]" />
                                            <input 
                                                className="w-full bg-[#000000] border border-[rgba(255,255,255,0.05)] rounded-lg py-3 pl-10 pr-4 text-[#ffffff] text-[14px] focus:outline-none focus:border-[rgba(255,255,255,0.20)] focus:ring-1 focus:ring-[rgba(255,255,255,0.20)] transition-colors placeholder:text-[#c4c7c8]/50" 
                                                id="signup-name" 
                                                placeholder="John Doe" 
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={isLoading}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest ml-1" htmlFor="signup-email">Email</label>
                                        <div className="relative">
                                            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c7c8]" />
                                            <input 
                                                className="w-full bg-[#000000] border border-[rgba(255,255,255,0.05)] rounded-lg py-3 pl-10 pr-4 text-[#ffffff] text-[14px] focus:outline-none focus:border-[rgba(255,255,255,0.20)] focus:ring-1 focus:ring-[rgba(255,255,255,0.20)] transition-colors placeholder:text-[#c4c7c8]/50" 
                                                id="signup-email" 
                                                placeholder="name@company.com" 
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                                autoComplete="nope"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest ml-1" htmlFor="signup-password">Password</label>
                                        <div className="relative">
                                            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c7c8]" />
                                            <input 
                                                className="w-full bg-[#000000] border border-[rgba(255,255,255,0.05)] rounded-lg py-3 pl-10 pr-4 text-[#ffffff] text-[14px] focus:outline-none focus:border-[rgba(255,255,255,0.20)] focus:ring-1 focus:ring-[rgba(255,255,255,0.20)] transition-colors placeholder:text-[#c4c7c8]/50" 
                                                id="signup-password" 
                                                placeholder="Min 8 characters" 
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest ml-1" htmlFor="signup-confirm-password">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c7c8]" />
                                            <input 
                                                className="w-full bg-[#000000] border border-[rgba(255,255,255,0.05)] rounded-lg py-3 pl-10 pr-4 text-[#ffffff] text-[14px] focus:outline-none focus:border-[rgba(255,255,255,0.20)] focus:ring-1 focus:ring-[rgba(255,255,255,0.20)] transition-colors placeholder:text-[#c4c7c8]/50" 
                                                id="signup-confirm-password" 
                                                placeholder="Re-enter password" 
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={isLoading}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isLoading}
                                        className="mt-2 flex justify-center items-center gap-2 w-full bg-[#ffffff] text-[#000000] text-[14px] font-medium py-3 rounded-full hover:bg-[#e2e2e2] transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-[#000000]" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Creating account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleSignIn} className="flex flex-col gap-5" autoComplete="off">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest ml-1" htmlFor="email">Email</label>
                                        <div className="relative">
                                            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c7c8]" />
                                            <input 
                                                className="w-full bg-[#000000] border border-[rgba(255,255,255,0.05)] rounded-lg py-3 pl-10 pr-4 text-[#ffffff] text-[14px] focus:outline-none focus:border-[rgba(255,255,255,0.20)] focus:ring-1 focus:ring-[rgba(255,255,255,0.20)] transition-colors placeholder:text-[#c4c7c8]/50" 
                                                id="email" 
                                                placeholder="name@company.com" 
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                                autoComplete="nope"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest ml-1" htmlFor="password">Password</label>
                                        <div className="relative">
                                            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c7c8]" />
                                            <input 
                                                className="w-full bg-[#000000] border border-[rgba(255,255,255,0.05)] rounded-lg py-3 pl-10 pr-4 text-[#ffffff] text-[14px] focus:outline-none focus:border-[rgba(255,255,255,0.20)] focus:ring-1 focus:ring-[rgba(255,255,255,0.20)] transition-colors placeholder:text-[#c4c7c8]/50" 
                                                id="password" 
                                                placeholder="••••••••" 
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isLoading}
                                        className="mt-2 flex justify-center items-center gap-2 w-full bg-[#ffffff] text-[#000000] text-[14px] font-medium py-3 rounded-full hover:bg-[#e2e2e2] transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-[#000000]" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Signing in...
                                            </>
                                        ) : (
                                            'Continue'
                                        )}
                                    </button>
                                </form>
                            )}

                            <div className="mt-6 text-center">
                                <button 
                                    onClick={() => navigate('/role-selection')}
                                    className="text-[14px] text-[#c4c7c8] opacity-60 hover:opacity-100 hover:text-[#ffffff] transition-colors flex items-center justify-center gap-2 mx-auto"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Role Selection
                                </button>
                            </div>
                            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center">
                                <p className="text-[11px] text-[#c4c7c8] opacity-50 leading-relaxed">
                                    Authorized client users only. Document activity may be logged for audit purposes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
