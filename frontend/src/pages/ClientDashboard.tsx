import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Upload,
  FileText,
  Download,
  Clock,
  Trash2,
  MessageSquare,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  ArrowRight,
  LogOut,
  Moon,
  Sun,
  Bell,
  User,
  Settings,
  TrendingUp,
  Activity,
} from "lucide-react";
import { LanguageDropdown } from "@/components/LanguageDropdown";
import { API_BASE_URL } from "@/config/api";
import { authenticatedFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ClientDPR {
  id: number;
  client_id: number;
  project_name: string;
  dpr_filename: string;
  original_filename: string;
  status: string;
  created_at: string;
  admin_feedback?: string;
  feedback_timestamp?: string;
}

interface Project {
  id: number;
  name: string;
  state: string;
  scheme: string;
  sector: string;
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logoutUser } = useRole();
  const [dprs, setDprs] = useState<ClientDPR[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<ClientDPR | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDark, setIsDark] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "upload" | "submissions">("dashboard");

  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode =
      savedTheme === "dark" ||
      (!savedTheme && document.documentElement.classList.contains("dark"));

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    document.documentElement.classList.toggle("dark");
    setIsDark(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  useEffect(() => {
    if (!userInfo) {
      navigate("/user/auth");
      return;
    }
    fetchDPRs();
    fetchProjects();
  }, [userInfo, navigate]);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await authenticatedFetch(`${API_BASE_URL}/projects`);
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      setError("Failed to load projects. Please try again.");
      console.error("Fetch projects error:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchDPRs = async () => {
    if (!userInfo) return;

    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/client/dprs?client_id=${userInfo.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch DPRs");
      const data = await response.json();
      setDprs(data.dprs);
    } catch (err) {
      setError("Failed to load your DPRs. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Allow multiple file types
      const allowedExtensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.txt'];
      const fileName = file.name.toLowerCase();
      
      if (!allowedExtensions.some(ext => fileName.endsWith(ext))) {
        setError(`File type not supported. Allowed types: ${allowedExtensions.join(', ')}`);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      // Allow multiple file types
      const allowedExtensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.txt'];
      const fileName = file.name.toLowerCase();
      
      if (allowedExtensions.some(ext => fileName.endsWith(ext))) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError(`File type not supported. Allowed types: ${allowedExtensions.join(', ')}`);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInfo) {
      setError("You must be logged in to upload DPRs.");
      return;
    }

    if (!selectedProjectId) {
      setError("Please select a project.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const selectedProject = projects.find((p) => p.id === selectedProjectId);
      if (!selectedProject) {
        throw new Error("Selected project not found");
      }

      const formData = new FormData();
      formData.append("client_id", userInfo.id.toString());
      formData.append("project_id", selectedProjectId.toString());
      formData.append("project_name", selectedProject.name);
      formData.append("file", selectedFile);

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/client/dprs/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      setSelectedProjectId(null);
      setSelectedFile(null);

      const fileInput = document.getElementById("dpr-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await fetchDPRs();
    } catch (err: any) {
      setError(err.message || "Failed to upload DPR. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (dpr: ClientDPR) => {
    if (!userInfo) return;

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/client/dprs/${dpr.id}/download?client_id=${userInfo.id}`,
      );

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = dpr.original_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download file. Please try again.");
      console.error("Download error:", err);
    }
  };

  const handleDelete = async (dpr: ClientDPR) => {
    if (!userInfo) return;

    if (
      !confirm(
        `Are you sure you want to delete "${dpr.original_filename}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/client/dprs/${dpr.id}?client_id=${userInfo.id}`;
      const response = await authenticatedFetch(url, { method: "DELETE" });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete");
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      await fetchDPRs();
    } catch (err: any) {
      setError(err.message || "Failed to delete DPR. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  // Calculate stats
  const stats = {
    total: dprs.length,
    pending: dprs.filter(
      (d) => d.status === "pending" || d.status === "completed",
    ).length,
    accepted: dprs.filter((d) => d.status === "accepted").length,
    rejected: dprs.filter((d) => d.status === "rejected").length,
  };

  // Filter DPRs
  const filteredDPRs = dprs.filter((dpr) => {
    const matchesSearch =
      dpr.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dpr.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || dpr.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-heading font-semibold text-foreground">
              NexusAI
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg flex items-center gap-2",
                currentView === "dashboard"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("upload")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg flex items-center gap-2",
                currentView === "upload"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Upload className="h-4 w-4" />
              Upload DPR
            </button>
            <button
              onClick={() => setCurrentView("submissions")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg flex items-center gap-2",
                currentView === "submissions"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <FileText className="h-4 w-4" />
              My Submissions
            </button>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <LanguageDropdown />
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="h-4.5 w-4.5 text-muted-foreground" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-muted-foreground" />
              )}
            </button>
            <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors relative">
              <Bell className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <User className="h-4.5 w-4.5 text-muted-foreground" />
            </button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-heading font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Overview of DPR statuses and recent system updates for internal operators.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Total DPR Uploads
                  </h3>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold">{stats.total}</p>
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Under Review
                  </h3>
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.pending}</p>
                  <span className="text-sm text-muted-foreground">+ Pending</span>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Approved
                  </h3>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.accepted}</p>
                  <span className="text-sm text-muted-foreground">10% completion</span>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow border-red-200 dark:border-red-900">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Requiring Action
                  </h3>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
                  <span className="text-sm text-muted-foreground">Immediate review</span>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold">Recent Activity</h2>
                <button 
                  onClick={() => setCurrentView("submissions")}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : dprs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dprs.slice(0, 5).map((dpr) => (
                    <div
                      key={dpr.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => setCurrentView("submissions")}
                    >
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {dpr.status === "accepted" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : dpr.status === "rejected" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm">{dpr.project_name}</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              dpr.status === "accepted"
                                ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                : dpr.status === "rejected"
                                ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                : dpr.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                            }`}
                          >
                            {dpr.status === "accepted"
                              ? "ACCEPTED"
                              : dpr.status === "rejected"
                              ? "REJECTED"
                              : dpr.status === "pending"
                              ? "PENDING"
                              : "COMPLETED"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {dpr.status === "accepted"
                            ? "Document approved and processed successfully."
                            : dpr.status === "rejected"
                            ? "Document rejected. Click to view admin feedback."
                            : "Document package uploaded. Awaiting initial processing."}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {new Date(dpr.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          {dpr.admin_feedback && (
                            <span className="text-xs text-primary flex items-center gap-1 group-hover:underline">
                              <MessageSquare className="h-3 w-3" />
                              View Feedback
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Upload DPR View */}
        {currentView === "upload" && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-heading font-bold mb-2">Upload DPR</h1>
            </div>

            {/* Upload Form */}
            <Card className="p-8">
              <h2 className="text-2xl font-heading font-bold mb-6">Upload Document Package</h2>

              <form onSubmit={handleUpload} className="space-y-6">
                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3 uppercase tracking-wide">
                    Select Project/Tender
                  </label>
                  {loadingProjects ? (
                    <div className="w-full px-4 py-3 border border-border rounded-lg bg-muted/50 text-muted-foreground">
                      Loading projects...
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="w-full px-4 py-3 border-2 border-orange-300 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-orange-700 dark:text-orange-400">
                      No projects available. Please ask an admin to create projects first.
                    </div>
                  ) : (
                    <select
                      value={selectedProjectId || ""}
                      onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-all"
                      required
                      disabled={uploading}
                    >
                      <option value="">-- SELECT PROJECT/TENDER --</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name} ({project.state} - {project.scheme})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-3 uppercase tracking-wide">
                    Payload (DPR Data)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <div className="pointer-events-none">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      {selectedFile ? (
                        <div className="space-y-2">
                          <p className="font-semibold text-foreground">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                            }}
                            className="text-sm text-primary hover:underline pointer-events-auto"
                          >
                            No file chosen
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium mb-2">
                            Drop payload here or click to browse
                          </p>
                          <p className="text-sm text-muted-foreground">
                            MAX SIZE: 50MB • PDF ONLY
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedProjectId(null);
                      setSelectedFile(null);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    disabled={uploading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading || !selectedProjectId || !selectedFile}
                    className="flex-1 gradient-primary text-white"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      "Initiate Upload"
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* My Submissions View */}
        {currentView === "submissions" && (
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-heading font-bold mb-2">My Submissions</h1>
            </div>

            {/* Transmission Log */}
            <Card className="p-6">
              <h2 className="text-2xl font-heading font-bold mb-6">Transmission Log</h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : dprs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No submissions yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="text-left py-3 px-4 font-semibold">Project Entity</th>
                        <th className="text-left py-3 px-4 font-semibold">Artifact Identifier</th>
                        <th className="text-left py-3 px-4 font-semibold">Status Code</th>
                        <th className="text-left py-3 px-4 font-semibold">Transmit (UTC)</th>
                        <th className="text-center py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dprs.map((dpr) => (
                        <tr
                          key={dpr.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="font-medium">{dpr.project_name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-mono text-muted-foreground">
                                {dpr.id.toString().padStart(16, "0")}:{dpr.dpr_filename.split("_")[0]}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wide ${
                                dpr.status === "accepted"
                                  ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                  : dpr.status === "rejected"
                                  ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                  : dpr.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                              }`}
                            >
                              {dpr.status === "accepted"
                                ? "Completed"
                                : dpr.status === "rejected"
                                ? "Rejected"
                                : dpr.status === "pending"
                                ? "Pending"
                                : "Completed"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground font-mono">
                            {new Date(dpr.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}{" "}
                            {new Date(dpr.created_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDownload(dpr)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              {dpr.admin_feedback && (
                                <button
                                  onClick={() => setSelectedFeedback(dpr)}
                                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                                  title="View Feedback"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(dpr)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-8 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-2">Admin Feedback</h2>
                <p className="text-sm text-muted-foreground">
                  For: <span className="font-medium text-foreground">{selectedFeedback.original_filename}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {selectedFeedback.admin_feedback}
                </p>
              </div>
              {selectedFeedback.feedback_timestamp && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Received on: {new Date(selectedFeedback.feedback_timestamp).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setSelectedFeedback(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
