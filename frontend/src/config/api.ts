/**
 * API Configuration
 * Centralized API URL management for all backend calls
 */

// Get API URL from environment variable or use production backend as fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tender-evaluator-backend.onrender.com'

// Helper function to build full API URLs
export const getApiUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${API_BASE_URL}/${cleanPath}`
}

// Export commonly used endpoints
export const API_ENDPOINTS = {
  // Auth
  adminLogin: () => getApiUrl('api/admin/login'),
  userLogin: () => getApiUrl('api/user/login'),
  userRegister: () => getApiUrl('api/user/register'),
  
  // Projects
  projects: () => getApiUrl('projects'),
  project: (id: number) => getApiUrl(`projects/${id}`),
  projectComparison: (id: number) => getApiUrl(`projects/${id}/comparison`),
  projectComplianceWeights: (id: number) => getApiUrl(`projects/${id}/compliance-weights`),
  
  // DPRs
  dprs: () => getApiUrl('api/dprs'),
  dpr: (id: number) => getApiUrl(`dpr/${id}`),
  dprPdf: (id: number) => getApiUrl(`dpr/${id}/pdf`),
  dprAnalyze: (id: number) => getApiUrl(`dprs/${id}/analyze`),
  
  // Client DPRs
  clientDprs: (clientId: string) => getApiUrl(`api/client/dprs?client_id=${clientId}`),
  clientDprUpload: () => getApiUrl('api/client/dprs/upload'),
  clientDprDownload: (dprId: number, clientId: string) => getApiUrl(`api/client/dprs/${dprId}/download?client_id=${clientId}`),
  clientDprDelete: (dprId: number, clientId: string) => getApiUrl(`api/client/dprs/${dprId}?client_id=${clientId}`),
}
