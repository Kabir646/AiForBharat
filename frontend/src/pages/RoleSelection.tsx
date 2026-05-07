import React from 'react'
import { Shield, User, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '@/contexts/RoleContext'

export default function RoleSelectionPage({ onRoleSelect }: { onRoleSelect?: (role: 'admin' | 'user') => void }) {
    const navigate = useNavigate()
    const { setRole, logout, logoutUser } = useRole()

    const handleRoleSelect = (newRole: 'admin' | 'user') => {
        logout()
        logoutUser()
        setRole(newRole)
        
        if (onRoleSelect) {
            onRoleSelect(newRole)
            return
        }

        if (newRole === 'admin') {
            navigate('/admin/login')
        } else {
            navigate('/user/auth')
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-white/20">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 border-b border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                        <div className="w-3 h-3 bg-black rounded-full" />
                    </div>
                    <span className="text-xl font-semibold tracking-wide ml-2">NEXUS AI</span>
                    <span className="text-white/20 mx-2">|</span>
                    <span className="text-white/60">DPR Analyzer</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                        <span className="text-green-500 text-xs font-medium tracking-wide">System: Operational</span>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        className="px-6 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors text-sm font-medium"
                    >
                        Back
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="max-w-3xl w-full flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Built for CRPF</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Welcome to NEXUS AI
                    </h1>
                    
                    <p className="text-lg text-white/50 mb-12 text-center max-w-xl leading-relaxed">
                        Select your role to access the platform and start analyzing Detailed Project Reports
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
                        {/* Admin Card */}
                        <button 
                            onClick={() => handleRoleSelect('admin')}
                            className="group flex flex-col text-left p-8 rounded-xl border border-white/10 bg-[#0A0A0A] hover:bg-white/[0.02] hover:border-white/20 transition-all duration-300"
                        >
                            <Shield className="w-8 h-8 mb-6 text-white/60 group-hover:text-white transition-colors" strokeWidth={1.5} />
                            <h2 className="text-2xl font-semibold mb-3">Admin</h2>
                            <p className="text-white/40 text-sm leading-relaxed mb-8 flex-1">
                                Full access to upload, analyze, and manage project documents with AI-powered insights
                            </p>
                            <div className="flex items-center text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                                Access Dashboard <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </button>

                        {/* Client Card */}
                        <button 
                            onClick={() => handleRoleSelect('user')}
                            className="group flex flex-col text-left p-8 rounded-xl border border-white/10 bg-[#0A0A0A] hover:bg-white/[0.02] hover:border-white/20 transition-all duration-300"
                        >
                            <User className="w-8 h-8 mb-6 text-white/60 group-hover:text-white transition-colors" strokeWidth={1.5} />
                            <h2 className="text-2xl font-semibold mb-3">Client</h2>
                            <p className="text-white/40 text-sm leading-relaxed mb-8 flex-1">
                                Upload and manage your projects, track progress, and access analyzed reports
                            </p>
                            <div className="flex items-center text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                                Access Dashboard <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-white/10 bg-[#0A0A0A] flex flex-col items-center gap-8 text-sm text-white/40 mt-auto">
                <div className="flex items-center gap-8">
                    <button className="flex items-center gap-1 hover:text-white/70 transition-colors">
                        Platform <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1 hover:text-white/70 transition-colors">
                        Security <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1 hover:text-white/70 transition-colors">
                        Company <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-xs">
                    Copyright © NEXUS AI. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
