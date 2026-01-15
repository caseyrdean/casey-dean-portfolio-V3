# =============================================================================
# Casey Dean Portfolio - Terraform Variables
# =============================================================================
# This file defines all configurable variables for the AWS infrastructure.
# Update these values before running terraform apply.
# 
# NOTE: This configuration is fully AWS-independent with no Manus dependencies.
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
}

# =============================================================================
# Database Configuration
# =============================================================================

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
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
  description = "Master password for the database (min 8 characters)"
  type        = string
  sensitive   = true
}

# =============================================================================
# Application Configuration
# =============================================================================

variable "github_repository" {
  description = "GitHub repository URL for Amplify (format: owner/repo)"
  type        = string
  default     = "caseyrdean/casey-dean-portfolio"
}

variable "github_branch" {
  description = "GitHub branch to deploy"
  type        = string
  default     = "main"
}

variable "github_access_token" {
  description = "GitHub personal access token for Amplify"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret key for JWT token signing (min 32 characters)"
  type        = string
  sensitive   = true
}

variable "admin_password" {
  description = "Admin password for login (can be plain text or bcrypt hash)"
  type        = string
  sensitive   = true
}

variable "owner_name" {
  description = "Owner display name"
  type        = string
  default     = "Casey Dean"
}

variable "openai_api_key" {
  description = "OpenAI API key for The Oracle AI assistant"
  type        = string
  sensitive   = true
}

# =============================================================================
# Domain Configuration
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
