# =============================================================================
# AWS Amplify Configuration
# =============================================================================
# Deploys the portfolio application using AWS Amplify Hosting.
# Supports automatic deployments from GitHub.
# =============================================================================

# =============================================================================
# Amplify App
# =============================================================================

resource "aws_amplify_app" "main" {
  name       = var.project_name
  repository = "https://github.com/${var.github_repository}"

  # GitHub access token for repository access
  access_token = var.github_access_token

  # IAM service role
  iam_service_role_arn = aws_iam_role.amplify.arn

  # Build specification for full-stack Express + React application
  # Uses WEB_COMPUTE platform for SSR support
  build_spec = <<-EOT
    version: 1
    applications:
      - appRoot: .
        frontend:
          phases:
            preBuild:
              commands:
                - corepack enable
                - corepack prepare pnpm@10.4.1 --activate
                - pnpm install --frozen-lockfile
            build:
              commands:
                - pnpm run build
          artifacts:
            baseDirectory: dist/public
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
              - .pnpm-store/**/*
        backend:
          phases:
            preBuild:
              commands:
                - corepack enable
                - corepack prepare pnpm@10.4.1 --activate
                - pnpm install --frozen-lockfile
            build:
              commands:
                - pnpm run build
          artifacts:
            baseDirectory: dist
            files:
              - index.js
              - public/**/*
  EOT

  # Environment variables
  environment_variables = local.amplify_env_vars

  # Custom rules for SPA routing
  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>"
    target = "/index.html"
    status = "200"
  }

  # Enable auto branch creation
  enable_auto_branch_creation = false
  enable_branch_auto_build    = true
  enable_branch_auto_deletion = false

  # Platform configuration
  platform = "WEB_COMPUTE"

  tags = {
    Name = "${local.name_prefix}-amplify"
  }
}

# =============================================================================
# Amplify Branch (main)
# =============================================================================

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = var.github_branch

  # Enable auto build on push
  enable_auto_build = true

  # Framework detection
  framework = "React"

  # Stage
  stage = var.environment == "prod" ? "PRODUCTION" : "DEVELOPMENT"

  # Environment variables specific to this branch
  environment_variables = {
    AMPLIFY_DIFF_DEPLOY       = "false"
    AMPLIFY_MONOREPO_APP_ROOT = ""
  }

  tags = {
    Name = "${local.name_prefix}-main-branch"
  }
}

# =============================================================================
# Custom Domain (Optional)
# =============================================================================

resource "aws_amplify_domain_association" "main" {
  count = var.enable_custom_domain && var.custom_domain != "" ? 1 : 0

  app_id      = aws_amplify_app.main.id
  domain_name = var.custom_domain

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = ""
  }

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "www"
  }
}

# =============================================================================
# Outputs for Amplify
# =============================================================================

output "amplify_app_id" {
  description = "Amplify application ID"
  value       = aws_amplify_app.main.id
}

output "amplify_default_domain" {
  description = "Amplify default domain"
  value       = aws_amplify_app.main.default_domain
}

output "amplify_app_url" {
  description = "Full URL of the deployed application"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.main.default_domain}"
}

output "custom_domain_url" {
  description = "Custom domain URL (if configured)"
  value       = var.enable_custom_domain && var.custom_domain != "" ? "https://${var.custom_domain}" : null
}
