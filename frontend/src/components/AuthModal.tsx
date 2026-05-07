import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield,
  User as UserIcon,
  Lock,
  Mail,
  AlertCircle,
  X,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  FileText,
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthStep = "role-selection" | "admin-login" | "user-auth";
type UserAuthTab = "login" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Shared animated slide variants
const slideVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -24, transition: { duration: 0.2, ease: "easeIn" as const } },
};

// Shared form field error
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// Shared error banner — bold red, impossible to miss
function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 rounded-lg bg-red-500/15 border border-red-500/40 text-sm font-medium text-red-500 mb-5"
    >
      <div className="h-8 w-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
        <AlertCircle className="h-4 w-4 text-red-500" />
      </div>
      <div>
        <p className="font-semibold">Error</p>
        <p className="text-red-400 font-normal text-xs mt-0.5">{message}</p>
      </div>
    </motion.div>
  );
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>("role-selection");
  const [userAuthTab, setUserAuthTab] = useState<UserAuthTab>("login");
  const { login, loginUser } = useRole();
  const navigate = useNavigate();

  // Admin Login State
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // User Auth State
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userConfirmPassword, setUserConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userError, setUserError] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = (role: "admin" | "user") => {
    setCurrentStep(role === "admin" ? "admin-login" : "user-auth");
  };

  const handleBack = () => {
    setCurrentStep("role-selection");
    setAdminId(""); setAdminPassword(""); setAdminError("");
    setUserEmail(""); setUserPassword(""); setUserName(""); setUserError("");
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    if (!adminId || !adminPassword) { setAdminError("Please enter both Admin ID and Password"); return; }
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(adminId)) { setAdminError("Admin ID must be alphanumeric"); return; }
    setAdminLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.adminLogin(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: adminId, password: adminPassword }),
      });
      const data = await response.json();
      if (response.ok && data.success) { login(); onClose(); navigate("/admin"); }
      else setAdminError(data.message || "Invalid credentials");
    } catch (err) {
      setAdminError("Failed to connect to server. Please try again.");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError("");
    if (userAuthTab === "login") {
      if (!userEmail || !userPassword) { setUserError("Please enter your email and password"); return; }
      setUserLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.userLogin(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, password: userPassword }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          loginUser({ id: data.user.id, name: data.user.name, email: data.user.email });
          onClose(); navigate("/user/dashboard");
        } else setUserError(data.detail || data.message || "Invalid credentials");
      } catch (err: unknown) {
        setUserError(err instanceof Error ? err.message : "Failed to connect to server.");
      } finally { setUserLoading(false); }
    } else {
      if (!userName || !userEmail || !userPassword || !userConfirmPassword) { setUserError("Please fill in all fields"); return; }
      if (userPassword !== userConfirmPassword) { setUserError("Passwords do not match"); return; }
      if (!userEmail.includes("@") || !userEmail.includes(".")) { setUserError("Please enter a valid email address"); return; }
      if (userPassword.length < 8) { setUserError("Password must be at least 8 characters long"); return; }
      setUserLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.userRegister(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: userName, email: userEmail, password: userPassword, confirm_password: userConfirmPassword }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          loginUser({ id: data.user.id, name: data.user.name, email: data.user.email });
          onClose(); navigate("/user/dashboard");
        } else setUserError(data.detail || data.message || "Signup failed. Please try again.");
      } catch (err: unknown) {
        setUserError(err instanceof Error ? err.message : "Failed to connect to server.");
      } finally { setUserLoading(false); }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
        className="w-full max-w-2xl relative"
      >
        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-2xl backdrop-blur-sm">
          {/* Gradient accent top */}
          <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground z-20"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Back */}
          <AnimatePresence>
            {currentStep !== "role-selection" && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={handleBack}
                className="absolute top-4 left-4 p-2 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground z-20 flex items-center gap-1.5 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </motion.button>
            )}
          </AnimatePresence>

          <div className="relative z-10">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Role Selection ── */}
              {currentStep === "role-selection" && (
                <motion.div key="role-selection" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="p-10">
                  {/* Header */}
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-5">
                      <FileText className="h-4 w-4" />
                      AI-Powered Document Analysis
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome to NexusAI</h2>
                    <p className="text-base text-muted-foreground">Select your role to access the platform</p>
                  </div>

                  {/* Role Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Admin */}
                    <button
                      onClick={() => handleRoleSelect("admin")}
                      className="group relative p-8 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex flex-col items-center text-center gap-5">
                        <div className="h-16 w-16 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-lg text-foreground mb-2">Admin</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">Full access to upload, analyze, and manage project documents</p>
                        </div>
                        <span className="text-sm text-primary font-medium group-hover:underline">Access Dashboard →</span>
                      </div>
                    </button>

                    {/* Client */}
                    <button
                      onClick={() => handleRoleSelect("user")}
                      className="group relative p-8 rounded-xl border border-border hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-200 text-left overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex flex-col items-center text-center gap-5">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/20">
                          <UserIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-lg text-foreground mb-2">Client</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">Upload projects, track progress, and access analyzed reports</p>
                        </div>
                        <span className="text-sm text-violet-500 font-medium group-hover:underline">Access Dashboard →</span>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2a: Admin Login ── */}
              {currentStep === "admin-login" && (
                <motion.div key="admin-login" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="p-10 pt-16">
                  <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-foreground">Admin Login</h2>
                    <p className="text-base text-muted-foreground mt-2">Enter your credentials to access the admin dashboard</p>
                  </div>

                  <ErrorBanner message={adminError} />

                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="adminId">Admin ID</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="adminId"
                          type="text"
                          value={adminId}
                          onChange={(e) => setAdminId(e.target.value)}
                          placeholder="Enter your admin ID"
                          disabled={adminLoading}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Alphanumeric characters only</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="adminPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="adminPassword"
                          type={showAdminPassword ? "text" : "password"}
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Enter your password"
                          disabled={adminLoading}
                          className="pl-9 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={adminLoading}
                      className="w-full gradient-primary text-white py-3 px-4 rounded-lg font-semibold text-base hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
                    >
                      {adminLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Logging in...</> : "Login to Dashboard"}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 2b: User Auth ── */}
              {currentStep === "user-auth" && (
                <motion.div key="user-auth" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="p-10 pt-16">
                  <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/20">
                      <UserIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-foreground">
                      {userAuthTab === "login" ? "Welcome back" : "Create account"}
                    </h2>
                    <p className="text-base text-muted-foreground mt-2">
                      {userAuthTab === "login" ? "Login to your account" : "Get started with your account"}
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 p-1 bg-muted/60 rounded-lg mb-6">
                    {(["login", "signup"] as UserAuthTab[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => { setUserAuthTab(tab); setUserError(""); }}
                        className={cn(
                          "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                          userAuthTab === tab
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {tab === "login" ? "Login" : "Sign Up"}
                      </button>
                    ))}
                  </div>

                  <ErrorBanner message={userError} />

                  <form onSubmit={handleUserAuth} className="space-y-4">
                    <AnimatePresence mode="wait">
                      {userAuthTab === "signup" && (
                        <motion.div key="name-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                          <Label htmlFor="userName">Full Name</Label>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input id="userName" type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your full name" disabled={userLoading} className="pl-9" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <Label htmlFor="userEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input id="userEmail" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="name@example.com" disabled={userLoading} className="pl-9" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="userPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input id="userPassword" type={showUserPassword ? "text" : "password"} value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="••••••••" disabled={userLoading} className="pl-9 pr-10" />
                        <button type="button" onClick={() => setShowUserPassword(!showUserPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {userAuthTab === "signup" && (
                        <motion.div key="confirm-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                          <Label htmlFor="userConfirmPassword">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input id="userConfirmPassword" type="password" value={userConfirmPassword} onChange={(e) => setUserConfirmPassword(e.target.value)} placeholder="Re-enter your password" disabled={userLoading} className="pl-9" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={userLoading}
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 px-4 rounded-lg font-semibold text-base hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
                    >
                      {userLoading
                        ? <><Loader2 className="h-4 w-4 animate-spin" />{userAuthTab === "login" ? "Logging in..." : "Creating account..."}</>
                        : userAuthTab === "login" ? "Login" : "Create Account"
                      }
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
