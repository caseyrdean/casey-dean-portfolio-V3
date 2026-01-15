# =============================================================================
# Casey Dean Portfolio - Main Terraform Configuration
# =============================================================================
# This Terraform configuration deploys the portfolio website to AWS using:
# - AWS Amplify for hosting the full-stack application
# - Amazon RDS (MySQL) for the database
# - Amazon S3 for file storage (blog attachments)
# - VPC with proper security groups
# - IAM roles and policies
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

  # Uncomment and configure for remote state storage
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
  database_url = "mysql://${var.db_username}:${var.db_password}@${aws_db_instance.main.endpoint}/${var.db_name}?ssl=true"
  
  # S3 bucket name (must be globally unique)
  s3_bucket_name = "${var.project_name}-uploads-${random_id.suffix.hex}"
  
  # Amplify environment variables
  amplify_env_vars = {
    NODE_ENV                    = "production"
    DATABASE_URL                = local.database_url
    JWT_SECRET                  = var.jwt_secret
    OWNER_NAME                  = var.owner_name
    OWNER_OPEN_ID               = var.owner_open_id
    OWNER_EMAIL                 = var.owner_email
    OAUTH_SERVER_URL            = var.oauth_server_url
    VITE_OAUTH_PORTAL_URL       = var.oauth_portal_url
    VITE_APP_ID                 = var.app_id
    AWS_S3_BUCKET               = local.s3_bucket_name
    AWS_S3_REGION               = var.aws_region
    VITE_APP_TITLE              = "Casey Dean - AWS Solutions Architect"
    OPENAI_API_KEY              = var.openai_api_key
  }
}
