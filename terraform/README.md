# AWS Infrastructure for Casey Dean Portfolio

This Terraform configuration deploys the complete infrastructure for the Casey Dean portfolio website on AWS using Amplify for hosting, RDS for the database, and S3 for file storage.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   AWS Amplify    │    │    Amazon S3     │                   │
│  │   (Hosting)      │    │   (File Uploads) │                   │
│  │                  │    │                  │                   │
│  │  - React App     │    │  - Images        │                   │
│  │  - Express API   │    │  - Documents     │                   │
│  │  - Auto Deploy   │    │  - Videos        │                   │
│  └────────┬─────────┘    └──────────────────┘                   │
│           │                                                      │
│           │                                                      │
│  ┌────────▼─────────────────────────────────────────────────┐   │
│  │                        VPC                                │   │
│  │  ┌─────────────────┐    ┌─────────────────┐              │   │
│  │  │  Public Subnet  │    │  Private Subnet │              │   │
│  │  │                 │    │                 │              │   │
│  │  │                 │    │  ┌───────────┐  │              │   │
│  │  │                 │    │  │  Amazon   │  │              │   │
│  │  │                 │    │  │   RDS     │  │              │   │
│  │  │                 │    │  │  (MySQL)  │  │              │   │
│  │  │                 │    │  └───────────┘  │              │   │
│  │  └─────────────────┘    └─────────────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

Before deploying, ensure you have the following installed and configured:

1. **Terraform** (v1.5.0 or later)
   ```bash
   # macOS
   brew install terraform
   
   # Windows (with Chocolatey)
   choco install terraform
   
   # Linux
   sudo apt-get update && sudo apt-get install -y gnupg software-properties-common
   wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
   sudo apt update && sudo apt install terraform
   ```

2. **AWS CLI** configured with appropriate credentials
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and default region
   ```

3. **GitHub Personal Access Token** with `repo` scope
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` scope
   - Save the token securely

## Quick Start

### Step 1: Configure Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
# Required values to update:
db_password         = "YourSecurePassword123!"
github_access_token = "ghp_your_github_token"
jwt_secret          = "your-32-character-minimum-secret-key"
github_repository   = "your-username/casey-dean-portfolio"
```

### Step 2: Initialize Terraform

```bash
terraform init
```

### Step 3: Review the Plan

```bash
terraform plan
```

Review the resources that will be created.

### Step 4: Deploy

```bash
terraform apply
```

Type `yes` when prompted to confirm.

### Step 5: Push Code to GitHub

```bash
cd ..
git add .
git commit -m "Deploy to AWS"
git push origin main
```

Amplify will automatically detect the push and start building.

### Step 6: Run Database Migrations

After deployment, connect to your database and run migrations:

```bash
# Get the database URL
terraform output -raw database_url

# Set the environment variable and run migrations
export DATABASE_URL="<output from above>"
pnpm db:push
```

## Resource Details

### AWS Amplify
- **Platform**: WEB_COMPUTE (supports SSR and API routes)
- **Auto-deploy**: Enabled on push to main branch
- **Build**: Uses pnpm for package management

### Amazon RDS (MySQL 8.0)
- **Instance**: db.t3.micro (Free Tier eligible)
- **Storage**: 20GB with autoscaling up to 40GB
- **Encryption**: Enabled
- **Backups**: 7-day retention
- **Performance Insights**: Enabled

### Amazon S3
- **Versioning**: Enabled
- **Encryption**: AES-256
- **Public Access**: Enabled for uploaded files
- **CORS**: Configured for browser uploads
- **Lifecycle**: Old versions deleted after 90 days

### VPC
- **CIDR**: 10.0.0.0/16
- **Public Subnets**: 2 (for internet access)
- **Private Subnets**: 2 (for RDS)
- **Security Groups**: Configured for MySQL access

## Environment Variables

The following environment variables are automatically configured in Amplify:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `AWS_S3_BUCKET` | S3 bucket name for uploads |
| `AWS_S3_REGION` | S3 bucket region |
| `OWNER_NAME` | Site owner name |
| `OWNER_EMAIL` | Site owner email |

## Custom Domain Setup

To use a custom domain:

1. Update `terraform.tfvars`:
   ```hcl
   enable_custom_domain = true
   custom_domain        = "caseydean.com"
   ```

2. Apply the changes:
   ```bash
   terraform apply
   ```

3. Add the provided DNS records to your domain registrar.

## Costs Estimate

Monthly costs (approximate, us-east-1):

| Resource | Cost |
|----------|------|
| RDS db.t3.micro | ~$15/month |
| S3 (10GB storage) | ~$0.25/month |
| Amplify Hosting | ~$0.01/build + $0.15/GB served |
| Data Transfer | Variable |

**Free Tier eligible**: RDS and S3 are covered under AWS Free Tier for the first 12 months.

## Maintenance Commands

### View Outputs
```bash
terraform output
terraform output -json environment_variables
```

### Update Infrastructure
```bash
terraform plan
terraform apply
```

### Destroy Infrastructure
```bash
terraform destroy
```

**Warning**: This will delete all resources including the database. Ensure you have backups.

## Troubleshooting

### Amplify Build Fails
1. Check the Amplify console for build logs
2. Ensure all environment variables are set
3. Verify the build spec in `amplify.tf`

### Database Connection Issues
1. Verify the security group allows connections from Amplify
2. Check the DATABASE_URL format
3. Ensure SSL is enabled in the connection string

### S3 Upload Fails
1. Verify CORS configuration
2. Check IAM permissions
3. Ensure the bucket policy allows public read

## Security Recommendations

1. **Database**: Consider using AWS Secrets Manager for credentials
2. **S3**: Restrict CORS origins to your domain in production
3. **IAM**: Use least-privilege principles
4. **Monitoring**: Enable CloudWatch alarms for RDS and Amplify

## Files Structure

```
terraform/
├── main.tf           # Provider and locals
├── variables.tf      # Input variables
├── vpc.tf            # VPC and networking
├── rds.tf            # RDS MySQL database
├── s3.tf             # S3 bucket for uploads
├── iam.tf            # IAM roles and policies
├── amplify.tf        # Amplify hosting
├── outputs.tf        # Output values
├── terraform.tfvars.example  # Example variables
└── README.md         # This file
```

## Support

For issues with this infrastructure:
1. Check AWS CloudWatch logs
2. Review Amplify build logs
3. Verify Terraform state with `terraform show`

For application issues, refer to the main project README.


```bash
terraform apply
```

Type `yes` when prompted to confirm.

### Step 5: Get Outputs

```bash
terraform output
```

This will display the Amplify app URL, database endpoint, and S3 bucket name.

## Resources Created

| Resource | Description |
|----------|-------------|
| VPC | Virtual Private Cloud with public/private subnets |
| RDS MySQL | Database for blog posts, users, and The Oracle knowledge base |
| S3 Bucket | File storage for uploads (images, documents, videos) |
| AWS Amplify | Full-stack hosting with CI/CD from GitHub |
| IAM Roles | Service roles for Amplify and S3 access |
| Security Groups | Network security for RDS and VPC |

## The Oracle RAG System

The Oracle feature is an AI-powered seer that answers questions about Casey Dean using a RAG (Retrieval-Augmented Generation) system. The infrastructure supports:

### Database Tables

- **knowledge_documents** - Stores uploaded documents (resumes, project descriptions, etc.)
- **document_chunks** - Text chunks for efficient retrieval
- **oracle_conversations** - Conversation sessions
- **oracle_messages** - Individual messages with source references

### How It Works

1. Admin uploads documents (Markdown, text, JSON) via `/admin/knowledge`
2. Documents are stored in S3 and processed into searchable chunks
3. When users ask The Oracle questions, the system:
   - Searches for relevant document chunks
   - Sends context + question to LLM
   - Returns answer grounded in your documents only
4. If no relevant information is found, The Oracle says "I don't know"

### Security Features

- Only admin users can upload/manage documents
- The Oracle never invents information - only uses approved documents
- All conversations are logged for review
- Documents can be activated/deactivated without deletion

## Environment Variables

The Amplify app requires these environment variables (automatically set by Terraform):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Secret for session tokens |
| `AWS_S3_BUCKET` | S3 bucket name for uploads |
| `AWS_REGION` | AWS region |

## Cost Estimate

| Resource | Monthly Cost (Estimate) |
|----------|------------------------|
| RDS db.t3.micro | ~$15-20 |
| S3 (10GB) | ~$0.25 |
| Amplify (basic) | ~$0-5 |
| Data Transfer | ~$1-5 |
| **Total** | **~$20-30/month** |

*Costs vary based on usage. RDS is the primary cost driver.*

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning:** This will delete all data including the database. Make backups first!

## Troubleshooting

### Amplify Build Fails

1. Check GitHub token has `repo` scope
2. Verify repository exists and is accessible
3. Check Amplify console for build logs

### Database Connection Issues

1. Ensure RDS is publicly accessible (for Amplify)
2. Check security group allows inbound on port 3306
3. Verify DATABASE_URL format is correct

### S3 Upload Fails

1. Check IAM role has proper S3 permissions
2. Verify bucket name is globally unique
3. Check CORS configuration if uploading from browser
