# Deployment Quick Start Guide - Free Tier Edition

**Deploy your Tender Evaluator app for FREE in 20 minutes!** 🚀

This guide uses modern Platform-as-a-Service (PaaS) providers that offer generous free tiers perfect for production use.

---

## 🎯 What You'll Deploy

- **Frontend**: Vercel (React/Vite) - **FREE**
- **Backend**: Render (FastAPI + Docker) - **FREE** (with spin-down)
- **Database**: Supabase (PostgreSQL) - **FREE** (500 MB)
- **File Storage**: Cloudinary (already configured) - **FREE**

**Total Cost: $0/month** (or $7/month for always-on backend)

---

## ✅ Prerequisites

- GitHub account
- Git installed locally
- Your code pushed to GitHub
- 20 minutes of your time

**No credit card required for free tiers!** ✨

---

## 📋 Step-by-Step Deployment

### Step 1: Deploy Database (5 minutes)

#### 1.1 Sign Up for Supabase

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (easiest)

#### 1.2 Create New Project

1. Click "New Project"
2. Fill in details:
   ```
   Name: tender-evaluator
   Database Password: [Create a strong password - SAVE THIS!]
   Region: Choose closest to your users (e.g., Mumbai for India)
   ```
3. Click "Create new project"
4. Wait 2-3 minutes for provisioning

#### 1.3 Get Connection Details

1. Go to Project Settings (gear icon) → Database
2. Copy these details:
   ```
   Host: db.xxxxxxxxxxxxx.supabase.co
   Port: 5432
   Database: postgres
   User: postgres
   Password: [your password from step 1.2]
   ```
3. **Save these!** You'll need them for backend deployment

#### 1.4 Test Connection (Optional)

```bash
# If you have psql installed
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Should connect successfully
# Type \q to exit
```

✅ **Database is ready!**

---

### Step 2: Deploy Backend (10 minutes)

#### 2.1 Sign Up for Render

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

#### 2.2 Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
   - If not listed, click "Configure account" and grant access
3. Select your repository: `SIH-first` (or your repo name)
4. Click "Connect"

#### 2.3 Configure Service

Fill in the form:

```yaml
Name: tender-evaluator-backend
Region: Singapore (or closest to your users)
Branch: main
Root Directory: (leave empty)
Runtime: Docker
Dockerfile Path: backend/Dockerfile
Docker Build Context Directory: .
```

#### 2.4 Select Plan

- Choose **"Free"** plan
- Note: Spins down after 15 min inactivity, ~30s cold start
- Upgrade to "Starter" ($7/month) later for always-on

#### 2.5 Add Environment Variables

Click "Advanced" → "Add Environment Variable"

Add these one by one:

```env
# Database (from Supabase)
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password

# API Keys
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_API_KEY=your_gemini_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Credentials
ADMIN_ID=admin123
ADMIN_PASSWORD=your_secure_admin_password

# Server Config
HOST=0.0.0.0
PORT=8000
```

#### 2.6 Configure Health Check

Scroll down to "Health Check Path":
```
/health
```

#### 2.7 Deploy!

1. Click "Create Web Service"
2. Wait 5-10 minutes for first build
3. Watch the logs - you'll see Docker build progress
4. When done, you'll get a URL like:
   ```
   https://tender-evaluator-backend.onrender.com
   ```

#### 2.8 Test Backend

```bash
# Test health endpoint
curl https://tender-evaluator-backend.onrender.com/health

# Should return:
# {"status":"healthy","service":"tender-evaluator-backend",...}
```

✅ **Backend is live!**

---

### Step 3: Update CORS in Backend (2 minutes)

Before deploying frontend, update CORS to allow your Vercel domain.

#### 3.1 Edit backend/app.py

Find the CORS middleware section and update:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "https://tender-evaluator.vercel.app",  # Add this
        "https://*.vercel.app",  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3.2 Commit and Push

```bash
git add backend/app.py
git commit -m "Update CORS for Vercel deployment"
git push origin main
```

Render will automatically redeploy (takes 3-5 minutes).

---

### Step 4: Deploy Frontend (5 minutes)

#### 4.1 Sign Up for Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended)
4. Authorize Vercel

#### 4.2 Import Project

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Vercel auto-detects it's a Vite project ✅

#### 4.3 Configure Build Settings

Vercel should auto-fill these, but verify:

```yaml
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

#### 4.4 Add Environment Variables

Click "Environment Variables" and add:

```env
VITE_API_URL=https://tender-evaluator-backend.onrender.com
```

**Important:** Use your actual Render backend URL from Step 2.7!

#### 4.5 Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes
3. Vercel builds and deploys
4. You'll get a URL like:
   ```
   https://tender-evaluator.vercel.app
   ```

#### 4.6 Test Frontend

1. Visit your Vercel URL
2. Should see the landing page
3. Try logging in as admin
4. Upload a test DPR

✅ **Frontend is live!**

---

## 🎉 Deployment Complete!

Your app is now live at:

- **Frontend**: https://tender-evaluator.vercel.app
- **Backend API**: https://tender-evaluator-backend.onrender.com
- **Database**: Supabase (managed)

**Total time**: ~20 minutes
**Total cost**: $0/month

---

## 🔄 Auto-Deployments

### How It Works

**Every time you push to `main` branch:**

1. **Vercel** automatically:
   - Detects changes in `frontend/`
   - Builds React app
   - Deploys to production
   - Takes 2-3 minutes

2. **Render** automatically:
   - Detects changes in `backend/`
   - Builds Docker image
   - Deploys new container
   - Takes 5-8 minutes

**No GitHub Actions needed!** Platforms handle everything.

### Preview Deployments

**Every Pull Request automatically gets:**
- Preview URL from Vercel
- Test your changes before merging
- Perfect for team collaboration

---

## 🔧 Post-Deployment Configuration

### Add Custom Domain (Optional)

#### For Frontend (Vercel)

1. Go to Vercel dashboard → Your project
2. Settings → Domains
3. Add your domain (e.g., `app.tenderevaluator.com`)
4. Follow DNS instructions
5. Vercel auto-provisions SSL certificate

#### For Backend (Render)

1. Go to Render dashboard → Your service
2. Settings → Custom Domain
3. Add your domain (e.g., `api.tenderevaluator.com`)
4. Update DNS records
5. Render auto-provisions SSL certificate

### Update CORS After Custom Domain

If you add custom domains, update CORS in `backend/app.py`:

```python
allow_origins=[
    "http://localhost:5000",
    "https://tender-evaluator.vercel.app",
    "https://app.tenderevaluator.com",  # Your custom domain
],
```

---

## 📊 Monitoring Your App

### Vercel Dashboard

- **Analytics**: Page views, performance
- **Logs**: Real-time deployment logs
- **Deployments**: History of all deployments

### Render Dashboard

- **Metrics**: CPU, Memory, Request count
- **Logs**: Real-time application logs
- **Events**: Deployment history

### Supabase Dashboard

- **Database**: Table browser, SQL editor
- **Logs**: Query logs, error logs
- **Usage**: Storage, bandwidth usage

---

## 🐛 Troubleshooting

### Backend Not Starting

**Check Render logs:**
1. Go to Render dashboard → Your service
2. Click "Logs" tab
3. Look for errors

**Common issues:**
- Missing environment variables
- Database connection failed
- Port not set to 8000

**Solution:**
1. Verify all environment variables are set
2. Test database connection string
3. Check Dockerfile exposes port 8000

### Frontend Can't Connect to Backend

**Check browser console for CORS errors**

**Solution:**
1. Verify `VITE_API_URL` in Vercel environment variables
2. Check CORS settings in backend include Vercel URL
3. Test backend health: `curl https://your-backend.onrender.com/health`

### Backend Spinning Down (Free Tier)

**This is expected behavior on Render free tier**
- Spins down after 15 min inactivity
- First request takes ~30s to wake up

**Solutions:**
1. **Upgrade to Render Starter** ($7/month) - Always on
2. **Switch to Railway** - No spin-down with free credit
3. **Keep-alive service** - Ping every 10 minutes (not recommended)

### Database Connection Refused

**Check connection string format**

**Solution:**
1. Verify host, port, database, user, password
2. Check Supabase project is active
3. Test with psql:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   ```

---

## 💰 Cost Management

### Current Setup (Free Tier)

| Service | Free Tier Limits | Current Usage | Status |
|---------|------------------|---------------|--------|
| **Vercel** | 100 GB bandwidth/month | ~1-5 GB | ✅ Safe |
| **Render** | 750 hours/month | ~720 hours | ✅ Safe |
| **Supabase** | 500 MB database | ~50-100 MB | ✅ Safe |
| **Cloudinary** | 25 GB storage | ~5-10 GB | ✅ Safe |

### When to Upgrade

**Upgrade Backend ($7/month) when:**
- Spin-down causing UX issues
- Need consistent response times
- More than 50 daily active users

**Upgrade Database ($25/month) when:**
- Approaching 500 MB storage
- Need daily backups
- More than 100 concurrent connections

**Upgrade Frontend ($20/month) when:**
- Exceeding 100 GB bandwidth
- Need advanced analytics
- Custom team features

### Estimated Costs at Scale

| Users | Frontend | Backend | Database | Total |
|-------|----------|---------|----------|-------|
| **0-100** | $0 | $0 | $0 | **$0** |
| **100-500** | $0 | $7 | $0 | **$7/month** |
| **500-2000** | $0 | $7 | $25 | **$32/month** |
| **2000+** | $20 | $25 | $25 | **$70/month** |

Still **much cheaper** than AWS ($240-470/month)!

---

## 🚀 Scaling Up

### Performance Optimization

**Backend:**
1. Upgrade to Render Starter ($7/month) - Always on
2. Enable connection pooling in Supabase
3. Add caching for frequent queries
4. Optimize database indexes

**Frontend:**
1. Implement code splitting
2. Lazy load components
3. Optimize images
4. Use Vercel Analytics to find bottlenecks

**Database:**
1. Add indexes on frequently queried columns
2. Optimize slow queries
3. Archive old data
4. Consider read replicas (Pro tier)

### Horizontal Scaling

**When you outgrow free tiers:**

1. **Backend**: Render Standard ($25/month)
   - 2 GB RAM, 1 CPU
   - Auto-scaling available
   - Better performance

2. **Database**: Supabase Pro ($25/month)
   - 8 GB storage
   - Daily backups
   - Point-in-time recovery

3. **Frontend**: Vercel Pro ($20/month)
   - Unlimited bandwidth
   - Advanced analytics
   - Team collaboration

---

## 📚 Next Steps

### Immediate

- [x] Deploy database ✅
- [x] Deploy backend ✅
- [x] Deploy frontend ✅
- [ ] Test all features
- [ ] Add custom domain (optional)

### This Week

- [ ] Set up monitoring alerts
- [ ] Add error tracking (Sentry)
- [ ] Implement analytics
- [ ] Create backup strategy
- [ ] Document API endpoints

### This Month

- [ ] Load testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] User feedback collection
- [ ] Plan for scaling

---

## 🆘 Getting Help

### Platform Support

- **Vercel**: https://vercel.com/support
- **Render**: https://render.com/docs
- **Supabase**: https://supabase.com/docs

### Community

- **Vercel Discord**: https://vercel.com/discord
- **Render Community**: https://community.render.com
- **Supabase Discord**: https://discord.supabase.com

### Documentation

- Review `DEPLOYMENT_STRATEGY.md` for architecture details
- Check platform docs for advanced features
- Join community forums for help

---

## ✅ Success Checklist

- [ ] Database deployed and accessible
- [ ] Backend deployed and health check passing
- [ ] Frontend deployed and loading
- [ ] Can create admin account
- [ ] Can upload DPR
- [ ] Can view analysis
- [ ] API calls working
- [ ] No CORS errors
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up

---

## 🎯 Summary

### What You Achieved

✅ **Production deployment** in 20 minutes
✅ **$0/month cost** (free tiers)
✅ **Auto-deployments** on git push
✅ **Global CDN** for frontend
✅ **Managed database** with backups
✅ **SSL certificates** automatic
✅ **Zero infrastructure** management

### vs Traditional Deployment

| Aspect | PaaS (This Guide) | AWS/Traditional |
|--------|-------------------|-----------------|
| **Setup Time** | 20 minutes | 2-3 days |
| **Cost** | $0-7/month | $240-470/month |
| **Configuration** | Zero | Complex |
| **Maintenance** | Minimal | High |
| **Scaling** | One-click | Manual |

---

**Congratulations! Your app is live! 🎉**

**Questions? Check DEPLOYMENT_STRATEGY.md for more details!**
