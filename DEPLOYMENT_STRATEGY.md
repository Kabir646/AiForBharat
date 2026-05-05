# Production Deployment Strategy - Tender Evaluator

## Overview
This document outlines a **cost-effective, production-ready deployment strategy** for the Tender Evaluator AI application using modern Platform-as-a-Service (PaaS) providers. This approach is **free or very low cost** (~$0-10/month) and provides automatic deployments with zero configuration.

---

## Architecture Decision

**Deployment Approach:** Modern PaaS Stack (Free/Low-Cost)

### Why This Stack?
- **Zero Cost**: Free tiers cover most use cases
- **Zero Config**: Auto-deploy on git push
- **Production Ready**: Built-in SSL, CDN, monitoring
- **Developer Friendly**: No infrastructure management
- **Scalable**: Easy to upgrade when needed

### Cost Comparison

| Service | AWS (Previous) | PaaS (New) | Savings |
|---------|---------------|------------|---------|
| Frontend | $10-20/month | **$0** (Vercel free) | $10-20 |
| Backend | $50-100/month | **$0-5** (Render/Railway free) | $50-95 |
| Database | $100-150/month | **$0** (Supabase/Neon free) | $100-150 |
| File Storage | Included | **$0** (Cloudinary free) | $0 |
| **Total** | **$160-270/month** | **$0-5/month** | **$155-265** |

---

## Phase 1: Service Selection & Setup

### 1.1 Frontend Hosting (React/Vite)

**Service:** Vercel (Recommended) or Netlify

**Why Vercel?**
- Built by the creators of Next.js, optimized for React
- Automatic deployments on git push
- Global CDN (Edge Network)
- Free SSL certificates
- Preview deployments for PRs
- Zero configuration for Vite projects

**Free Tier Limits:**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Custom domains
- Perfect for this project ✅

**Setup Time:** 5 minutes

**Alternative:** Netlify (also excellent, similar features)

### 1.2 Backend Hosting (FastAPI)

**Service:** Render (Recommended) or Railway

**Option A: Render (Recommended)**

**Why Render?**
- Native Docker support (your Dockerfile works as-is)
- Free tier for web services
- Automatic SSL
- Health checks built-in
- Easy environment variable management

**Free Tier:**
- 750 hours/month (enough for 1 service)
- Spins down after 15 min inactivity
- ~30s cold start on first request
- 512 MB RAM, shared CPU
- Perfect for testing/low-traffic ✅

**Paid Tier ($7/month):**
- Always-on (no spin-down)
- 512 MB RAM, 0.5 CPU
- Better for production

**Option B: Railway**

**Why Railway?**
- $5 free credit/month
- No spin-down (always on)
- Better for consistent performance
- Great developer experience

**Free Tier:**
- $5 credit/month (~150 hours of small instance)
- After credit: $0.000231/GB-hour RAM + $0.000463/vCPU-hour
- Estimated: $3-8/month for small instance

**Recommendation:** Start with Render free tier, upgrade to Railway if you need always-on.

### 1.3 Database (PostgreSQL)

**Service:** Supabase (Recommended) or Neon

**Option A: Supabase (Recommended)**

**Why Supabase?**
- Full PostgreSQL database
- Built-in connection pooling
- Real-time subscriptions (bonus feature)
- Auto-generated REST API (optional)
- Great dashboard and monitoring

**Free Tier:**
- 500 MB database storage
- Unlimited API requests
- 50,000 monthly active users
- 2 GB file storage
- No spin-down (always on) ✅
- Perfect for this project ✅

**Paid Tier ($25/month):**
- 8 GB database
- 100 GB bandwidth
- Daily backups

**Option B: Neon**

**Why Neon?**
- Serverless PostgreSQL
- Database branching (great for testing)
- Faster cold starts
- More generous free tier storage

**Free Tier:**
- 3 GB storage (6x more than Supabase)
- 1 project
- Compute: 191.9 hours/month
- Always-on option available

**Recommendation:** Supabase for simplicity, Neon if you need more storage.

### 1.4 File Storage

**Service:** Cloudinary (Already Configured) ✅

**Current Setup:**
- Free tier: 25 GB storage, 25 GB bandwidth/month
- Already integrated in your code
- No changes needed

**Keep as-is** - it's working perfectly!

### 1.5 Secrets Management

**Service:** Platform Environment Variables + GitHub Secrets

**Where to Store:**
- **GitHub Secrets**: For CI/CD workflows
- **Vercel Dashboard**: Frontend environment variables
- **Render/Railway Dashboard**: Backend environment variables
- **No separate secrets manager needed** - built into platforms

---

## Phase 2: Platform Architecture

### 2.1 Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Users (Global)                         │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐     ┌───────▼────────┐
        │     Vercel     │     │     Render     │
        │   Edge CDN     │     │   (FastAPI)    │
        │  (React App)   │     │   + Docker     │
        └────────────────┘     └───────┬────────┘
              FREE                     │ FREE
                              ┌────────┴─────────┐
                              │                  │
                      ┌───────▼────────┐ ┌──────▼──────┐
                      │   Supabase     │ │   Gemini    │
                      │  PostgreSQL    │ │     AI      │
                      └────────────────┘ └─────────────┘
                           FREE              
                              │
                      ┌───────▼────────┐
                      │  Cloudinary    │
                      │  (PDF Storage) │
                      └────────────────┘
                           FREE
```

### Key Benefits
- **$0-5/month total cost** (vs $240-470 on AWS)
- **Zero configuration** - platforms handle everything
- **Auto-deployments** on git push
- **Built-in SSL** and CDN
- **Easy scaling** when needed

---

## Phase 3: Backend Docker Configuration

### 3.1 Backend Dockerfile (Already Created)

Your existing `backend/Dockerfile` works perfectly with Render/Railway:

```dockerfile
# Multi-stage build for optimized production image
FROM python:3.9-slim as builder

# Install system dependencies for WeasyPrint
RUN apt-get update && apt-get install -y \
    gcc g++ libpango-1.0-0 libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 libffi-dev shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.9-slim
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 shared-mime-info curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app
COPY backend/ ./backend/
COPY requirements.txt .
RUN mkdir -p /app/data

# Non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with 2 workers
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

**No changes needed!** ✅

### 3.2 Environment Variables Configuration

Create `.env.production` (don't commit this):

```env
# Database (from Supabase)
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password

# API Keys
GEMINI_API_KEY=your_gemini_key
GOOGLE_API_KEY=your_gemini_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_ID=admin123
ADMIN_PASSWORD=your_secure_password

# Server
HOST=0.0.0.0
PORT=8000
```

---

## Phase 4: Step-by-Step Deployment

### Step 1: Deploy Database (5 minutes)

#### Option A: Supabase (Recommended)

1. **Sign up at https://supabase.com**
2. **Create new project**
   - Project name: `tender-evaluator`
   - Database password: (save this!)
   - Region: Choose closest to your users
3. **Get connection details**
   - Go to Project Settings → Database
   - Copy connection string
   - Format: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
4. **Initialize database**
   - Go to SQL Editor
   - Your `db.init_db()` will run automatically on first backend start
   - Or manually run your schema SQL

**Connection String:**
```
Host: db.xxxxx.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [your-password]
```

#### Option B: Neon

1. **Sign up at https://neon.tech**
2. **Create new project**
3. **Copy connection string**
4. **Use in backend environment variables**

### Step 2: Deploy Backend (10 minutes)

#### Option A: Render (Free Tier)

1. **Sign up at https://render.com**

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select branch: `main`

3. **Configure Service**
   ```yaml
   Name: tender-evaluator-backend
   Region: Choose closest to users
   Branch: main
   Root Directory: (leave empty)
   Runtime: Docker
   Dockerfile Path: backend/Dockerfile
   Docker Build Context Directory: .
   ```

4. **Set Environment Variables**
   - Click "Environment" tab
   - Add all variables from `.env.production`:
   ```
   DB_HOST=db.xxxxx.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_supabase_password
   GEMINI_API_KEY=your_key
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ADMIN_ID=admin123
   ADMIN_PASSWORD=your_password
   ```

5. **Configure Health Check**
   - Health Check Path: `/health`
   - Port: `8000`

6. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for first build
   - Get your URL: `https://tender-evaluator-backend.onrender.com`

7. **Test Backend**
   ```bash
   curl https://tender-evaluator-backend.onrender.com/health
   ```

**Important Notes:**
- Free tier spins down after 15 min inactivity
- First request after spin-down takes ~30s
- Upgrade to $7/month for always-on

#### Option B: Railway

1. **Sign up at https://railway.app**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect repository

3. **Configure Service**
   - Railway auto-detects Dockerfile
   - Set root directory if needed

4. **Add Environment Variables**
   - Click on service → Variables
   - Add all from `.env.production`

5. **Deploy**
   - Railway auto-deploys
   - Get URL from dashboard

6. **Monitor Usage**
   - Check usage dashboard
   - $5 free credit/month
   - ~$3-8/month after credit

### Step 3: Deploy Frontend (5 minutes)

#### Vercel (Recommended)

1. **Sign up at https://vercel.com**

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite

3. **Configure Build**
   ```yaml
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm ci
   ```

4. **Set Environment Variables**
   - Add in project settings:
   ```
   VITE_API_URL=https://tender-evaluator-backend.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get URL: `https://tender-evaluator.vercel.app`

6. **Configure Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your domain
   - Follow DNS instructions

7. **Test Frontend**
   - Visit your Vercel URL
   - Should load React app
   - Test API connection

**Auto-Deployments:**
- Every push to `main` auto-deploys
- PR previews automatically created
- Rollback with one click

#### Alternative: Netlify

1. **Sign up at https://netlify.com**
2. **Import from Git**
3. **Build settings:**
   ```yaml
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
4. **Environment variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
5. **Deploy**

### Step 4: Update Frontend API URL

Update `frontend/vite.config.ts` or create `frontend/.env.production`:

```env
VITE_API_URL=https://tender-evaluator-backend.onrender.com
```

Or update in Vercel dashboard environment variables.

### Step 5: Configure CORS in Backend

Update `backend/app.py` CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "https://tender-evaluator.vercel.app",  # Add your Vercel URL
        "https://your-custom-domain.com",  # Add custom domain if any
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push - backend will auto-redeploy on Render.

---

## Phase 5: Automated Deployments

### 5.1 How Auto-Deployment Works

**Frontend (Vercel):**
- Push to `main` → Vercel auto-builds and deploys
- Push to any branch → Preview deployment created
- Zero configuration needed ✅

**Backend (Render):**
- Push to `main` → Render auto-builds Docker and deploys
- Health checks ensure zero-downtime
- Automatic rollback on failure

**No GitHub Actions needed!** Platforms handle everything.

### 5.2 Optional: GitHub Actions for Testing

Create `.github/workflows/test.yml` for running tests before deployment:

```yaml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - run: pip install -r requirements.txt
      - run: pytest backend/tests/  # if you have tests
  
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test  # if you have tests
```

---

## Phase 6: Monitoring & Logging

### 6.1 Built-in Monitoring

**Vercel:**
- Analytics dashboard (free)
- Real-time logs
- Performance metrics
- Error tracking

**Render:**
- Metrics dashboard
- CPU/Memory usage
- Request logs
- Health check status

**Supabase:**
- Database dashboard
- Query performance
- Connection pooling stats
- Storage usage

### 6.2 Optional: External Monitoring

**Free Options:**
- **Sentry** (error tracking) - 5k events/month free
- **LogRocket** (session replay) - 1k sessions/month free
- **UptimeRobot** (uptime monitoring) - 50 monitors free

---

## Phase 7: Scaling Strategy

### 7.1 When to Upgrade

**Indicators you need to upgrade:**
- Backend spin-down causing UX issues
- Database approaching 500 MB (Supabase free tier)
- Consistent high traffic (>100 concurrent users)
- Need faster response times

### 7.2 Upgrade Path

**Backend:**
- Render Free → Render Starter ($7/month) - Always on
- Render Starter → Render Standard ($25/month) - More resources
- Or switch to Railway for better performance

**Database:**
- Supabase Free → Supabase Pro ($25/month) - 8 GB, backups
- Or Neon if you need more storage

**Frontend:**
- Vercel Free → Vercel Pro ($20/month) - More bandwidth, analytics
- Usually not needed unless very high traffic

### 7.3 Cost at Scale

| Tier | Frontend | Backend | Database | Total |
|------|----------|---------|----------|-------|
| **Free** | $0 | $0 | $0 | **$0** |
| **Starter** | $0 | $7 | $0 | **$7/month** |
| **Growth** | $0 | $7 | $25 | **$32/month** |
| **Pro** | $20 | $25 | $25 | **$70/month** |

Still **much cheaper** than AWS ($240-470/month)!

---

## Cost Estimation

### Monthly Costs

| Service | Free Tier | Paid Tier | When to Upgrade |
|---------|-----------|-----------|-----------------|
| **Vercel** | $0 (100 GB bandwidth) | $20/month | >100 GB bandwidth |
| **Render** | $0 (with spin-down) | $7/month | Need always-on |
| **Railway** | $5 credit (~$0) | $3-8/month | After free credit |
| **Supabase** | $0 (500 MB) | $25/month | >500 MB data |
| **Neon** | $0 (3 GB) | $19/month | >3 GB data |
| **Cloudinary** | $0 (25 GB) | $0 | Plenty for now |
| **Total** | **$0-5/month** | **$7-32/month** | As needed |

### Cost Optimization Tips

1. **Start with all free tiers** - Perfect for testing and low traffic
2. **Upgrade backend first** ($7/month) - Eliminates spin-down
3. **Monitor database size** - Optimize queries before upgrading
4. **Use Cloudinary transformations** - Reduce storage needs
5. **Implement caching** - Reduce database queries

---

## Rollback Strategy

### Frontend Rollback (Vercel)

**Option 1: Revert via Dashboard**
1. Go to Vercel dashboard
2. Click on deployment history
3. Find previous working deployment
4. Click "Promote to Production"
5. Done in 30 seconds ✅

**Option 2: Git Revert**
```bash
git revert <commit-hash>
git push origin main
# Vercel auto-deploys reverted version
```

### Backend Rollback (Render)

**Option 1: Redeploy Previous**
1. Go to Render dashboard
2. Click on service → "Manual Deploy"
3. Select previous commit from dropdown
4. Click "Deploy"

**Option 2: Git Revert**
```bash
git revert <commit-hash>
git push origin main
# Render auto-deploys reverted version
```

### Database Rollback

**Supabase:**
- Use SQL Editor to run rollback scripts
- Or restore from automatic backups (Pro tier)

**Manual Backup:**
```bash
# Backup before migration
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql

# Restore if needed
psql -h db.xxxxx.supabase.co -U postgres -d postgres < backup.sql
```

---

## Security Checklist

- [x] HTTPS everywhere (Vercel + Render provide free SSL)
- [x] Environment variables (not in code)
- [x] Database password secured
- [x] API keys in platform dashboards
- [x] CORS configured properly
- [ ] Rate limiting (add if needed)
- [ ] Input validation (already in FastAPI)
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection (React handles this)
- [ ] Regular dependency updates

### Additional Security (Optional)

**Add Rate Limiting:**
```python
# backend/app.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/user/login")
@limiter.limit("5/minute")  # 5 attempts per minute
async def user_login(request: Request, login_data: UserLoginRequest):
    # ... existing code
```

---

## Troubleshooting

### Backend Issues

**Problem: Backend not starting on Render**
```bash
# Check logs in Render dashboard
# Common issues:
# 1. Missing environment variables
# 2. Database connection failed
# 3. Port not set to 8000
```

**Solution:**
1. Check all environment variables are set
2. Test database connection string
3. Ensure Dockerfile exposes port 8000
4. Check health endpoint: `curl https://your-app.onrender.com/health`

**Problem: Backend spinning down (free tier)**
```bash
# This is expected on Render free tier
# First request after 15 min takes ~30s
```

**Solution:**
- Upgrade to Render Starter ($7/month) for always-on
- Or use Railway (no spin-down with free credit)
- Or implement a ping service to keep it warm

### Frontend Issues

**Problem: API calls failing**
```bash
# Check CORS errors in browser console
```

**Solution:**
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check CORS settings in backend include Vercel URL
3. Ensure backend is running (check health endpoint)

**Problem: Environment variables not working**
```bash
# Vite requires VITE_ prefix for env vars
```

**Solution:**
- Use `VITE_API_URL` not `API_URL`
- Redeploy after changing env vars in Vercel

### Database Issues

**Problem: Connection refused**
```bash
# Check connection string format
```

**Solution:**
1. Verify host, port, database name, user, password
2. Check Supabase project is active
3. Test connection with psql:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   ```

**Problem: Database full (500 MB limit)**
```bash
# Check database size in Supabase dashboard
```

**Solution:**
1. Clean up old data
2. Optimize queries
3. Upgrade to Supabase Pro ($25/month for 8 GB)
4. Or switch to Neon (3 GB free)

---

## Next Steps

### Immediate (Today)
1. ✅ Review this deployment strategy
2. ⬜ Sign up for Supabase (database)
3. ⬜ Sign up for Render (backend)
4. ⬜ Sign up for Vercel (frontend)
5. ⬜ Deploy database first

### Short-term (This Week)
1. ⬜ Deploy backend to Render
2. ⬜ Deploy frontend to Vercel
3. ⬜ Test end-to-end functionality
4. ⬜ Configure custom domain (optional)
5. ⬜ Set up monitoring

### Long-term (This Month)
1. ⬜ Monitor usage and costs
2. ⬜ Optimize performance
3. ⬜ Add tests
4. ⬜ Document API
5. ⬜ Plan for scaling

---

## Support Resources

### Platform Documentation
- **Vercel**: https://vercel.com/docs
- **Render**: https://render.com/docs
- **Railway**: https://docs.railway.app
- **Supabase**: https://supabase.com/docs
- **Neon**: https://neon.tech/docs

### Community Support
- Vercel Discord: https://vercel.com/discord
- Render Community: https://community.render.com
- Supabase Discord: https://discord.supabase.com

---

## Summary

### What You Get

✅ **$0-5/month deployment** (vs $240-470 on AWS)
✅ **Zero configuration** - platforms handle everything
✅ **Auto-deployments** on git push
✅ **Built-in SSL** and CDN
✅ **Easy scaling** when needed
✅ **Great developer experience**
✅ **Production-ready** from day one

### Deployment Time

- **Database**: 5 minutes (Supabase signup + create project)
- **Backend**: 10 minutes (Render setup + first deploy)
- **Frontend**: 5 minutes (Vercel import + deploy)
- **Total**: **~20 minutes** to production! 🚀

### vs AWS Comparison

| Aspect | PaaS (New) | AWS (Old) |
|--------|------------|-----------|
| **Cost** | $0-5/month | $240-470/month |
| **Setup Time** | 20 minutes | 2-3 days |
| **Configuration** | Zero | Complex |
| **Maintenance** | Minimal | High |
| **Scaling** | One-click | Manual |
| **SSL** | Automatic | Manual setup |
| **Monitoring** | Built-in | Setup required |

---

**Ready to deploy? See DEPLOYMENT_QUICKSTART.md for step-by-step instructions!** 🎯
