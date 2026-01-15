# =============================================================================
# Casey Dean Portfolio - Main Terraform Configuration
# =============================================================================
# This Terraform configuration deploys the portfolio website to AWS using:
# - AWS Amplify for hosting the full-stack application (WEB_COMPUTE platform)
# - Amazon RDS (MySQL) for the database
# - Amazon S3 for file storage (blog attachments, knowledge documents)
# - VPC with proper security groups
# - IAM roles and policies
#
# IMPORTANT: This configuration is fully AWS-independent with NO Manus/external
# OAuth dependencies. Authentication uses simple password-based admin login.
# =============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Uncomment and configure for remote state storage (recommended for production)
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "casey-dean-portfolio/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

# =============================================================================
# Data Sources
# =============================================================================

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# =============================================================================
# Random Suffix for Unique Resource Names
# =============================================================================

resource "random_id" "suffix" {
  byte_length = 4
}

# =============================================================================
# Local Variables
# =============================================================================

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Database connection string for the application
  # Format: mysql://user:password@host:port/database?ssl=true
  database_url = "mysql://${var.db_username}:${var.db_password}@${aws_db_instance.main.endpoint}/${var.db_name}?ssl=true"
  
  # S3 bucket name (must be globally unique)
  s3_bucket_name = "${var.project_name}-uploads-${random_id.suffix.hex}"
  
  # ==========================================================================
  # Amplify Environment Variables
  # ==========================================================================
  # These are the ONLY environment variables needed for the standalone deployment.
  # No Manus OAuth, no external authentication providers required.
  # ==========================================================================
  amplify_env_vars = {
    # Application mode
    NODE_ENV = "production"
    
    # Database connection (MySQL/Aurora)
    DATABASE_URL = local.database_url
    
    # Authentication - Simple password-based admin login
    # The JWT_SECRET is used to sign session tokens
    # The ADMIN_PASSWORD is used for admin login at /admin/login
    JWT_SECRET     = var.jwt_secret
    ADMIN_PASSWORD = var.admin_password
    
    # Owner information (displayed in UI)
    OWNER_NAME = var.owner_name
    
    # AWS S3 configuration for file uploads
    AWS_S3_BUCKET = local.s3_bucket_name
    AWS_S3_REGION = var.aws_region
    
    # Application title (used in browser tab, meta tags)
    VITE_APP_TITLE = var.app_title
    
    # OpenAI API key for The Oracle AI assistant
    # This is the ONLY external API dependency
    OPENAI_API_KEY = var.openai_api_key
  }
}
