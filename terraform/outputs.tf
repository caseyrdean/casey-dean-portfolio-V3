# =============================================================================
# Terraform Outputs
# =============================================================================
# Consolidated outputs for easy reference after deployment.
# =============================================================================

output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    application_url   = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.main.default_domain}"
    database_endpoint = aws_db_instance.main.endpoint
    s3_bucket         = aws_s3_bucket.uploads.id
    region            = var.aws_region
  }
}

output "environment_variables" {
  description = "Environment variables to configure (if not using Amplify)"
  sensitive   = true
  value = {
    DATABASE_URL          = local.database_url
    AWS_S3_BUCKET         = aws_s3_bucket.uploads.id
    AWS_S3_REGION         = var.aws_region
    AWS_ACCESS_KEY_ID     = aws_iam_access_key.app.id
    AWS_SECRET_ACCESS_KEY = aws_iam_access_key.app.secret
  }
}

output "next_steps" {
  description = "Next steps after deployment"
  value       = <<-EOT
    
    ============================================================
    DEPLOYMENT COMPLETE!
    ============================================================
    
    Your Casey Dean Portfolio infrastructure has been created.
    
    Application URL: https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.main.default_domain}
    
    NEXT STEPS:
    
    1. Push your code to GitHub:
       git push origin ${var.github_branch}
    
    2. Amplify will automatically build and deploy your application.
    
    3. Run database migrations:
       - Connect to your database using the DATABASE_URL
       - Run: pnpm db:push
    
    4. Access your site at the URL above.
    
    IMPORTANT NOTES:
    
    - Database endpoint: ${aws_db_instance.main.endpoint}
    - S3 bucket for uploads: ${aws_s3_bucket.uploads.id}
    - The database is publicly accessible for Amplify connectivity.
      Consider adding IP restrictions in production.
    
    To view sensitive outputs:
       terraform output -json environment_variables
    
    ============================================================
  EOT
}
