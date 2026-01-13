/* Design Philosophy: Neon Apocalypse - Project data structure
 * Contains case study information for AWS architecture projects
 */

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  technologies: string[];
  architectureDiagram?: string;
  downloadUrl?: string;
}

export const projects: Project[] = [
  {
    id: "1",
    slug: "enterprise-cloud-migration",
    title: "Enterprise Cloud Migration",
    subtitle: "Legacy to AWS Transformation",
    category: "Migration",
    image: "/images/project-cloud-migration.png",
    description: "Led the migration of a Fortune 500 company's entire infrastructure from on-premises data centers to AWS, reducing operational costs by 40% while improving system reliability and scalability.",
    challenge: "The client operated 200+ legacy servers across three data centers with complex interdependencies, zero-downtime requirements, and strict compliance mandates. The existing architecture was monolithic, making incremental migration extremely challenging.",
    solution: "Designed a phased migration strategy using AWS Migration Hub, Database Migration Service, and Application Migration Service. Implemented a hybrid cloud architecture during transition, leveraging AWS Direct Connect for secure connectivity. Refactored critical applications to microservices architecture using ECS and Lambda, while lift-and-shifting stable workloads to EC2 with Auto Scaling Groups.",
    results: [
      "40% reduction in infrastructure costs within first year",
      "99.99% uptime achieved across all migrated services",
      "Zero data loss during migration process",
      "50% improvement in deployment velocity",
      "Achieved SOC 2 and HIPAA compliance in AWS environment"
    ],
    technologies: [
      "AWS Migration Hub",
      "DMS",
      "Application Migration Service",
      "EC2",
      "ECS",
      "Lambda",
      "Direct Connect",
      "CloudFormation",
      "Systems Manager"
    ],
    downloadUrl: "/documents/enterprise-migration-architecture.pdf"
  },
  {
    id: "2",
    slug: "serverless-data-pipeline",
    title: "Serverless Data Pipeline",
    subtitle: "Real-time Analytics at Scale",
    category: "Data Engineering",
    image: "/images/project-serverless.png",
    description: "Architected a fully serverless data processing pipeline handling 10 million events per day, enabling real-time analytics and machine learning insights for a fintech startup.",
    challenge: "The client needed to process massive volumes of financial transaction data in real-time, perform fraud detection, generate analytics dashboards, and maintain strict data governance—all while keeping costs predictable and scaling automatically with demand.",
    solution: "Built an event-driven architecture using API Gateway, Lambda, Kinesis Data Streams, and Kinesis Firehose for ingestion. Implemented real-time processing with Lambda and Step Functions for orchestration. Used S3 for data lake storage with Glue for ETL, Athena for ad-hoc queries, and QuickSight for visualization. Integrated SageMaker for ML-based fraud detection models.",
    results: [
      "Processing 10M+ events daily with sub-second latency",
      "90% cost reduction compared to traditional server-based approach",
      "Automatic scaling from 0 to peak load with no manual intervention",
      "Real-time fraud detection reducing losses by $2M annually",
      "Complete audit trail and compliance with financial regulations"
    ],
    technologies: [
      "API Gateway",
      "Lambda",
      "Kinesis Data Streams",
      "Kinesis Firehose",
      "S3",
      "Glue",
      "Athena",
      "QuickSight",
      "SageMaker",
      "Step Functions",
      "DynamoDB"
    ],
    downloadUrl: "/documents/serverless-pipeline-architecture.pdf"
  },
  {
    id: "3",
    slug: "kubernetes-platform",
    title: "Kubernetes Platform Engineering",
    subtitle: "Multi-tenant Container Orchestration",
    category: "Platform",
    image: "/images/project-kubernetes.png",
    description: "Designed and implemented a production-grade Kubernetes platform on AWS EKS serving 50+ development teams, with automated CI/CD, observability, and security guardrails.",
    challenge: "The organization had dozens of development teams deploying applications inconsistently across various environments, leading to configuration drift, security vulnerabilities, and operational overhead. They needed a standardized platform that provided developer autonomy while maintaining security and reliability.",
    solution: "Deployed a multi-cluster EKS architecture with dedicated clusters for production, staging, and development. Implemented GitOps workflows using ArgoCD, automated certificate management with cert-manager, service mesh with Istio for traffic management and security, and comprehensive observability stack with Prometheus, Grafana, and Loki. Created self-service developer portal with standardized application templates and automated compliance checks.",
    results: [
      "50+ teams onboarded to platform within 6 months",
      "Deployment frequency increased from weekly to multiple times per day",
      "Mean time to recovery (MTTR) reduced from hours to minutes",
      "100% of workloads passing security scans before deployment",
      "Infrastructure costs optimized through cluster autoscaling and spot instances"
    ],
    technologies: [
      "EKS",
      "Kubernetes",
      "ArgoCD",
      "Istio",
      "Prometheus",
      "Grafana",
      "Loki",
      "cert-manager",
      "Karpenter",
      "Terraform",
      "GitLab CI"
    ],
    downloadUrl: "/documents/kubernetes-platform-architecture.pdf"
  },
  {
    id: "4",
    slug: "zero-trust-security",
    title: "Zero Trust Security Architecture",
    subtitle: "Defense in Depth for Cloud",
    category: "Security",
    image: "/images/project-security.png",
    description: "Implemented comprehensive zero-trust security architecture across AWS environment, achieving compliance with SOC 2, ISO 27001, and PCI-DSS while maintaining developer productivity.",
    challenge: "The client experienced a security incident that exposed weaknesses in their perimeter-based security model. They needed to implement zero-trust principles across their entire AWS infrastructure without disrupting ongoing business operations or slowing down development teams.",
    solution: "Designed multi-layered security architecture implementing identity-based access controls with AWS IAM Identity Center and Cognito, network segmentation using VPC, Security Groups, and NACLs, encryption at rest and in transit for all data, comprehensive logging and monitoring with CloudTrail, GuardDuty, and Security Hub. Implemented automated security scanning in CI/CD pipelines, secrets management with Secrets Manager, and infrastructure-as-code security validation with Checkov and tfsec.",
    results: [
      "Zero security incidents in 18 months post-implementation",
      "Achieved SOC 2 Type II, ISO 27001, and PCI-DSS compliance",
      "Automated 95% of security compliance checks",
      "Reduced mean time to detect (MTTD) threats from days to minutes",
      "All infrastructure changes reviewed and approved automatically for security"
    ],
    technologies: [
      "IAM Identity Center",
      "Cognito",
      "GuardDuty",
      "Security Hub",
      "CloudTrail",
      "KMS",
      "Secrets Manager",
      "WAF",
      "Shield",
      "Inspector",
      "Macie"
    ],
    downloadUrl: "/documents/zero-trust-architecture.pdf"
  }
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}
