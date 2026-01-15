# AWS Deployment Guide

This document explains how to deploy the Casey Dean Portfolio website to AWS with full independence from Manus.

## Architecture Overview

The portfolio uses a simple, portable architecture:

| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| **Frontend** | AWS Amplify | React SPA hosting with CI/CD |
| **Backend** | AWS Amplify (Node.js) | Express + tRPC API |
| **Database** | Amazon RDS (MySQL) | Data persistence |
| **File Storage** | Amazon S3 | Blog attachments, knowledge docs |
| **AI/ML** | OpenAI API | The Oracle RAG feature |

## Prerequisites

1. AWS Account with appropriate permissions
2. GitHub repository with the portfolio code
3. GitHub Personal Access Token (for Amplify)
4. OpenAI API key (for The Oracle feature)

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) | Generate with `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | Password for admin login | Your secure password |
| `OWNER_NAME` | Display name for the owner | `Casey Dean` |
| `AWS_S3_BUCKET` | S3 bucket name for file uploads | `casey-portfolio-uploads` |
| `AWS_S3_REGION` | AWS region for S3 | `us-east-1` |
| `OPENAI_API_KEY` | OpenAI API key for The Oracle | `sk-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `production` |

## Deployment Options

### Option 1: Terraform (Recommended)

The `terraform/` directory contains infrastructure-as-code for deploying to AWS.

```bash
cd terraform

# Copy and configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy
terraform apply
```

This creates:
- VPC with public/private subnets
- RDS MySQL instance
- S3 bucket for file storage
- Amplify app connected to GitHub
- IAM roles and security groups

### Option 2: Manual Deployment

1. **Create RDS MySQL Database**
   - Instance class: `db.t3.micro` (free tier)
   - Storage: 20 GB
   - Enable public access if needed

2. **Create S3 Bucket**
   - Enable public access for uploaded files
   - Configure CORS for your domain

3. **Create Amplify App**
   - Connect to your GitHub repository
   - Configure build settings (see `amplify.yml`)
   - Add environment variables

### Option 3: Docker/ECS

Build and deploy using Docker:

```bash
# Build
docker build -t casey-portfolio .

# Run locally
docker run -p 3000:3000 --env-file .env casey-portfolio

# Push to ECR and deploy to ECS/Fargate
```

## Authentication

This portfolio uses **simple password-based authentication** for admin access:

1. Set `ADMIN_PASSWORD` environment variable
2. Navigate to `/admin/login`
3. Enter the admin password
4. Session is stored in a secure HTTP-only cookie

**Security Notes:**
- Passwords can be plain text or bcrypt hashed
- JWT tokens expire after 1 year
- Cookies use `SameSite=Lax` and `HttpOnly` flags

## Database Schema

Run migrations after deployment:

```bash
pnpm db:push
```

This creates tables for:
- Users
- Blog posts and attachments
- Projects
- Knowledge documents and chunks
- Oracle conversations and messages

## File Storage

Files are stored in S3 with the following structure:

```
bucket/
├── blog/
│   ├── images/
│   ├── documents/
│   └── videos/
└── knowledge/
    ├── resume/
    ├── project/
    └── other/
```

## The Oracle AI

The Oracle uses OpenAI's GPT-3.5-turbo for cost-effective responses:

- **RAG System**: Retrieves relevant context from knowledge documents
- **Conversation History**: Maintains context across messages
- **Token Limits**: 200 tokens per response for cost control

To add knowledge:
1. Login as admin
2. Navigate to `/admin/knowledge`
3. Upload documents (text, PDF, etc.)

## Monitoring & Logs

- **Amplify Console**: View build logs and deployment status
- **CloudWatch**: Application logs (if configured)
- **RDS Performance Insights**: Database monitoring

## Cost Estimates

Monthly costs (approximate):

| Service | Cost |
|---------|------|
| RDS db.t3.micro | ~$15 |
| S3 (10 GB) | ~$0.25 |
| Amplify hosting | ~$5 |
| OpenAI API | Variable |
| **Total** | ~$20-30/month |

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check security group allows inbound MySQL (3306)
- Ensure RDS is publicly accessible or in same VPC

### S3 Upload Failures
- Verify IAM permissions for S3
- Check bucket CORS configuration
- Ensure `AWS_S3_BUCKET` and `AWS_S3_REGION` are set

### Authentication Issues
- Verify `JWT_SECRET` is set
- Check `ADMIN_PASSWORD` is correct
- Clear browser cookies and retry

## Security Checklist

- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Use strong `ADMIN_PASSWORD`
- [ ] Enable HTTPS (Amplify does this automatically)
- [ ] Configure RDS security group properly
- [ ] Enable S3 bucket encryption
- [ ] Rotate secrets periodically
