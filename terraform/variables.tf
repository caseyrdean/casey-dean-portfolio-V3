# =============================================================================
# Casey Dean Portfolio - Terraform Variables
# =============================================================================
# This file defines all configurable variables for the AWS infrastructure.
# 
# DEPLOYMENT STEPS:
# 1. Copy terraform.tfvars.example to terraform.tfvars
# 2. Fill in all required values (marked with "REQUIRED")
# 3. Run: terraform init
# 4. Run: terraform plan
# 5. Run: terraform apply
# 
# NOTE: This configuration is fully AWS-independent with no Manus dependencies.
# Authentication uses simple password-based admin login.
# =============================================================================

# =============================================================================
# AWS Configuration
# =============================================================================

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "casey-dean-portfolio"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

# =============================================================================
# Database Configuration (Amazon RDS MySQL)
# =============================================================================

variable "db_instance_class" {
  description = "RDS instance class (db.t3.micro is free tier eligible)"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
  
  validation {
    condition     = var.db_allocated_storage >= 20
    error_message = "Minimum storage is 20 GB"
  }
}

variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "portfolio_db"
}

variable "db_username" {
  description = "Master username for the database"
  type        = string
  default     = "portfolio_admin"
  sensitive   = true
}

variable "db_password" {
  description = "REQUIRED: Master password for the database (min 8 characters)"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.db_password) >= 8
    error_message = "Database password must be at least 8 characters"
  }
}

# =============================================================================
# GitHub Configuration (for Amplify CI/CD)
# =============================================================================

variable "github_repository" {
  description = "GitHub repository for Amplify (format: owner/repo)"
  type        = string
  default     = "caseyrdean/casey-dean-portfolio"
}

variable "github_branch" {
  description = "GitHub branch to deploy"
  type        = string
  default     = "main"
}

variable "github_access_token" {
  description = "REQUIRED: GitHub personal access token for Amplify (needs repo scope)"
  type        = string
  sensitive   = true
}

# =============================================================================
# Authentication Configuration
# =============================================================================
# This portfolio uses simple password-based authentication for admin access.
# No external OAuth providers (Manus, Cognito, Auth0) are required.
# =============================================================================

variable "jwt_secret" {
  description = "REQUIRED: Secret key for JWT token signing (min 32 characters). Generate with: openssl rand -hex 32"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.jwt_secret) >= 32
    error_message = "JWT secret must be at least 32 characters for security"
  }
}

variable "admin_password" {
  description = "REQUIRED: Admin password for login at /admin/login. Can be plain text or bcrypt hash (starting with $2)"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.admin_password) >= 8
    error_message = "Admin password must be at least 8 characters"
  }
}

# =============================================================================
# Application Configuration
# =============================================================================

variable "owner_name" {
  description = "Owner display name (shown in UI)"
  type        = string
  default     = "Casey Dean"
}

variable "app_title" {
  description = "Application title (shown in browser tab and meta tags)"
  type        = string
  default     = "Casey Dean - AWS Solutions Architect"
}

variable "openai_api_key" {
  description = "REQUIRED: OpenAI API key for The Oracle AI assistant (starts with sk-)"
  type        = string
  sensitive   = true
  
  validation {
    condition     = can(regex("^sk-", var.openai_api_key))
    error_message = "OpenAI API key must start with 'sk-'"
  }
}

# =============================================================================
# Domain Configuration (Optional)
# =============================================================================

variable "custom_domain" {
  description = "Custom domain for the website (optional, leave empty to use Amplify default)"
  type        = string
  default     = ""
}

variable "enable_custom_domain" {
  description = "Whether to configure a custom domain"
  type        = bool
  default     = false
}

# =============================================================================
# Tags
# =============================================================================

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "casey-dean-portfolio"
    ManagedBy   = "terraform"
    Environment = "prod"
  }
}
