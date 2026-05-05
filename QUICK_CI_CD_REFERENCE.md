# Quick CI/CD Reference

## 🚀 One-Time Setup (5 minutes)

### 1. Get Vercel Credentials
```
Vercel Token: https://vercel.com/account/tokens
Vercel Org ID: https://vercel.com/account (Team/User ID)
Vercel Project ID: Project Settings → General
```

### 2. Get Render Deploy Hook
```
Render Dashboard → Your Service → Settings → Deploy Hook
```

### 3. Add to GitHub Secrets
```
Repository → Settings → Secrets and variables → Actions → New secret

Add these 4 secrets:
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
- RENDER_DEPLOY_HOOK
```

## ✅ That's It!

Now every time you push to `main`:
1. ✅ Tests run automatically
2. ✅ If tests pass → Auto-deploy to Vercel + Render
3. ✅ If tests fail → No deployment (you get notified)

## 📊 What Gets Tested

### Frontend
- TypeScript compilation
- ESLint code quality
- Build success

### Backend
- Python linting
- Unit tests
- API endpoint tests

## 🔍 View Results

- **Pipeline Status**: https://github.com/Kabir646/AiForBharat/actions
- **Frontend Deploys**: https://vercel.com/dashboard
- **Backend Deploys**: https://dashboard.render.com/

## 🧪 Test Locally Before Pushing

```bash
# Frontend
cd frontend
npm run type-check
npm run lint
npm run build

# Backend
cd backend
pip install pytest pytest-asyncio httpx
pytest -v
```

## 🌿 Recommended Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and test locally
npm run build  # or pytest

# 3. Commit and push
git add .
git commit -m "feat: Add new feature"
git push origin feature/my-feature

# 4. Create Pull Request on GitHub
# Tests will run automatically

# 5. After tests pass, merge to main
# Deployment happens automatically
```

## 🎯 Benefits

✅ No manual deployments  
✅ Catch bugs before production  
✅ Consistent code quality  
✅ Automatic rollback if tests fail  
✅ Full deployment history  

## 📝 Files Created

- `.github/workflows/ci-cd-pipeline.yml` - Main CI/CD workflow
- `backend/test_app.py` - Backend tests
- `backend/pytest.ini` - Pytest configuration
- `frontend/.eslintrc.json` - ESLint configuration
- `CI_CD_SETUP.md` - Detailed setup guide
- `QUICK_CI_CD_REFERENCE.md` - This file
