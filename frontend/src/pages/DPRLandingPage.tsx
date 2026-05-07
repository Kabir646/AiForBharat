import React from 'react'
import { Shield, Brain, Languages, Map, Activity, ShieldCheck, FileCode, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DPRLandingPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
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
                        onClick={() => navigate('/role-selection')}
                        className="px-6 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors text-sm font-medium shadow-lg shadow-white/10"
                    >
                        Login
                    </button>
                </div>
            </header>

            <main className="flex flex-col items-center">
                {/* Hero Section */}
                <section className="w-full flex flex-col items-center pt-24 pb-20 px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Built for CRPF</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight max-w-4xl leading-[1.1]">
                        Mission Control for Infrastructure Analysis with tight tracking
                    </h1>
                    
                    <p className="text-lg text-white/50 mb-12 max-w-2xl leading-relaxed">
                        AI-powered DPR evaluation for operational-grade project intelligence.<br className="hidden sm:block" />
                        Secure, fast, and analytical.
                    </p>

                    {/* Dashboard Mockup Visual */}
                    <div className="relative w-full max-w-5xl aspect-[16/9] md:aspect-[21/9] rounded-xl border border-white/10 bg-[#0A0A0A] p-2 shadow-2xl mb-12 overflow-hidden group">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-2xl opacity-50 group-hover:opacity-70 transition duration-1000"></div>
                        
                        <div className="relative w-full h-full rounded-lg border border-white/5 bg-[#111] overflow-hidden flex flex-col">
                            {/* Mockup Header */}
                            <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-[#1a1a1a]">
                                <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50"></div>
                            </div>
                            {/* Mockup Content Grid */}
                            <div className="flex-1 flex p-4 gap-4">
                                {/* Sidebar mock */}
                                <div className="hidden md:flex flex-col w-48 border-r border-white/5 pr-4 space-y-4">
                                    <div className="h-6 w-3/4 bg-white/10 rounded"></div>
                                    <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                                    <div className="h-4 w-2/3 bg-white/5 rounded"></div>
                                    <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                                    <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                                </div>
                                {/* Main content mock */}
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="flex-1 bg-white/[0.02] rounded border border-white/5 relative overflow-hidden flex items-center justify-center">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent"></div>
                                        {/* Mock map outline or graph */}
                                        <div className="grid grid-cols-6 grid-rows-4 gap-2 w-full h-full p-4 opacity-20">
                                            {[...Array(24)].map((_, i) => (
                                                <div key={i} className="border border-white/20 rounded-sm"></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-1/3 flex gap-4">
                                        <div className="flex-1 bg-white/[0.02] rounded border border-white/5 p-3 flex items-end">
                                            <div className="w-full h-1/2 bg-gradient-to-t from-blue-500/20 to-transparent border-t border-blue-500/50"></div>
                                        </div>
                                        <div className="hidden sm:flex flex-1 bg-white/[0.02] rounded border border-white/5 p-3 items-end">
                                            <div className="w-full flex items-end gap-1 h-full">
                                                {[...Array(8)].map((_, i) => (
                                                    <div key={i} className="flex-1 bg-purple-500/30 rounded-t" style={{ height: `${Math.random() * 80 + 20}%`}}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/role-selection')}
                        className="px-8 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-sm font-medium backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    >
                        Analyze Report
                    </button>
                </section>

                {/* Core Capabilities */}
                <section className="w-full max-w-6xl px-6 py-20 border-t border-white/10">
                    <h2 className="text-3xl font-semibold mb-12 text-center tracking-tight">Core Capabilities</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Brain,
                                title: "AI-Powered Analysis",
                                desc: "AI-powered DPR evaluation for operational-grade project intelligence."
                            },
                            {
                                icon: Languages,
                                title: "Multi-Language Support",
                                desc: "High-fidelity execution, professional glyphs and language support."
                            },
                            {
                                icon: Map,
                                title: "Pan-India Evaluation",
                                desc: "Evaluations fine-tuned, professional insights and Pan-India analysis."
                            },
                            {
                                icon: Activity,
                                title: "Real-time Metrics",
                                desc: "Live tracking of project feasibility, cost overrides, and timeline risks."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Risk Mitigation",
                                desc: "Identify structural and financial risks before they impact the timeline."
                            },
                            {
                                icon: FileCode,
                                title: "Automated Reporting",
                                desc: "Generate comprehensive reports ready for final executive review."
                            }
                        ].map((capability, i) => (
                            <div key={i} className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                                    <capability.icon className="w-6 h-6 text-white/70" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-semibold mb-3 tracking-wide">{capability.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed">{capability.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Advanced Metrics / Analysis Sections */}
                <section className="w-full max-w-6xl px-6 py-20 border-t border-white/10">
                    <div className="grid lg:grid-cols-3 gap-6 mb-6">
                        {/* Left Info Panel */}
                        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                    <Brain className="w-5 h-5 text-white/70" strokeWidth={1.5} />
                                </div>
                                <span className="font-semibold text-sm">AI-Powered Analysis</span>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="border-t border-white/5 pt-6">
                                    <h4 className="font-semibold mb-3 tracking-wide">Multi-Language Support</h4>
                                    <ul className="space-y-3 text-sm text-white/40">
                                        <li className="flex gap-3 before:content-['•'] before:text-white/20">Provide unparalleled infrastructure analysis.</li>
                                        <li className="flex gap-3 before:content-['•'] before:text-white/20">Multi-line professional glyph support.</li>
                                    </ul>
                                </div>
                                <div className="border-t border-white/5 pt-6">
                                    <h4 className="font-semibold mb-3 tracking-wide">Pan-India Evaluation</h4>
                                    <ul className="space-y-3 text-sm text-white/40">
                                        <li className="flex gap-3 before:content-['•'] before:text-white/20">Execution and terminal utilization analysis.</li>
                                        <li className="flex gap-3 before:content-['•'] before:text-white/20">Comprehensive cross-regional infrastructure support.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Radar Chart Panel */}
                        <div className="lg:col-span-2 p-8 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col">
                            <h3 className="text-xl font-semibold mb-8 tracking-wide">Feasibility Metrics</h3>
                            <div className="flex-1 flex items-center justify-center min-h-[300px] relative">
                                {/* Synthetic Radar Chart via CSS SVG */}
                                <svg viewBox="0 0 200 200" className="w-full h-full max-w-[300px] opacity-70">
                                    {/* Web rings */}
                                    <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                                    <polygon points="100,40 160,75 160,125 100,160 40,125 40,75" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                                    <polygon points="100,60 140,90 140,110 100,140 60,110 60,90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                                    {/* Axes */}
                                    <line x1="100" y1="100" x2="100" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                                    <line x1="100" y1="100" x2="180" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                                    <line x1="100" y1="100" x2="180" y2="140" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                                    <line x1="100" y1="100" x2="100" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                                    <line x1="100" y1="100" x2="20" y2="140" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                                    <line x1="100" y1="100" x2="20" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                                    
                                    {/* Labels */}
                                    <text x="100" y="10" fill="rgba(255,255,255,0.3)" fontSize="6" textAnchor="middle">Feasibility Metrics</text>
                                    <text x="190" y="55" fill="rgba(255,255,255,0.3)" fontSize="6" textAnchor="start">Relationships</text>
                                    <text x="190" y="145" fill="rgba(255,255,255,0.3)" fontSize="6" textAnchor="start">Milestone Status</text>
                                    <text x="100" y="190" fill="rgba(255,255,255,0.3)" fontSize="6" textAnchor="middle">Radar Chart</text>
                                    <text x="10" y="145" fill="rgba(255,255,255,0.3)" fontSize="6" textAnchor="end"></text>
                                    <text x="10" y="55" fill="rgba(255,255,255,0.3)" fontSize="6" textAnchor="end">Feasibility Metrics</text>

                                    {/* Data Polygon */}
                                    <polygon points="100,30 160,80 140,150 100,150 50,110 40,70" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
                                    
                                    {/* Data Points */}
                                    <circle cx="100" cy="30" r="2" fill="white" />
                                    <circle cx="160" cy="80" r="2" fill="white" />
                                    <circle cx="140" cy="150" r="2" fill="white" />
                                    <circle cx="100" cy="150" r="2" fill="white" />
                                    <circle cx="50" cy="110" r="2" fill="white" />
                                    <circle cx="40" cy="70" r="2" fill="white" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Technical Feasibility Bottom Section */}
                    <div className="w-full p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <h3 className="text-xl font-semibold mb-8 tracking-wide">Technical Feasibility & Risk Mitigation</h3>
                        <div className="grid md:grid-cols-3 gap-6 min-h-[240px]">
                            <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4 relative min-h-[200px]">
                                <span className="text-sm font-medium text-white/70 absolute top-4 left-4">Risk Mitigation Dashboard</span>
                            </div>
                            <div className="md:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-lg p-4 relative flex flex-col gap-2">
                                <span className="text-sm font-medium text-white/70 mb-4 block">Risk Mitigation Dashboard</span>
                                {/* Mock treemap/heatmap grid */}
                                <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-1.5">
                                    <div className="col-span-2 row-span-2 bg-white/10 rounded-sm p-2 flex text-[10px] text-white/50">Feasibility</div>
                                    <div className="bg-white/5 rounded-sm p-2 flex text-[10px] text-white/50">Evaluations</div>
                                    <div className="bg-white/5 rounded-sm p-2 flex text-[10px] text-white/50">Continuity</div>
                                    <div className="row-span-2 bg-white/5 rounded-sm p-2 flex text-[10px] text-white/50">Facilitation</div>
                                    <div className="bg-white/5 rounded-sm p-2 flex text-[10px] text-white/50">Asterisks</div>
                                    <div className="col-span-2 bg-white/5 rounded-sm p-2 flex items-end text-[10px] text-white/50">Discovery</div>
                                    <div className="bg-white/5 rounded-sm p-2 flex text-[10px] text-white/50">Patterns</div>
                                    <div className="bg-white/5 rounded-sm p-2 flex text-[10px] text-white/50">Connect</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-white/5 bg-[#0A0A0A] py-16 flex flex-col items-center gap-8 text-sm text-white/40">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-lg justify-center">
                    <button className="flex items-center justify-between w-48 hover:text-white/70 transition-colors pb-3 border-b border-white/5">
                        <span className="font-medium">Platform</span> <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center justify-between w-48 hover:text-white/70 transition-colors pb-3 border-b border-white/5">
                        <span className="font-medium">Security</span> <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center justify-between w-48 hover:text-white/70 transition-colors pb-3 border-b border-white/5">
                        <span className="font-medium">Company</span> <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-8 text-xs tracking-wider">
                    Copyright © NEXUS AI. All rights reserved.
                </div>
            </footer>
        </div>
    )
}