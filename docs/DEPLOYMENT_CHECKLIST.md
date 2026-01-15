# Casey Dean Portfolio - AWS Amplify Deployment Guide

**Author:** Casey Dean  
**Last Updated:** January 2026  
**Version:** 1.0

This document provides a comprehensive pre-deployment checklist and step-by-step instructions for deploying the Casey Dean Portfolio to AWS Amplify. The application is fully AWS-independent with no external OAuth dependencies.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Complete each item before running `terraform apply`. Check off items as you complete them.

### 1. AWS Account Setup

| Task | Status | Notes |
|------|--------|-------|
| AWS account created and verified | ☐ | Must have payment method on file |
| IAM user with AdministratorAccess (or specific permissions below) | ☐ | For Terraform execution |
| AWS CLI configured with credentials | ☐ | Run `aws configure` |
| Verify correct AWS region selected | ☐ | Default: us-east-1 |

**Required IAM Permissions:**
- `amplify:*` - Amplify app management
- `rds:*` - Database creation and management
- `s3:*` - Bucket creation and file storage
- `iam:*` - Role and policy creation
- `ec2:*` - VPC and security group creation
- `secretsmanager:*` - (Optional) For secret rotation

### 2. GitHub Configuration

| Task | Status | Notes |
|------|--------|-------|
| Repository pushed to GitHub | ☐ | Must be on `main` branch |
| Personal Access Token created | ☐ | Needs `repo` scope |
| Token saved securely | ☐ | Never commit to code |

**Creating a GitHub Personal Access Token:**

1. Navigate to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Set expiration (recommend 90 days for security)
4. Select scope: `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy immediately** - you cannot view it again

### 3. Secrets Preparation

Generate and securely store these values before deployment:

| Secret | How to Generate | Minimum Length | Status |
|--------|-----------------|----------------|--------|
| `db_password` | `openssl rand -base64 24` | 8 characters | ☐ |
| `jwt_secret` | `openssl rand -hex 32` | 32 characters | ☐ |
| `admin_password` | Your choice or `openssl rand -base64 16` | 8 characters | ☐ |
| `github_access_token` | GitHub UI (see above) | N/A | ☐ |
| `openai_api_key` | [OpenAI Platform](https://platform.openai.com/api-keys) | Starts with `sk-` | ☐ |

**Security Best Practices:**
- Store secrets in a password manager (1Password, Bitwarden, AWS Secrets Manager)
- Never commit secrets to version control
- Use different passwords for each environment (dev, staging, prod)
- Set calendar reminders to rotate secrets every 90 days

### 4. Local Environment Verification

| Task | Status | Command to Verify |
|------|--------|-------------------|
| Node.js 22+ installed | ☐ | `node --version` |
| pnpm installed | ☐ | `pnpm --version` |
| Terraform 1.5+ installed | ☐ | `terraform --version` |
| AWS CLI installed | ☐ | `aws --version` |
| Git installed | ☐ | `git --version` |

### 5. Code Verification

| Task | Status | Command |
|------|--------|---------|
| All tests passing | ☐ | `pnpm test` |
| Production build succeeds | ☐ | `pnpm build` |
| No TypeScript errors | ☐ | `pnpm check` |
| Code pushed to GitHub | ☐ | `git push origin main` |

### 6. Terraform Configuration

| Task | Status | Notes |
|------|--------|-------|
| `terraform.tfvars` created from example | ☐ | `cp terraform.tfvars.example terraform.tfvars` |
| All `CHANGE_ME` values replaced | ☐ | Search for "CHANGE_ME" |
| AWS region confirmed | ☐ | Default: us-east-1 |
| GitHub repository path correct | ☐ | Format: `owner/repo` |

---

## Prerequisites

### Install Required Tools

**macOS (using Homebrew):**
```bash
# Install Terraform
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Install AWS CLI
brew install awscli

# Install Node.js
brew install node@22

# Install pnpm
npm install -g pnpm
```

**Linux (Ubuntu/Debian):**
```bash
# Install Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm
```

**Windows (using Chocolatey):**
```powershell
# Install Terraform
choco install terraform

# Install AWS CLI
choco install awscli

# Install Node.js
choco install nodejs

# Install pnpm
npm install -g pnpm
```

### Configure AWS CLI

```bash
aws configure
```

Enter when prompted:
- AWS Access Key ID: `[Your IAM user access key]`
- AWS Secret Access Key: `[Your IAM user secret key]`
- Default region name: `us-east-1`
- Default output format: `json`

Verify configuration:
```bash
aws sts get-caller-identity
```

---

## Step-by-Step Deployment

### Step 1: Clone and Prepare Repository

```bash
# Clone the repository (if not already done)
git clone https://github.com/caseyrdean/casey-dean-portfolio.git
cd casey-dean-portfolio

# Install dependencies
pnpm install

# Verify build works
pnpm build

# Run tests
pnpm test
```

### Step 2: Generate Secrets

Open a terminal and generate your secrets:

```bash
# Generate database password
echo "DB Password: $(openssl rand -base64 24)"

# Generate JWT secret
echo "JWT Secret: $(openssl rand -hex 32)"

# Generate admin password (or use your own)
echo "Admin Password: $(openssl rand -base64 16)"
```

**Save these values securely** - you'll need them in the next step.

### Step 3: Configure Terraform Variables

```bash
# Navigate to terraform directory
cd terraform

# Create your variables file
cp terraform.tfvars.example terraform.tfvars

# Edit the file
nano terraform.tfvars  # or use your preferred editor
```

Replace all `CHANGE_ME` values with your actual secrets:

```hcl
# terraform.tfvars

# AWS Configuration
aws_region   = "us-east-1"
project_name = "casey-dean-portfolio"
environment  = "prod"

# Database
db_password = "your-generated-database-password"

# GitHub
github_repository   = "caseyrdean/casey-dean-portfolio"
github_branch       = "main"
github_access_token = "ghp_your_github_token"

# Authentication
jwt_secret     = "your-generated-64-character-hex-string"
admin_password = "your-admin-password"

# Application
owner_name = "Casey Dean"
app_title  = "Casey Dean - AWS Solutions Architect"

# OpenAI
openai_api_key = "sk-your-openai-api-key"

# Domain (optional)
enable_custom_domain = false
custom_domain        = ""
```

### Step 4: Initialize Terraform

```bash
# Still in the terraform directory
terraform init
```

Expected output:
```
Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Finding hashicorp/random versions matching "~> 3.5"...
- Installing hashicorp/aws v5.x.x...
- Installing hashicorp/random v3.x.x...

Terraform has been successfully initialized!
```

### Step 5: Preview Infrastructure Changes

```bash
terraform plan
```

Review the output carefully. You should see resources being created:
- 1 VPC with subnets
- 1 RDS MySQL instance
- 1 S3 bucket
- 1 Amplify app
- IAM roles and policies
- Security groups

**Estimated resources:** ~15-20 AWS resources

### Step 6: Deploy Infrastructure

```bash
terraform apply
```

When prompted, type `yes` to confirm.

**Deployment time:** Approximately 10-15 minutes (RDS creation takes the longest)

### Step 7: Note the Outputs

After successful deployment, Terraform displays important information:

```
Outputs:

amplify_app_url = "https://main.d1234567890.amplifyapp.com"
database_endpoint = "casey-dean-portfolio-prod-db.xxxx.us-east-1.rds.amazonaws.com:3306"
s3_bucket = "casey-dean-portfolio-uploads-abc123"
```

**Save these values** - you'll need them for verification.

### Step 8: Trigger Initial Build

Push any change to trigger the first Amplify build:

```bash
cd ..  # Back to project root
git add .
git commit -m "Trigger initial Amplify build"
git push origin main
```

### Step 9: Monitor Build Progress

1. Open [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app (`casey-dean-portfolio`)
3. Click on the `main` branch
4. Watch the build progress

**Build stages:**
1. Provision - Setting up build environment
2. Build - Running `pnpm install` and `pnpm build`
3. Deploy - Uploading artifacts
4. Verify - Health checks

**Expected build time:** 3-5 minutes

---

## Post-Deployment Verification

### Verification Checklist

| Test | URL/Action | Expected Result | Status |
|------|------------|-----------------|--------|
| Homepage loads | `https://[your-amplify-url]/` | Portfolio homepage displays | ☐ |
| Navigation works | Click all nav links | All pages load correctly | ☐ |
| Blog page loads | `/blog` | Blog listing appears | ☐ |
| Projects display | `/` scroll to projects | Project cards visible | ☐ |
| Admin login page | `/admin/login` | Login form displays | ☐ |
| Admin authentication | Enter password | Redirects to admin dashboard | ☐ |
| Blog admin works | `/admin/blog` | Can create/edit posts | ☐ |
| The Oracle works | Click Oracle button | Chat interface opens | ☐ |
| Oracle responds | Ask a question | AI responds within 10s | ☐ |
| File uploads work | Upload image in blog admin | Image saves to S3 | ☐ |

### Test Admin Login

1. Navigate to `https://[your-amplify-url]/admin/login`
2. Enter your `admin_password`
3. Verify redirect to `/admin/blog`
4. Try creating a test blog post

### Test The Oracle

1. Click the Oracle button (bottom right)
2. Ask: "Who is Casey Dean?"
3. Verify response comes from knowledge base
4. Check response is under 200 tokens

### Verify Database Connection

Check Amplify logs for database connection:
1. AWS Amplify Console → Your App → Hosting → Build logs
2. Look for: `Database connection successful`

---

## Troubleshooting

### Common Issues and Solutions

**Issue: Terraform init fails with provider errors**
```bash
# Clear cache and reinitialize
rm -rf .terraform .terraform.lock.hcl
terraform init
```

**Issue: RDS creation fails with "DBSubnetGroupNotFoundFault"**
- Ensure VPC and subnets are created first
- Check `terraform plan` output for dependency order

**Issue: Amplify build fails with "pnpm not found"**
- Verify `amplify.yml` has corepack commands
- Check build logs for specific error

**Issue: Admin login returns "ADMIN_PASSWORD not set"**
- Verify environment variable is set in Amplify Console
- Redeploy after adding the variable

**Issue: The Oracle doesn't respond**
- Check `OPENAI_API_KEY` is set correctly
- Verify API key has available credits
- Check CloudWatch logs for errors

**Issue: S3 uploads fail**
- Verify IAM role has S3 permissions
- Check bucket CORS configuration
- Verify `AWS_S3_BUCKET` and `AWS_S3_REGION` are set

### Getting Help

1. **Check Amplify build logs:** AWS Console → Amplify → Your App → Build logs
2. **Check CloudWatch logs:** AWS Console → CloudWatch → Log groups → `/aws/amplify/...`
3. **Verify environment variables:** Amplify Console → Your App → Environment variables

---

## Quick Reference

### Important URLs

| Resource | URL |
|----------|-----|
| AWS Amplify Console | https://console.aws.amazon.com/amplify/ |
| AWS RDS Console | https://console.aws.amazon.com/rds/ |
| AWS S3 Console | https://console.aws.amazon.com/s3/ |
| GitHub Tokens | https://github.com/settings/tokens |
| OpenAI API Keys | https://platform.openai.com/api-keys |

### Key Commands

```bash
# Terraform
terraform init          # Initialize
terraform plan          # Preview changes
terraform apply         # Deploy
terraform destroy       # Remove all resources

# Application
pnpm install           # Install dependencies
pnpm build             # Production build
pnpm test              # Run tests
pnpm dev               # Local development

# Database
pnpm db:push           # Run migrations
```

### Environment Variables Summary

| Variable | Source | Required |
|----------|--------|----------|
| `DATABASE_URL` | Auto-generated by Terraform | Yes |
| `JWT_SECRET` | You generate | Yes |
| `ADMIN_PASSWORD` | You choose | Yes |
| `OWNER_NAME` | Your name | Yes |
| `AWS_S3_BUCKET` | Auto-generated by Terraform | Yes |
| `AWS_S3_REGION` | Your AWS region | Yes |
| `OPENAI_API_KEY` | OpenAI Platform | Yes |
| `VITE_APP_TITLE` | Your choice | No |

---

## Estimated Costs

| Service | Monthly Cost (USD) |
|---------|-------------------|
| RDS db.t3.micro | $15-20 |
| S3 (10 GB) | $0.25 |
| Amplify Hosting | $5-10 |
| Data Transfer | $1-5 |
| **Total** | **$20-35** |

*Note: RDS db.t3.micro is free tier eligible for 12 months*

---

**Deployment Complete!** 🎉

Your Casey Dean Portfolio is now live on AWS Amplify. The application is fully independent and can be managed entirely through AWS services.
