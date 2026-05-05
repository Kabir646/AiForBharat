#!/bin/bash

# ============================================
# AWS Infrastructure Setup Script
# Tender Evaluator Production Deployment
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="ap-south-1"
PROJECT_NAME="tender-evaluator"
ENVIRONMENT="prod"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AWS Infrastructure Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials configured${NC}"
echo ""

# ============================================
# 1. Create VPC and Networking
# ============================================
echo -e "${YELLOW}📡 Setting up VPC and networking...${NC}"

VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=${PROJECT_NAME}-${ENVIRONMENT}-vpc}]" \
    --region $AWS_REGION \
    --query 'Vpc.VpcId' \
    --output text)

echo "VPC created: $VPC_ID"

# Enable DNS hostnames
aws ec2 modify-vpc-attribute \
    --vpc-id $VPC_ID \
    --enable-dns-hostnames \
    --region $AWS_REGION

# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=${PROJECT_NAME}-${ENVIRONMENT}-igw}]" \
    --region $AWS_REGION \
    --query 'InternetGateway.InternetGatewayId' \
    --output text)

echo "Internet Gateway created: $IGW_ID"

# Attach IGW to VPC
aws ec2 attach-internet-gateway \
    --vpc-id $VPC_ID \
    --internet-gateway-id $IGW_ID \
    --region $AWS_REGION

# Create Public Subnets (for ALB)
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ${AWS_REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-${ENVIRONMENT}-public-1a}]" \
    --region $AWS_REGION \
    --query 'Subnet.SubnetId' \
    --output text)

PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone ${AWS_REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-${ENVIRONMENT}-public-1b}]" \
    --region $AWS_REGION \
    --query 'Subnet.SubnetId' \
    --output text)

echo "Public subnets created: $PUBLIC_SUBNET_1, $PUBLIC_SUBNET_2"

# Create Private Subnets (for ECS and RDS)
PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.10.0/24 \
    --availability-zone ${AWS_REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-${ENVIRONMENT}-private-1a}]" \
    --region $AWS_REGION \
    --query 'Subnet.SubnetId' \
    --output text)

PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.11.0/24 \
    --availability-zone ${AWS_REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-${ENVIRONMENT}-private-1b}]" \
    --region $AWS_REGION \
    --query 'Subnet.SubnetId' \
    --output text)

echo "Private subnets created: $PRIVATE_SUBNET_1, $PRIVATE_SUBNET_2"

# Create NAT Gateway (for private subnet internet access)
EIP_ALLOC_ID=$(aws ec2 allocate-address \
    --domain vpc \
    --region $AWS_REGION \
    --query 'AllocationId' \
    --output text)

NAT_GW_ID=$(aws ec2 create-nat-gateway \
    --subnet-id $PUBLIC_SUBNET_1 \
    --allocation-id $EIP_ALLOC_ID \
    --tag-specifications "ResourceType=natgateway,Tags=[{Key=Name,Value=${PROJECT_NAME}-${ENVIRONMENT}-nat}]" \
    --region $AWS_REGION \
    --query 'NatGateway.NatGatewayId' \
    --output text)

echo "NAT Gateway created: $NAT_GW_ID (waiting for availability...)"
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_GW_ID --region $AWS_REGION

# Create Route Tables
PUBLIC_RT=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${PROJECT_NAME}-${ENVIRONMENT}-public-rt}]" \
    --region $AWS_REGION \
    --query 'RouteTable.RouteTableId' \
    --output text)

PRIVATE_RT=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${PROJECT_NAME}-${ENVIRONMENT}-private-rt}]" \
    --region $AWS_REGION \
    --query 'RouteTable.RouteTableId' \
    --output text)

# Add routes
aws ec2 create-route \
    --route-table-id $PUBLIC_RT \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID \
    --region $AWS_REGION

aws ec2 create-route \
    --route-table-id $PRIVATE_RT \
    --destination-cidr-block 0.0.0.0/0 \
    --nat-gateway-id $NAT_GW_ID \
    --region $AWS_REGION

# Associate subnets with route tables
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_1 --route-table-id $PUBLIC_RT --region $AWS_REGION
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_2 --route-table-id $PUBLIC_RT --region $AWS_REGION
aws ec2 associate-route-table --subnet-id $PRIVATE_SUBNET_1 --route-table-id $PRIVATE_RT --region $AWS_REGION
aws ec2 associate-route-table --subnet-id $PRIVATE_SUBNET_2 --route-table-id $PRIVATE_RT --region $AWS_REGION

echo -e "${GREEN}✅ VPC and networking setup complete${NC}"
echo ""

# ============================================
# 2. Create Security Groups
# ============================================
echo -e "${YELLOW}🔒 Creating security groups...${NC}"

# ALB Security Group
ALB_SG=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-${ENVIRONMENT}-alb-sg" \
    --description "Security group for ALB" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION

aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION

echo "ALB Security Group created: $ALB_SG"

# ECS Security Group
ECS_SG=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-${ENVIRONMENT}-ecs-sg" \
    --description "Security group for ECS tasks" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $ECS_SG \
    --protocol tcp \
    --port 8000 \
    --source-group $ALB_SG \
    --region $AWS_REGION

echo "ECS Security Group created: $ECS_SG"

# RDS Security Group
RDS_SG=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-${ENVIRONMENT}-rds-sg" \
    --description "Security group for RDS" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $RDS_SG \
    --protocol tcp \
    --port 5432 \
    --source-group $ECS_SG \
    --region $AWS_REGION

echo "RDS Security Group created: $RDS_SG"

echo -e "${GREEN}✅ Security groups created${NC}"
echo ""

# ============================================
# 3. Create RDS Database
# ============================================
echo -e "${YELLOW}🗄️  Creating RDS PostgreSQL database...${NC}"

# Create DB Subnet Group
aws rds create-db-subnet-group \
    --db-subnet-group-name "${PROJECT_NAME}-${ENVIRONMENT}-db-subnet" \
    --db-subnet-group-description "Subnet group for RDS" \
    --subnet-ids $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2 \
    --region $AWS_REGION

# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier "${PROJECT_NAME}-${ENVIRONMENT}-db" \
    --db-instance-class db.t3.medium \
    --engine postgres \
    --engine-version 14.7 \
    --master-username postgres \
    --master-user-password "CHANGE_ME_AFTER_CREATION" \
    --allocated-storage 100 \
    --storage-type gp3 \
    --db-subnet-group-name "${PROJECT_NAME}-${ENVIRONMENT}-db-subnet" \
    --vpc-security-group-ids $RDS_SG \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted \
    --region $AWS_REGION

echo "RDS instance creation initiated (this takes 10-15 minutes)"
echo -e "${YELLOW}⚠️  IMPORTANT: Change the database password after creation!${NC}"
echo ""

# ============================================
# 4. Create ECR Repository
# ============================================
echo -e "${YELLOW}📦 Creating ECR repository...${NC}"

aws ecr create-repository \
    --repository-name "${PROJECT_NAME}-backend" \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true

echo -e "${GREEN}✅ ECR repository created${NC}"
echo ""

# ============================================
# 5. Create ECS Cluster
# ============================================
echo -e "${YELLOW}🚀 Creating ECS cluster...${NC}"

aws ecs create-cluster \
    --cluster-name "${PROJECT_NAME}-${ENVIRONMENT}" \
    --region $AWS_REGION \
    --capacity-providers FARGATE FARGATE_SPOT \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1

echo -e "${GREEN}✅ ECS cluster created${NC}"
echo ""

# ============================================
# 6. Create S3 Bucket for Frontend
# ============================================
echo -e "${YELLOW}🪣 Creating S3 bucket for frontend...${NC}"

aws s3api create-bucket \
    --bucket "${PROJECT_NAME}-frontend-${ENVIRONMENT}" \
    --region $AWS_REGION \
    --create-bucket-configuration LocationConstraint=$AWS_REGION

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket "${PROJECT_NAME}-frontend-${ENVIRONMENT}" \
    --versioning-configuration Status=Enabled \
    --region $AWS_REGION

# Block public access (CloudFront will access via OAI)
aws s3api put-public-access-block \
    --bucket "${PROJECT_NAME}-frontend-${ENVIRONMENT}" \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    --region $AWS_REGION

echo -e "${GREEN}✅ S3 bucket created${NC}"
echo ""

# ============================================
# Summary
# ============================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Infrastructure Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📝 Resource IDs (save these):"
echo "----------------------------"
echo "VPC ID: $VPC_ID"
echo "Public Subnets: $PUBLIC_SUBNET_1, $PUBLIC_SUBNET_2"
echo "Private Subnets: $PRIVATE_SUBNET_1, $PRIVATE_SUBNET_2"
echo "ALB Security Group: $ALB_SG"
echo "ECS Security Group: $ECS_SG"
echo "RDS Security Group: $RDS_SG"
echo "NAT Gateway: $NAT_GW_ID"
echo ""
echo "🔄 Next Steps:"
echo "1. Wait for RDS instance to be available (~15 minutes)"
echo "2. Change RDS master password"
echo "3. Create ALB and target groups"
echo "4. Create ECS task definition and service"
echo "5. Set up CloudFront distribution"
echo "6. Configure GitHub Actions secrets"
echo ""
echo -e "${YELLOW}⚠️  Remember to update your .env file with the new resource IDs${NC}"
