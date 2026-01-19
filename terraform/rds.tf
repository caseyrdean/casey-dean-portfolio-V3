# =============================================================================
# Amazon RDS MySQL Configuration
# =============================================================================
# Creates a MySQL database instance for the portfolio application.
# Includes subnet group, parameter group, and proper security settings.
# =============================================================================

# =============================================================================
# DB Subnet Group
# =============================================================================

resource "aws_db_subnet_group" "main" {
  name        = "${local.name_prefix}-db-subnet-group"
  description = "Database subnet group for ${var.project_name}"
  subnet_ids  = aws_subnet.private[*].id

  tags = {
    Name = "${local.name_prefix}-db-subnet-group"
  }
}

# =============================================================================
# DB Parameter Group
# =============================================================================

resource "aws_db_parameter_group" "main" {
  name        = "${local.name_prefix}-db-params"
  family      = "mysql8.0"
  description = "Database parameter group for ${var.project_name}"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  parameter {
    name  = "max_connections"
    value = "100"
  }

  tags = {
    Name = "${local.name_prefix}-db-params"
  }
}

# =============================================================================
# RDS MySQL Instance
# =============================================================================

resource "aws_db_instance" "main" {
  identifier = "${local.name_prefix}-db"

  # Engine configuration
  engine                = "mysql"
  engine_version        = "8.0"
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 2 # Enable autoscaling

  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true # Required for Amplify access

  # Parameter group
  parameter_group_name = aws_db_parameter_group.main.name

  # Backup configuration
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Security
  storage_encrypted = true

  # Deletion protection (disable for dev environments)
  deletion_protection       = var.environment == "prod" ? true : false
  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${local.name_prefix}-final-snapshot" : null

  # Enable minor version upgrades
  auto_minor_version_upgrade = true

  tags = {
    Name = "${local.name_prefix}-db"
  }
}

# =============================================================================
# Outputs for Database
# =============================================================================

output "db_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "database_url" {
  description = "Full database connection URL (sensitive)"
  value       = local.database_url
  sensitive   = true
}
