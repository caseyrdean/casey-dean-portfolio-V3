# AWS Amplify Deployment Guide

## Overview

This portfolio is configured for deployment on AWS Amplify with full-stack support (React frontend + Express backend). The application uses:

- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Backend**: Express + tRPC
- **Database**: MySQL (AWS RDS compatible)
- **Storage**: AWS S3 for file uploads
- **AI**: OpenAI API for The Oracle

## Prerequisites

1. AWS Account with Amplify access
2. GitHub repository with the code
3. OpenAI API key for The Oracle
4. MySQL database (AWS RDS recommended)

## Deployment Options

### Option 1: Terraform (Recommended)

Use the provided Terraform configuration in `/terraform` directory:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform plan
terraform apply
```

### Option 2: AWS Amplify Console

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Select the branch to deploy
5. Configure build settings (amplify.yml is auto-detected)
6. Add environment variables (see below)
7. Deploy

## Environment Variables

Set these in AWS Amplify Console → App settings → Environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `DATABASE_URL` | MySQL connection string with SSL | Yes |
| `JWT_SECRET` | Secret for session tokens (min 32 chars) | Yes |
| `OPENAI_API_KEY` | OpenAI API key for The Oracle | Yes |
| `OWNER_NAME` | Your display name | Yes |
| `OWNER_OPEN_ID` | Your OpenID for authentication | No |
| `VITE_APP_ID` | Application identifier | Yes |
| `VITE_APP_TITLE` | Website title | Yes |
| `AWS_S3_BUCKET` | S3 bucket for uploads | Yes |
| `AWS_S3_REGION` | S3 bucket region | Yes |

### Database URL Format

```
mysql://username:password@hostname:3306/database?ssl=true
```

## Build Configuration

The `amplify.yml` file configures the build process:

- Uses pnpm for package management
- Builds both frontend and backend
- Outputs to `dist/` directory

## Post-Deployment

1. **Verify Database Connection**: Check that the app can connect to your MySQL database
2. **Test The Oracle**: Ask a question to verify OpenAI integration works
3. **Test Admin Pages**: Navigate to `/admin/blog` and `/admin/projects`
4. **Upload Content**: Add blog posts and projects through the admin interface

## Troubleshooting

### Build Fails

- Check that all environment variables are set
- Verify pnpm version compatibility (10.4.1)
- Review build logs in Amplify Console

### Database Connection Issues

- Ensure DATABASE_URL includes `?ssl=true`
- Verify RDS security group allows Amplify access
- Check that the database user has proper permissions

### The Oracle Not Working

- Verify OPENAI_API_KEY is set correctly
- Check that the API key has sufficient quota
- Review server logs for error messages

## Security Notes

- Never commit `.env` files or secrets to version control
- Use AWS Secrets Manager for sensitive values in production
- Enable SSL/TLS for all database connections
- Regularly rotate API keys and secrets

## Support

For issues specific to this portfolio, check the GitHub repository issues.
For AWS Amplify support, refer to [AWS Amplify Documentation](https://docs.amplify.aws/).
