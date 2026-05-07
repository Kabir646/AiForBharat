import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  FileText,
  ShieldAlert,
  CheckCircle2,
  WifiOff,
  MessageSquare,
  Globe,
  BarChart3,
  Clock,
  Menu,
  X,
} from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { LanguageDropdown } from "@/components/LanguageDropdown";
import { HeroGeometricBackground } from "@/components/ui/shape-landing-hero";

const DPRAnalyzerLanding: React.FC = () => {
  // Initialize theme from localStorage or default to dark
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" || savedTheme === null;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"}`}
    >
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HEADER — matches admin Header.tsx style
      ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-heading font-semibold text-foreground">
              NexusAI
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              className="px-3.5 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              Features
            </a>
            <a
              href="#states"
              className="px-3.5 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              Benefits
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <LanguageDropdown />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200"
            >
              Login
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              <a href="#features" className="px-3.5 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                Features
              </a>
              <a href="#states" className="px-3.5 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                Benefits
              </a>
              <div className="pt-2 border-t border-border/40">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-2.5 rounded-lg gradient-primary text-white text-sm font-semibold"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. HERO SECTION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
          {/* Animated Geometric Background */}
          <HeroGeometricBackground />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span>AI-Powered Governance</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight animate-slide-up animate-delay-100 text-white">
              Tender Evaluator <br />
              <span className="gradient-text">NexusAI</span>
            </h1>

            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-slate-300 animate-slide-up animate-delay-200">
              AI-powered project evaluation for infrastructure excellence.{" "}
              <br className="hidden md:block" />
              Accelerating development through intelligent automation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center animate-slide-up animate-delay-300">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl gradient-primary text-white font-bold text-lg shadow-lg hover:opacity-90 hover:scale-105 transition-all duration-300"
              >
                Start Analyzing Now
              </button>
            </div>

            <p className="mt-8 text-sm text-slate-400">
              Intelligent Infrastructure Analysis Platform
            </p>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
                {/* INTELLIGENT FEATURES SECTION */}
        <section
          id="features"
          className="py-24 bg-muted/30 border-y border-border/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-12 text-center">
                Intelligent Features
              </h2>
              <p
                className={`text-lg font-semibold max-w-2xl mx-auto ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Comprehensive tools designed to streamline the project review
                lifecycle.
              </p>
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
                icon={<BarChart3 className="text-orange-400" />}
                title="Multi-DPR Compare"
                desc="Side-by-side comparison of multiple project proposals."
                isDarkMode={isDarkMode}
              />
              <FeatureCard
                icon={<Globe className="text-green-400" />}
                title="Geospatial View"
                desc="Visualize project locations and impact areas on the map."
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </section>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
            6. PLATFORM BENEFITS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          id="states"
          className={`py-24 ${isDarkMode ? "bg-zinc-950" : "bg-slate-50"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Why Choose{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                  NexusAI
                </span>
              </h2>
              <p className="text-lg opacity-60 max-w-2xl mx-auto">
                Empowering smarter decisions with cutting-edge AI technology
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Benefit Card 1 */}
              <div
                className={`p-8 rounded-2xl border ${isDarkMode ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-white border-slate-200 hover:shadow-lg"} transition-all duration-300 hover:-translate-y-1 animate-slide-up`}
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 animate-bounce-slow">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Unmatched Precision</h3>
                <p className="text-lg opacity-60 leading-relaxed">
                  Industry-leading accuracy in compliance validation, cost
                  analysis, and risk detection across all infrastructure project
                  types.
                </p>
              </div>

              {/* Benefit Card 2 */}
              <div
                className={`p-8 rounded-2xl border ${isDarkMode ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-white border-slate-200 hover:shadow-lg"} transition-all duration-300 hover:-translate-y-1 animate-slide-up animate-delay-100`}
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 animate-bounce-slow">
                  <Clock className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Lightning Fast Results
                </h3>
                <p className="text-lg opacity-60 leading-relaxed">
                  Transform weeks of manual review into minutes. Our AI
                  processes complex tender documents with intelligent
                  automation.
                </p>
              </div>

              {/* Benefit Card 3 */}
              <div
                className={`p-8 rounded-2xl border ${isDarkMode ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-white border-slate-200 hover:shadow-lg"} transition-all duration-300 hover:-translate-y-1 animate-slide-up animate-delay-200`}
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 animate-bounce-slow">
                  <FileText className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Battle-Tested Platform
                </h3>
                <p className="text-lg opacity-60 leading-relaxed">
                  Trusted by government agencies processing thousands of
                  infrastructure projects with comprehensive AI-powered
                  evaluation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          9. FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer
        className={`py-16 border-t ${isDarkMode ? "bg-black border-zinc-800" : "bg-slate-100 border-slate-200"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Column A: MoDoNER Contact */}
            <div className="space-y-4">
              <div className="mb-4">
                <span className="font-bold text-lg opacity-90">NexusAI</span>
              </div>
              <p className="text-sm opacity-60 leading-relaxed">
                AI-Powered Infrastructure Evaluation Platform.
                <br />
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
                <li>
                  <a
                    href="#features"
                    className="hover:text-blue-500 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#comparison"
                    className="hover:text-blue-500 transition-colors"
                  >
                    Comparison Tool
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    API Access
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Column C: Company */}
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-sm opacity-60">
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-500/10 text-center text-xs opacity-40">
            &copy; {new Date().getFullYear()} NexusAI - Intelligent Project
            Evaluation Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

// Helper Component for Features
const FeatureCard = ({
  icon,
  title,
  desc,
  isDarkMode,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  isDarkMode: boolean;
}) => (
  <div
    className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:shadow-black/30" : "bg-gradient-to-br from-white to-slate-50 border-blue-100/50 shadow-sm hover:shadow-blue-200/40 hover:border-blue-200"}`}
  >
    <div
      className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${isDarkMode ? "bg-zinc-950" : "bg-slate-50"}`}
    >
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-base opacity-60 leading-relaxed">{desc}</p>
  </div>
);

export default DPRAnalyzerLanding;
