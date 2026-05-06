# Authentication Fix Summary

## Problem
The application was returning `401 Unauthorized` errors when trying to update compliance weights and other API endpoints. This was happening because:

1. The backend has a `TokenAuthMiddleware` that requires an `Authorization: Bearer <token>` header for most API endpoints
2. The frontend had the token configured in `.env.local` as `VITE_HACKATHON_ACCESS_TOKEN`
3. Some components were using the native `fetch` API directly instead of the authenticated wrapper

## Root Cause
The `ComplianceWeightsModal.tsx` and several other components were making API calls using the native `fetch` function without including the authorization header, causing the backend middleware to reject the requests with 401 Unauthorized.

## Solution
Updated all frontend API calls to use an `authenticatedFetch` wrapper that automatically includes the authorization token:

### Files Modified

1. **frontend/src/lib/api.ts**
   - Renamed the local `fetch` override to `authenticatedFetch`
   - Exported `authenticatedFetch` for use in other components
   - Updated all API methods in the `api` object to use `authenticatedFetch`

2. **frontend/src/components/ComplianceWeightsModal.tsx**
   - Imported `authenticatedFetch` from `@/lib/api`
   - Updated GET request for loading weights
   - Updated PUT request for saving weights

3. **frontend/src/pages/ProjectDetail.tsx**
   - Imported `authenticatedFetch` from `@/lib/api`
   - Updated POST request for analyzing DPRs
   - Updated GET request for fetching project comparisons

4. **frontend/src/pages/ClientDashboard.tsx**
   - Imported `authenticatedFetch` from `@/lib/api`
   - Updated GET request for fetching projects
   - Updated GET request for fetching client DPRs
   - Updated POST request for uploading DPRs
   - Updated GET request for downloading DPRs
   - Updated DELETE request for deleting DPRs

## Backend Middleware Configuration
The backend's `TokenAuthMiddleware` in `backend/app.py` excludes these paths from authentication:
- `/static`, `/data`, `/docs`, `/openapi.json`, `/redoc`, `/`
- `/api/admin/login`, `/api/user/login`, `/api/user/register`
- Paths ending with `/pdf`, `/report`, `/download`
- `OPTIONS` requests (CORS preflight)

All other endpoints require the `Authorization: Bearer <token>` header.

## Environment Configuration
- Backend: `.env` contains `HACKATHON_ACCESS_TOKEN="hackathon_demo_token_123"`
- Frontend: `frontend/.env.local` contains `VITE_HACKATHON_ACCESS_TOKEN="hackathon_demo_token_123"`

## Testing
After these changes, all API calls should now include the proper authorization header and work correctly in both local development and production environments.

## Note
The download endpoint (`/api/client/dprs/{id}/download`) is excluded from authentication in the middleware, but we still include the auth header for consistency. The middleware will simply ignore it for that endpoint.
