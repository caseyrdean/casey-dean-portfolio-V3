# =============================================================================
# IAM Roles and Policies
# =============================================================================
# Creates IAM roles for Amplify to access S3 and other AWS services.
# =============================================================================

# =============================================================================
# IAM Role for Amplify
# =============================================================================

resource "aws_iam_role" "amplify" {
  name = "${local.name_prefix}-amplify-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${local.name_prefix}-amplify-role"
  }
}

# =============================================================================
# IAM Policy for S3 Access
# =============================================================================

resource "aws_iam_policy" "amplify_s3" {
  name        = "${local.name_prefix}-amplify-s3-policy"
  description = "Policy for Amplify to access S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
      }
    ]
  })
}

# =============================================================================
# Attach S3 Policy to Amplify Role
# =============================================================================

resource "aws_iam_role_policy_attachment" "amplify_s3" {
  role       = aws_iam_role.amplify.name
  policy_arn = aws_iam_policy.amplify_s3.arn
}

# =============================================================================
# IAM User for Application (Alternative to Role)
# =============================================================================
# This creates an IAM user with access keys that can be used by the application
# for S3 uploads. Use this if Amplify role-based access doesn't work.

resource "aws_iam_user" "app" {
  name = "${local.name_prefix}-app-user"

  tags = {
    Name = "${local.name_prefix}-app-user"
  }
}

resource "aws_iam_user_policy" "app_s3" {
  name = "${local.name_prefix}-app-s3-policy"
  user = aws_iam_user.app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_access_key" "app" {
  user = aws_iam_user.app.name
}

# =============================================================================
# Outputs for IAM
# =============================================================================

output "amplify_role_arn" {
  description = "ARN of the Amplify IAM role"
  value       = aws_iam_role.amplify.arn
}

output "app_access_key_id" {
  description = "Access key ID for the application user"
  value       = aws_iam_access_key.app.id
  sensitive   = true
}

output "app_secret_access_key" {
  description = "Secret access key for the application user"
  value       = aws_iam_access_key.app.secret
  sensitive   = true
}
