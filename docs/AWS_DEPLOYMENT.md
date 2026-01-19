# AWS Amplify Deployment Guide

This document provides complete instructions for deploying the Casey Dean Portfolio to AWS Amplify. The application is **fully AWS-independent** with no external OAuth or Manus dependencies.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Amplify                               │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │   Frontend      │    │           Backend                    │ │
│  │   (React SPA)   │───▶│   Express + tRPC (Node.js)          │ │
│  │   dist/public/  │    │   dist/index.js                     │ │
│  └─────────────────┘    └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │                           │
           │                           │
           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│   CloudFront    │         │   Amazon RDS    │
│   (CDN)         │         │   (MySQL)       │
└─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   Amazon S3     │
                            │   (File Storage)│
                            └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   OpenAI API    │
                            │   (The Oracle)  │
                            └─────────────────┘
```

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with appropriate IAM permissions
2. **GitHub Account** with the portfolio repository
3. **Terraform** installed (v1.5.0 or later)
4. **OpenAI API Key** for The Oracle feature

## Environment Variables Reference

The application requires these environment variables. All are configured automatically by Terraform.

| Variable | Description | Required | Sensitive |
|----------|-------------|----------|-----------|
| `DATABASE_URL` | MySQL connection string | Yes | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) | Yes | Yes |
| `ADMIN_PASSWORD` | Password for admin login at `/admin/login` | Yes | Yes |
| `OWNER_NAME` | Display name shown in UI | Yes | No |
| `S3_BUCKET_NAME` | S3 bucket name for file uploads (AWS_ prefix not allowed in Amplify) | Yes | No |
| `S3_REGION` | AWS region for S3 bucket (AWS_ prefix not allowed in Amplify) | Yes | No |
| `OPENAI_API_KEY` | OpenAI API key for The Oracle | Yes | Yes |
| `VITE_APP_TITLE` | Browser tab title | No | No |
| `NODE_ENV` | Environment mode (`production`) | No | No |

## Deployment Steps

### Step 1: Clone and Configure

```bash
# Clone the repository
git clone https://github.com/caseyrdean/casey-dean-portfolio.git
cd casey-dean-portfolio

# Navigate to Terraform directory
cd terraform

# Copy the example variables file
cp terraform.tfvars.example terraform.tfvars
```

### Step 2: Configure Variables

Edit `terraform.tfvars` with your values:

```hcl
# AWS Configuration
aws_region   = "us-east-1"
project_name = "casey-dean-portfolio"
environment  = "prod"

# Database (RDS MySQL)
db_password = "your-secure-database-password"

# GitHub (for Amplify CI/CD)
github_repository   = "caseyrdean/casey-dean-portfolio"
github_branch       = "main"
github_access_token = "ghp_your_github_token"

# Authentication
jwt_secret     = "your-32-character-minimum-secret"
admin_password = "your-admin-password"

# OpenAI
openai_api_key = "sk-your-openai-api-key"
```

### Step 3: Generate Secrets

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate database password
openssl rand -base64 24
```

### Step 4: Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `repo` (Full control of private repositories)
4. Copy the token to `terraform.tfvars`

### Step 5: Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy (type 'yes' when prompted)
terraform apply
```

### Step 6: Verify Deployment

After Terraform completes:

1. Note the `amplify_app_url` from the output
2. Push code to GitHub to trigger a build:
   ```bash
   git push origin main
   ```
3. Monitor the build in AWS Amplify Console
4. Once deployed, visit your site URL

## Post-Deployment Tasks

### Run Database Migrations

Migrations run automatically during Amplify build. To run manually:

```bash
# Connect to your database
mysql -h <rds-endpoint> -u portfolio_admin -p portfolio_db

# Or use the application
pnpm run db:push
```

### Test Admin Login

1. Navigate to `https://your-site.amplifyapp.com/admin/login`
2. Enter your `ADMIN_PASSWORD`
3. You should be redirected to the admin dashboard

### Upload Knowledge Documents

1. Login as admin
2. Navigate to `/admin/knowledge`
3. Upload documents for The Oracle to reference

## Security Considerations

### Secrets Management

| Secret | Storage Location | Access |
|--------|------------------|--------|
| `JWT_SECRET` | Amplify Environment Variables | Encrypted at rest |
| `ADMIN_PASSWORD` | Amplify Environment Variables | Encrypted at rest |
| `DATABASE_URL` | Amplify Environment Variables | Encrypted at rest |
| `OPENAI_API_KEY` | Amplify Environment Variables | Encrypted at rest |

**Important:**
- Never commit `terraform.tfvars` to version control
- Use AWS Secrets Manager for production (optional upgrade)
- Rotate secrets periodically

### Network Security

The Terraform configuration creates:
- VPC with public/private subnets
- Security groups restricting database access
- RDS with encryption at rest

### Authentication Flow

```
User → /admin/login → Enter Password → Server validates → JWT issued → Cookie set
```

- Passwords can be plain text or bcrypt hashed
- JWT tokens expire after 1 year
- Cookies use `HttpOnly`, `SameSite=Lax`, `Secure` (in production)

## Troubleshooting

### Build Failures

**Error: `pnpm: command not found`**
- Ensure `corepack enable` runs before `pnpm install`
- Check `amplify.yml` has correct preBuild commands

**Error: `DATABASE_URL is not defined`**
- Verify environment variables are set in Amplify Console
- Check Terraform applied successfully

### Database Connection Issues

**Error: `Connection refused`**
- Check RDS security group allows inbound from Amplify
- Verify RDS is publicly accessible (or in same VPC)

**Error: `Access denied`**
- Verify `db_username` and `db_password` match
- Check `DATABASE_URL` format is correct

### Authentication Issues

**Error: `ADMIN_PASSWORD environment variable is not set`**
- Add `ADMIN_PASSWORD` to Amplify environment variables
- Redeploy after adding the variable

**Error: `Invalid password`**
- Verify password matches exactly (case-sensitive)
- If using bcrypt hash, ensure it starts with `$2`

## Cost Estimates

Monthly costs (approximate, us-east-1):

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| RDS MySQL | db.t3.micro, 20GB | $15-20 |
| S3 | 10 GB storage | $0.25 |
| Amplify Hosting | Build minutes + hosting | $5-10 |
| Data Transfer | Varies | $1-5 |
| **Total** | | **$20-35/month** |

*Note: db.t3.micro is free tier eligible for 12 months*

## Updating the Application

### Code Updates

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Amplify automatically builds and deploys

### Infrastructure Updates

1. Modify Terraform files
2. Run:
   ```bash
   terraform plan
   terraform apply
   ```

### Environment Variable Updates

1. Go to AWS Amplify Console
2. Select your app → Environment variables
3. Add/edit variables
4. Redeploy the app

## Cleanup

To destroy all resources:

```bash
cd terraform
terraform destroy
```

**Warning:** This permanently deletes:
- RDS database and all data
- S3 bucket and all files
- Amplify app and deployment history

## Support

For issues:
1. Check CloudWatch Logs in AWS Console
2. Review Amplify build logs
3. Check RDS connection in AWS Console
4. Verify environment variables are set correctly
