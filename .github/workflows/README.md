# GitHub Actions Workflows

This directory contains automated deployment workflows for the Tender Evaluator application.

## Available Workflows

### 1. `deploy-frontend.yml`
Deploys the React frontend to S3 and CloudFront.

**Triggers:**
- Push to `main` branch with changes in `frontend/` directory
- Manual trigger via workflow_dispatch

**Steps:**
1. Checkout code
2. Setup Node.js and install dependencies
3. Build frontend with production API URL
4. Sync static assets to S3 (with 1-year cache)
5. Upload index.html (with no-cache)
6. Invalidate CloudFront cache

**Required Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_DISTRIBUTION_ID`

**Duration:** ~3-5 minutes

---

### 2. `deploy-backend.yml`
Builds Docker image and deploys to ECS Fargate.

**Triggers:**
- Push to `main` branch with changes in `backend/` directory
- Manual trigger via workflow_dispatch

**Steps:**
1. Checkout code
2. Configure AWS credentials
3. Login to Amazon ECR
4. Build and push Docker image
5. Update ECS task definition
6. Deploy to ECS with zero-downtime
7. Wait for service stability

**Required Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**Duration:** ~8-12 minutes

---

### 3. `db-migrate.yml`
Runs database migrations safely.

**Triggers:**
- Manual trigger only (workflow_dispatch)

**Inputs:**
- `migration_file`: Path to SQL migration file

**Steps:**
1. Checkout code
2. Install PostgreSQL client
3. Run migration script
4. Verify migration success

**Required Secrets:**
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

**Duration:** ~1-2 minutes

---

## Setup Instructions

### 1. Configure GitHub Secrets

Go to: Repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

#### AWS Credentials
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
CLOUDFRONT_DISTRIBUTION_ID=E...
```

#### Database Credentials
```
DB_HOST=tender-evaluator-prod.xxxxx.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=dpr_analyzer
DB_USER=postgres
DB_PASSWORD=...
```

#### API Keys
```
GEMINI_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

#### Admin Credentials
```
ADMIN_ID=admin123
ADMIN_PASSWORD=...
```

### 2. Update Workflow Configuration

Edit the workflows to match your AWS resources:

**deploy-frontend.yml:**
```yaml
env:
  AWS_REGION: ap-south-1  # Your AWS region
  S3_BUCKET: tender-evaluator-frontend-prod  # Your S3 bucket name
```

**deploy-backend.yml:**
```yaml
env:
  AWS_REGION: ap-south-1  # Your AWS region
  ECR_REPOSITORY: tender-evaluator-backend  # Your ECR repository
  ECS_CLUSTER: tender-evaluator-prod  # Your ECS cluster
  ECS_SERVICE: tender-evaluator-backend  # Your ECS service
```

### 3. Test Workflows

#### Test Frontend Deployment
```bash
# Make a small change to frontend
echo "// Test deployment" >> frontend/src/App.tsx

# Commit and push
git add frontend/src/App.tsx
git commit -m "test: frontend deployment"
git push origin main

# Monitor in GitHub Actions tab
```

#### Test Backend Deployment
```bash
# Make a small change to backend
echo "# Test deployment" >> backend/app.py

# Commit and push
git add backend/app.py
git commit -m "test: backend deployment"
git push origin main

# Monitor in GitHub Actions tab
```

#### Test Manual Trigger
1. Go to Actions tab in GitHub
2. Select "Deploy Frontend to S3/CloudFront"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

---

## Deployment Process

### Automatic Deployment (Recommended)

1. **Develop locally** on a feature branch
2. **Test thoroughly** using `scripts/local-test.sh`
3. **Create Pull Request** to `main` branch
4. **Review and approve** PR
5. **Merge to main** - deployment starts automatically
6. **Monitor** in GitHub Actions tab
7. **Verify** deployment at production URLs

### Manual Deployment (Emergency)

If GitHub Actions is unavailable, use manual scripts:

```bash
# Deploy backend manually
./scripts/deploy-manual.sh
# Select option 1 (Backend only)

# Deploy frontend manually
./scripts/deploy-manual.sh
# Select option 2 (Frontend only)
```

---

## Monitoring Deployments

### View Workflow Runs

1. Go to repository → Actions tab
2. Click on a workflow run
3. View logs for each step
4. Check deployment summary

### View Deployment Status

**Frontend:**
```bash
# Check S3 sync
aws s3 ls s3://tender-evaluator-frontend-prod/

# Check CloudFront invalidation
aws cloudfront list-invalidations --distribution-id <DIST_ID>
```

**Backend:**
```bash
# Check ECS service
aws ecs describe-services \
  --cluster tender-evaluator-prod \
  --services tender-evaluator-backend

# Check running tasks
aws ecs list-tasks --cluster tender-evaluator-prod

# View logs
aws logs tail /ecs/tender-evaluator-backend --follow
```

---

## Rollback Procedures

### Rollback Frontend

```bash
# Option 1: Revert commit and push
git revert <commit-hash>
git push origin main
# Workflow will auto-deploy previous version

# Option 2: Manual rollback
aws s3 sync s3://tender-evaluator-frontend-prod-backup/v1.2.3/ \
  s3://tender-evaluator-frontend-prod/
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```

### Rollback Backend

```bash
# Option 1: Revert commit and push
git revert <commit-hash>
git push origin main
# Workflow will auto-deploy previous version

# Option 2: Manual rollback to previous task definition
aws ecs update-service \
  --cluster tender-evaluator-prod \
  --service tender-evaluator-backend \
  --task-definition tender-evaluator-backend:42  # Previous revision
```

---

## Troubleshooting

### Workflow Fails at "Build Frontend"

**Cause:** npm dependencies issue or build error

**Solution:**
```bash
# Test locally
cd frontend
npm ci
npm run build

# Fix any errors, commit, and push
```

### Workflow Fails at "Push to ECR"

**Cause:** ECR authentication or permissions issue

**Solution:**
1. Check AWS credentials in GitHub Secrets
2. Verify ECR repository exists
3. Check IAM permissions for ECR push

### Workflow Fails at "Deploy to ECS"

**Cause:** ECS service or task definition issue

**Solution:**
```bash
# Check ECS service status
aws ecs describe-services \
  --cluster tender-evaluator-prod \
  --services tender-evaluator-backend

# Check task failures
aws ecs describe-tasks \
  --cluster tender-evaluator-prod \
  --tasks <TASK_ID>

# View logs
aws logs tail /ecs/tender-evaluator-backend --follow
```

### CloudFront Invalidation Takes Too Long

**Cause:** CloudFront invalidation can take 5-15 minutes

**Solution:**
- This is normal behavior
- Workflow waits for completion
- Users may see cached content briefly

---

## Best Practices

### 1. Branch Protection

Set up branch protection rules for `main`:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

### 2. Deployment Windows

Schedule deployments during low-traffic periods:
- Avoid peak hours (9 AM - 5 PM IST)
- Prefer late evening or early morning
- Notify users of maintenance windows

### 3. Testing Before Merge

Always test locally before merging:
```bash
# Run local tests
./scripts/local-test.sh

# Test backend
curl http://localhost:8000/health
curl http://localhost:8000/projects

# Test frontend
# Open http://localhost:5000 in browser
```

### 4. Monitoring After Deployment

After each deployment:
1. Check health endpoint: `curl https://api.tenderevaluator.gov.in/health`
2. Test critical user flows
3. Monitor CloudWatch logs for errors
4. Check CloudWatch metrics for anomalies

### 5. Rollback Readiness

Always be ready to rollback:
- Keep previous Docker images in ECR
- Keep previous S3 versions enabled
- Document rollback procedures
- Test rollback process regularly

---

## Security Considerations

### Secrets Management

- **Never commit secrets** to repository
- **Rotate secrets** regularly (every 90 days)
- **Use AWS Secrets Manager** for production secrets
- **Audit secret access** via CloudTrail

### IAM Permissions

GitHub Actions IAM user should have minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::tender-evaluator-frontend-prod",
        "arn:aws:s3:::tender-evaluator-frontend-prod/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Cost Optimization

### Workflow Optimization

- **Cache dependencies** (already implemented)
- **Run workflows only on relevant changes** (already implemented)
- **Use workflow concurrency** to cancel outdated runs

### AWS Resource Optimization

- **Use Fargate Spot** for non-critical tasks
- **Enable S3 Intelligent-Tiering**
- **Set CloudFront cache TTL** appropriately
- **Use ECR lifecycle policies** to delete old images

---

## Support

For workflow issues:
1. Check workflow logs in GitHub Actions
2. Review AWS CloudWatch logs
3. Consult DEPLOYMENT_STRATEGY.md
4. Contact DevOps team

---

**Happy Deploying! 🚀**
