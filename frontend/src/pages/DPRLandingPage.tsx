import React, { useState, useEffect } from 'react';
import {
    Moon, Sun, FileText, ShieldAlert, CheckCircle2,
    WifiOff, MessageSquare, Globe, Map as MapIcon,
    Layers, BarChart3, Clock,
    Menu, X, Send
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { LanguageDropdown } from '@/components/LanguageDropdown';

// Assets
import whiteLogo from './assets/WhiteLogo.png';
import blackLogo from './assets/BlackLogo.png';
import videoPath from './assets/northeast-video.mp4';
import state1 from './assets/state1.jpeg';

const DPRAnalyzerLanding: React.FC = () => {

    // Initialize theme from localStorage or default to dark
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme')
        return savedTheme === 'dark' || savedTheme === null // Default to dark if no preference
    })
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: 'Hello! I am your AI assistant for NexusAI project analysis. How can I help you today?' }
    ]);

    // Toggle Dark Mode
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        const newDarkMode = !isDarkMode
        setIsDarkMode(newDarkMode)
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
    }
    const toggleChat = () => setIsChatOpen(!isChatOpen);

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        setChatHistory([...chatHistory, { role: 'user', text: chatMessage }]);
        setTimeout(() => {
            setChatHistory(prev => [...prev, { role: 'bot', text: "I'm analyzing that request based on the latest DPR guidelines..." }]);
        }, 1000);
        setChatMessage("");
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isDarkMode ? 'bg-slate-900/70 border-b border-slate-800' : 'bg-white/60 border-b border-slate-200'} backdrop-blur-md`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo Area */}
                        <div className="flex items-center space-x-2">
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">NexusAI</h1>
                            </div>
                            <LanguageDropdown />
                        </div>

                        {/* Desktop Nav & Actions */}
                        <div className="hidden md:flex items-center space-x-6">
                            <nav className="flex space-x-4 text-sm font-medium opacity-80">
                                <a href="#features" className="hover:text-blue-500 transition-colors">Features</a>
                                <a href="#comparison" className="hover:text-blue-500 transition-colors">Compare</a>
                                <a href="#states" className="hover:text-blue-500 transition-colors">Benefits</a>
                            </nav>

                            <div className="flex items-center space-x-3 pl-6 border-l border-slate-700/30">
                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full hover:bg-slate-200/20 transition-colors"
                                    aria-label="Toggle Theme"
                                >
                                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                                </button>

                                {/* Login Button */}
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300"
                                >
                                    Login
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className={`md:hidden absolute w-full border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="px-4 pt-2 pb-6 space-y-4">
                            <a href="#features" className="block py-2 font-medium">Features</a>
                            <a href="#comparison" className="block py-2 font-medium">Compare</a>
                            <a href="#states" className="block py-2 font-medium">Benefits</a>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                                <span className="text-sm opacity-70">Theme</span>
                                <button onClick={toggleTheme} className="p-2 bg-slate-200/20 rounded-full">
                                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
                            </div>
                            <button onClick={() => setIsAuthModalOpen(true)} className="block w-full text-center py-3 rounded-lg bg-blue-600 text-white font-bold">
                                Login Portal
                            </button>
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. HERO SECTION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 z-0">
                        {/* Base light background */}
                        <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}></div>
                        {/* Large blurred purple blob - top right */}
                        <div className={`absolute top-0 right-0 w-[600px] h-[600px] ${isDarkMode ? 'bg-purple-900/40' : 'bg-purple-400/30'} rounded-full blur-3xl`}></div>
                        {/* Large blurred blue blob - bottom left */}
                        <div className={`absolute bottom-0 left-0 w-[700px] h-[700px] ${isDarkMode ? 'bg-blue-900/40' : 'bg-blue-400/30'} rounded-full blur-3xl`}></div>
                        {/* Medium blurred pink blob - center */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${isDarkMode ? 'bg-indigo-900/30' : 'bg-pink-300/20'} rounded-full blur-3xl`}></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-600/15 border-blue-600/30 text-blue-700'} border text-xs font-medium mb-6 animate-fade-in-up`}>
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></span>
                            </span>
                            <span>AI-Powered Governance</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight animate-slide-up animate-delay-100">
                            Tender Evaluator <br />
                            <span className="gradient-text">NexusAI</span>
                        </h1>

                        <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} animate-slide-up animate-delay-200`}>
                            AI-powered project evaluation for infrastructure excellence. <br className="hidden md:block" />
                            Accelerating development through intelligent automation.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center animate-slide-up animate-delay-300">
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25 hover:scale-105 hover:shadow-blue-500/40 transition-all duration-300"
                            >
                                Start Analyzing Now
                            </button>
                        </div>

                        <p className={`mt-8 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Intelligent Infrastructure Analysis Platform</p>
                    </div>
                </section>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
                {/* INTELLIGENT FEATURES SECTION */}
                <section id="features" className="py-24 bg-muted/30 border-y border-border/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-12 text-center">Intelligent Features</h2>
                            <p className={`text-lg font-semibold max-w-2xl mx-auto ${isDarkMode ? 'text-white' : 'text-black'}`}>Comprehensive tools designed to streamline the project review lifecycle.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={<FileText className="text-blue-400" />}
                                title="Fast PDF Parsing"
                                desc="Extracts data from complex DPRs in seconds with high fidelity."
                                isDarkMode={isDarkMode}
                            />
                            <FeatureCard
                                icon={<ShieldAlert className="text-amber-400" />}
                                title="Risk Prediction"
                                desc="AI identifies potential bottlenecks and compliance risks early."
                                isDarkMode={isDarkMode}
                            />
                            <FeatureCard
                                icon={<CheckCircle2 className="text-indigo-400" />}
                                title="Compliance Check"
                                desc="Automated validation against latest government guidelines."
                                isDarkMode={isDarkMode}
                            />
                            <FeatureCard
                                icon={<BarChart3 className="text-blue-400" />}
                                title="Recommendations"
                                desc="Smart suggestions for admins to improve project viability."
                                isDarkMode={isDarkMode}
                            />
                            <FeatureCard
                                icon={<WifiOff className="text-slate-400" />}
                                title="Offline Mode"
                                desc="Continue working without internet. Syncs when back online."
                                isDarkMode={isDarkMode}
                            />
                            <FeatureCard
                                icon={<MessageSquare className="text-pink-400" />}
                                title="AI Chat Assist"
                                desc="Ask questions about any DPR in natural language."
                                isDarkMode={isDarkMode}
                            />
                            <FeatureCard
                                icon={<Globe className="text-cyan-400" />}
                                title="Multilingual"
                                desc="Support for multiple Indian languages nationwide."
                                isDarkMode={isDarkMode}
                            />
                            <FeatureCard
                                icon={<Layers className="text-orange-400" />}
                                title="Multi-DPR Compare"
                                desc="Side-by-side comparison of multiple project proposals."
                                isDarkMode={isDarkMode}
                            />
                            <FeatureCard
                                icon={<MapIcon className="text-green-400" />}
                                title="Geospatial View"
                                desc="Visualize project locations and impact areas on the map."
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    </div>
                </section>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
            4 & 5. DEMO SECTION (Comparison + Map)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <section id="comparison" className={`py-24 ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                            {/* DPR Comparison Mini-Demo */}
                            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} shadow-2xl`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Layers size={20} className="text-indigo-500" /> DPR Comparison
                                    </h3>
                                    <span className="text-xs px-2 py-1 rounded bg-indigo-500/10 text-indigo-500">Live Demo</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                            <div className="h-2 w-12 bg-slate-500/20 rounded mb-2"></div>
                                            <div className="text-sm font-medium">Road Project A</div>
                                            <div className="text-xs text-blue-500 mt-1">Score: 92/100</div>
                                        </div>
                                        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                            <div className="h-2 w-12 bg-slate-500/20 rounded mb-2"></div>
                                            <div className="text-sm font-medium">Bridge Project B</div>
                                            <div className="text-xs text-amber-500 mt-1">Score: 78/100</div>
                                        </div>
                                    </div>

                                    <div className="relative h-32 w-full bg-slate-500/10 rounded-xl overflow-hidden flex items-end justify-center gap-4 p-4">
                                        {/* Mock Chart */}
                                        <div className="w-8 bg-blue-500/80 rounded-t-md h-[80%]"></div>
                                        <div className="w-8 bg-indigo-500/80 rounded-t-md h-[60%]"></div>
                                        <div className="w-8 bg-cyan-500/80 rounded-t-md h-[90%]"></div>
                                        <div className="absolute top-2 right-2 text-[10px] opacity-50">Cost vs Impact</div>
                                    </div>

                                    <button className="w-full py-2 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 transition-colors text-sm font-medium">
                                        Run Detailed Comparison
                                    </button>
                                </div>
                            </div>

                            {/* Map Preview Card */}
                            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} shadow-2xl relative overflow-hidden group`}>
                                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/92.9376,26.2006,6,0/600x400?access_token=PLACEHOLDER')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700"></div>
                                <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-slate-900 via-slate-900/50' : 'from-white via-white/50'} to-transparent`}></div>

                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                        <MapIcon size={20} className="text-blue-500" /> Geospatial Intelligence
                                    </h3>
                                    <p className="text-sm opacity-70 mb-6">Visualize project distribution and regional impact.</p>

                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs border border-red-500/30 backdrop-blur-sm">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> High Risk Areas
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs border border-blue-500/30 backdrop-blur-sm">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Completed
                                        </div>
                                    </div>
                                </div>

                                {/* Mock Marker Popup */}
                                <div className={`absolute bottom-8 right-8 p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-md shadow-lg border border-slate-500/20 max-w-[200px] transform translate-y-2 group-hover:translate-y-0 transition-transform`}>
                                    <div className="text-xs font-bold mb-1">Assam Highway Project</div>
                                    <div className="text-[10px] opacity-70 mb-2">Risk Score: Low</div>
                                    <div className="h-1 w-full bg-slate-500/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[85%]"></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
            6. PLATFORM BENEFITS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <section id="states" className={`py-24 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3">
                                Why Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">NexusAI</span>
                            </h2>
                            <p className="text-lg opacity-60 max-w-2xl mx-auto">
                                Empowering smarter decisions with cutting-edge AI technology
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Benefit Card 1 */}
                            <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-200 hover:shadow-lg'} transition-all duration-300 hover:-translate-y-1 animate-slide-up`}>
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 animate-bounce-slow">
                                    <BarChart3 className="text-white" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Unmatched Precision</h3>
                                <p className="text-lg opacity-60 leading-relaxed">
                                    Industry-leading accuracy in compliance validation, cost analysis, and risk detection across all infrastructure project types.
                                </p>
                            </div>

                            {/* Benefit Card 2 */}
                            <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-200 hover:shadow-lg'} transition-all duration-300 hover:-translate-y-1 animate-slide-up animate-delay-100`}>
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 animate-bounce-slow">
                                    <Clock className="text-white" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Lightning Fast Results</h3>
                                <p className="text-lg opacity-60 leading-relaxed">
                                    Transform weeks of manual review into minutes. Our AI processes complex tender documents with intelligent automation.
                                </p>
                            </div>

                            {/* Benefit Card 3 */}
                            <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-200 hover:shadow-lg'} transition-all duration-300 hover:-translate-y-1 animate-slide-up animate-delay-200`}>
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 animate-bounce-slow">
                                    <FileText className="text-white" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Battle-Tested Platform</h3>
                                <p className="text-lg opacity-60 leading-relaxed">
                                    Trusted by government agencies processing thousands of infrastructure projects with comprehensive AI-powered evaluation.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          9. FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <footer className={`py-16 border-t ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                        {/* Column A: MoDoNER Contact */}
                        <div className="space-y-4">
                            <div className="mb-4">
                                <span className="font-bold text-lg opacity-90">NexusAI</span>
                            </div>
                            <p className="text-sm opacity-60 leading-relaxed">
                                AI-Powered Infrastructure Evaluation Platform.<br />
                                Transforming project analysis through intelligent automation.
                            </p>
                            <div className="text-sm opacity-60 space-y-1">
                                <p>Intelligent Project Analysis Solutions</p>
                                <p>Email: support@nexusai.ai</p>
                                <p>Available 24/7</p>
                            </div>
                        </div>

                        {/* Column B: Platform */}
                        <div>
                            <h4 className="font-bold mb-6">Platform</h4>
                            <ul className="space-y-3 text-sm opacity-60">
                                <li><a href="#features" className="hover:text-blue-500 transition-colors">Features</a></li>
                                <li><a href="#comparison" className="hover:text-blue-500 transition-colors">Comparison Tool</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">API Access</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Support</a></li>
                            </ul>
                        </div>

                        {/* Column C: Company */}
                        <div>
                            <h4 className="font-bold mb-6">Company</h4>
                            <ul className="space-y-3 text-sm opacity-60">
                                <li><a href="#" className="hover:text-blue-500 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Careers</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-slate-500/10 text-center text-xs opacity-40">
                        &copy; {new Date().getFullYear()} NexusAI - Intelligent Project Evaluation Platform. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          7. AI CHAT LAUNCHER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={toggleChat}
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-transform duration-300"
                >
                    {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
                </button>
            </div>

            {/* Chat Panel */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-96 z-30 transform transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'} ${isDarkMode ? 'bg-slate-900 border-l border-slate-800' : 'bg-white border-l border-slate-200'} shadow-2xl`}>
                <div className="flex flex-col h-full">
                    <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} flex justify-between items-center`}>
                        <h3 className="font-bold flex items-center gap-2"><MessageSquare size={18} className="text-blue-500" /> AI Chat</h3>
                        <button
                            onClick={toggleChat}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            aria-label="Close chat"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-200/20 rounded-tl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleChatSubmit} className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="relative">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="Ask about project analysis..."
                                className={`w-full pl-4 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}
                            />
                            <button type="submit" className="absolute right-2 top-2 p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

        </div>
    );
};

// Helper Component for Features
const FeatureCard = ({ icon, title, desc, isDarkMode }: { icon: React.ReactNode, title: string, desc: string, isDarkMode: boolean }) => (
    <div className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:shadow-blue-500/10' : 'bg-gradient-to-br from-white to-slate-50 border-blue-100/50 shadow-sm hover:shadow-blue-200/40 hover:border-blue-200'}`}>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {icon}
        </div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-base opacity-60 leading-relaxed">{desc}</p>
    </div>
);

export default DPRAnalyzerLanding;