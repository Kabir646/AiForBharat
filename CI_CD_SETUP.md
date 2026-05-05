# CI/CD Pipeline Setup Guide

This guide will help you set up automated testing and deployment for every commit.

## 🎯 What This CI/CD Pipeline Does

### On Every Commit (Push/PR):
1. **Frontend Tests**
   - TypeScript type checking
   - ESLint code quality checks
   - Build verification
   
2. **Backend Tests**
   - Python linting (flake8)
   - Unit tests with pytest
   - Database integration tests

### On Main Branch Push (After Tests Pass):
3. **Automatic Deployment**
   - Frontend → Vercel
   - Backend → Render

## 📋 Prerequisites

You need accounts on:
- ✅ GitHub (you already have this)
- ✅ Vercel (for frontend)
- ✅ Render (for backend)

## 🔧 Setup Instructions

### Step 1: Get Vercel Credentials

1. Go to https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name it: `GitHub Actions CI/CD`
4. Copy the token (save it for Step 4)

5. Get your Vercel Org ID:
   - Go to https://vercel.com/account
   - Copy your **Team ID** or **User ID**

6. Get your Vercel Project ID:
   - Go to your project settings: https://vercel.com/[username]/[project]/settings
   - Copy the **Project ID**

### Step 2: Get Render Deploy Hook

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your backend service
3. Go to **Settings** tab
4. Scroll to **Deploy Hook**
5. Click **"Create Deploy Hook"**
6. Copy the webhook URL (looks like: `https://api.render.com/deploy/srv-xxxxx?key=xxxxx`)

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/Kabir646/AiForBharat
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add these secrets:

| Secret Name | Value | Where to Get It |
|-------------|-------|-----------------|
| `VERCEL_TOKEN` | Your Vercel token | Step 1 |
| `VERCEL_ORG_ID` | Your Vercel org/user ID | Step 1 |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Step 1 |
| `RENDER_DEPLOY_HOOK` | Your Render deploy hook URL | Step 2 |

### Step 4: Enable GitHub Actions

1. Go to your repository: https://github.com/Kabir646/AiForBharat
2. Click **Actions** tab
3. If prompted, click **"I understand my workflows, go ahead and enable them"**

### Step 5: Test the Pipeline

1. Make a small change to any file (e.g., update README.md)
2. Commit and push:
   ```bash
   git add .
   git commit -m "test: Trigger CI/CD pipeline"
   git push origin main
   ```
3. Go to **Actions** tab on GitHub to watch the pipeline run

## 📊 Pipeline Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  Push to GitHub (main branch)                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│ Frontend Test │           │ Backend Test  │
├───────────────┤           ├───────────────┤
│ • Type Check  │           │ • Linting     │
│ • ESLint      │           │ • Unit Tests  │
│ • Build       │           │ • DB Tests    │
└───────┬───────┘           └───────┬───────┘
        │                           │
        └─────────────┬─────────────┘
                      │
              ✅ Tests Pass?
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│ Deploy        │           │ Deploy        │
│ Frontend      │           │ Backend       │
│ (Vercel)      │           │ (Render)      │
└───────────────┘           └───────────────┘
        │                           │
        └─────────────┬─────────────┘
                      │
                      ▼
              🎉 Deployment Complete!
```

## 🧪 Running Tests Locally

### Frontend Tests
```bash
cd frontend

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### Backend Tests
```bash
cd backend

# Install test dependencies
pip install pytest pytest-asyncio httpx flake8

# Run linting
flake8 . --max-line-length=127

# Run tests
pytest -v
```

## 📝 Adding More Tests

### Frontend Tests (Future)
To add proper unit tests, install testing libraries:
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Then update `package.json`:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

### Backend Tests
Add more test files in `backend/` directory:
```python
# backend/test_dprs.py
def test_dpr_upload():
    # Your test here
    pass

def test_dpr_analysis():
    # Your test here
    pass
```

## 🔍 Monitoring Deployments

### View Pipeline Status
- GitHub Actions: https://github.com/Kabir646/AiForBharat/actions
- See real-time logs for each step
- Get email notifications on failures

### View Deployments
- **Frontend**: Vercel dashboard → Deployments
- **Backend**: Render dashboard → Events

## ⚠️ Troubleshooting

### Pipeline Fails on Tests
- Check the **Actions** tab for detailed error logs
- Fix the errors locally first
- Test locally before pushing

### Deployment Fails
- Verify all GitHub secrets are set correctly
- Check Vercel/Render dashboards for deployment logs
- Ensure environment variables are set on both platforms

### Tests Pass but Deployment Skipped
- Deployment only runs on `main` branch
- Check if you're pushing to a different branch
- PRs will run tests but not deploy

## 🚀 Best Practices

1. **Always test locally first**
   ```bash
   npm run build  # Frontend
   pytest         # Backend
   ```

2. **Use feature branches**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Create PR on GitHub
   ```

3. **Review test results before merging**
   - PRs will show test status
   - Only merge when tests pass ✅

4. **Monitor deployments**
   - Check Vercel/Render dashboards after merge
   - Verify the app works after deployment

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [pytest Documentation](https://docs.pytest.org/)

## 🎯 Next Steps

After setup is complete:
1. ✅ All tests run automatically on every commit
2. ✅ Deployments happen automatically on main branch
3. ✅ You get notified of any failures
4. ✅ Your app is always up-to-date with the latest code

No more manual deployments needed! 🎉
