#!/bin/bash

# ============================================
# Manual Deployment Script
# For deploying without GitHub Actions
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
AWS_REGION="ap-south-1"
ECR_REPOSITORY="tender-evaluator-backend"
ECS_CLUSTER="tender-evaluator-prod"
ECS_SERVICE="tender-evaluator-backend"
S3_BUCKET="tender-evaluator-frontend-prod"
CLOUDFRONT_DIST_ID=""  # Set this after CloudFront creation

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Manual Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found${NC}"
    exit 1
fi

# Check credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"
echo ""

# Menu
echo "What would you like to deploy?"
echo "1) Backend only"
echo "2) Frontend only"
echo "3) Both backend and frontend"
read -p "Enter choice [1-3]: " choice

case $choice in
    1|3)
        # ============================================
        # Deploy Backend
        # ============================================
        echo ""
        echo -e "${YELLOW}🚀 Deploying Backend...${NC}"
        
        # Get ECR login
        echo "Logging into ECR..."
        aws ecr get-login-password --region $AWS_REGION | \
            docker login --username AWS --password-stdin \
            $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
        
        # Build image
        echo "Building Docker image..."
        IMAGE_TAG=$(git rev-parse --short HEAD)
        ECR_REGISTRY=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
        
        docker build -f backend/Dockerfile -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
        
        # Push to ECR
        echo "Pushing to ECR..."
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
        
        # Update ECS service
        echo "Updating ECS service..."
        aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --force-new-deployment \
            --region $AWS_REGION
        
        echo -e "${GREEN}✅ Backend deployment initiated${NC}"
        echo "Monitor deployment: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION"
        ;;
esac

case $choice in
    2|3)
        # ============================================
        # Deploy Frontend
        # ============================================
        echo ""
        echo -e "${YELLOW}🚀 Deploying Frontend...${NC}"
        
        # Build frontend
        echo "Building frontend..."
        cd frontend
        npm ci
        npm run build
        cd ..
        
        # Sync to S3
        echo "Syncing to S3..."
        aws s3 sync frontend/dist/ s3://$S3_BUCKET \
            --delete \
            --cache-control "public, max-age=31536000, immutable" \
            --exclude "index.html" \
            --region $AWS_REGION
        
        # Upload index.html with no-cache
        aws s3 cp frontend/dist/index.html s3://$S3_BUCKET/index.html \
            --cache-control "no-cache, no-store, must-revalidate" \
            --region $AWS_REGION
        
        # Invalidate CloudFront
        if [ -n "$CLOUDFRONT_DIST_ID" ]; then
            echo "Invalidating CloudFront cache..."
            aws cloudfront create-invalidation \
                --distribution-id $CLOUDFRONT_DIST_ID \
                --paths "/*"
            
            echo -e "${GREEN}✅ Frontend deployed and cache invalidated${NC}"
        else
            echo -e "${YELLOW}⚠️  CloudFront distribution ID not set. Skipping cache invalidation.${NC}"
            echo -e "${GREEN}✅ Frontend deployed to S3${NC}"
        fi
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
