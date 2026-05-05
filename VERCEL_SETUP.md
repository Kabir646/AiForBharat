# Vercel Frontend Deployment Setup

## Critical Configuration Required

The repository has a monorepo structure with `frontend/` and `backend/` directories. Vercel needs to be configured to build only the frontend.

## Step-by-Step Vercel Configuration

### 1. In Vercel Dashboard

1. Go to your project settings: https://vercel.com/[your-username]/[project-name]/settings
2. Navigate to **"General"** tab
3. Find **"Root Directory"** section
4. Click **"Edit"**
5. Enter: `frontend`
6. Click **"Save"**

### 2. Build Settings (should auto-detect after setting root directory)

After setting root directory to `frontend`, Vercel should auto-detect:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

If not auto-detected, set them manually in the same settings page.

### 3. Environment Variables (if needed)

Add any required environment variables in the **"Environment Variables"** section:
- `VITE_API_URL` = `https://tender-evaluator-backend.onrender.com`

### 4. Redeploy

After saving settings:
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

## Alternative: Deploy from Subdirectory via CLI

If the dashboard doesn't show Root Directory option, use Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

## Troubleshooting

### Error: "cd: frontend: No such file or directory"
- **Cause**: Root Directory not set in Vercel dashboard
- **Solution**: Set Root Directory to `frontend` as described above

### Error: "No fastapi entrypoint found"
- **Cause**: Vercel is trying to detect backend instead of frontend
- **Solution**: Set Root Directory to `frontend` to tell Vercel to ignore backend

### Error: React peer dependency conflicts
- **Fixed**: Already resolved in `frontend/package.json`
- `react-leaflet` downgraded to 4.2.1
- `react-is` set to 18.2.0

## Current Repository Structure

```
AiForBharat/
├── backend/          # FastAPI backend (deployed on Render)
├── frontend/         # React + Vite frontend (deploy on Vercel)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── vercel.json       # Vercel configuration
└── ...
```

## Verification

After successful deployment, your frontend should be accessible at:
- `https://[project-name].vercel.app`

And it should connect to the backend at:
- `https://tender-evaluator-backend.onrender.com`
