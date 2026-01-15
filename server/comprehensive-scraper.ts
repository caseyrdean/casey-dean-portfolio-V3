/**
 * Comprehensive Website Scraper for The Oracle RAG system
 * Scrapes all navigable pages, projects, blog posts, and attachments
 * Filters out PII and secrets
 */

import { getPublishedBlogPostsForOracle, getPublishedProjectsForOracle } from './db';

// Cache for full website data (refresh every hour)
let fullWebsiteCache: { data: string | null; timestamp: number } = { data: null, timestamp: 0 };
const FULL_WEBSITE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * PII and sensitive patterns to filter out
 */
const SENSITIVE_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
  /\b\d{3}-\d{2}-\d{4}\b/g, // Social Security numbers
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone numbers
  /sk-[a-zA-Z0-9]{20,}/g, // API keys
  /OPENAI_API_KEY/gi,
  /JWT_SECRET/gi,
  /DATABASE_URL/gi,
  /BUILT_IN_FORGE_API_KEY/gi,
  /password/gi,
  /secret/gi,
  /token/gi,
];

/**
 * Filter out sensitive information from text
 */
function filterSensitiveInfo(text: string): string {
  let filtered = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    filtered = filtered.replace(pattern, '[REDACTED]');
  }
  return filtered;
}

/**
 * Get all projects from the database
 */
async function getProjectsContent(): Promise<string> {
  try {
    const projects = await getPublishedProjectsForOracle();
    
    let projectsContent = 'PROJECTS AND CASE STUDIES:\n';
    projectsContent += '='.repeat(70) + '\n\n';
    
    for (const project of projects) {
      projectsContent += `PROJECT: ${project.title}\n`;
      projectsContent += `Category: ${project.category || 'N/A'}\n\n`;
      
      projectsContent += `DESCRIPTION:\n${project.description}\n\n`;
      
      projectsContent += `CHALLENGE:\n${project.challenge}\n\n`;
      
      projectsContent += `SOLUTION:\n${project.solution}\n\n`;
      
      projectsContent += `RESULTS:\n`;
      for (const result of project.results) {
        projectsContent += `- ${result}\n`;
      }
      projectsContent += '\n';
      
      projectsContent += `TECHNOLOGIES USED:\n`;
      for (const tech of project.technologies) {
        projectsContent += `- ${tech}\n`;
      }
      projectsContent += '\n';
      
      projectsContent += '-'.repeat(70) + '\n\n';
    }
    
    return projectsContent;
  } catch (error) {
    console.error('[Scraper] Failed to get projects content:', error);
    return '';
  }
}

/**
 * Get all blog posts with full content and attachments
 */
async function getBlogPostsContent(): Promise<string> {
  try {
    const blogPosts = await getPublishedBlogPostsForOracle();
    
    let blogContent = 'BLOG POSTS:\n';
    blogContent += '='.repeat(70) + '\n\n';
    
    if (!blogPosts || blogPosts.length === 0) {
      blogContent += 'No published blog posts yet.\n';
      return blogContent;
    }
    
    for (const post of blogPosts) {
      blogContent += `BLOG POST: ${post.title}\n`;
      if (post.category) blogContent += `Category: ${post.category}\n`;
      if (post.tags && post.tags.length > 0) {
        blogContent += `Tags: ${post.tags.join(', ')}\n`;
      }
      blogContent += '\n';
      
      blogContent += `CONTENT:\n${post.content}\n\n`;
      blogContent += '-'.repeat(70) + '\n\n';
    }
    
    return blogContent;
  } catch (error) {
    console.error('[Scraper] Failed to get blog posts content:', error);
    return '';
  }
}

/**
 * Get home page content
 */
function getHomePageContent(): string {
  const homeContent = `HOME PAGE - PROFESSIONAL SUMMARY:
=============================================================================

CASEY DEAN
AWS Solutions Architect | Cloud Infrastructure and AI Obsessed

Professional Summary:
AWS Solutions Architect | Enterprise Software Implementation | Scaling Innovation | 
Digital Strategist | AI Architect | Cloud Architect | AI Strategy | Ideation | 
Design Thinking | Veteran | Extreme Ownership

Key Qualifications:
- AWS Solutions Architect - Associate (SAA-C03, Valid through November 2028)
- Successful Startup Exit (Elegant Solutions, 2019)
- BBA Entrepreneurship (University of Wisconsin - Whitewater, 2016)

Current Role:
Solutions Consultant and COE Lead at Jaggaer (06/2024 - Present)
Translating complex business requirements into scalable, secure system designs 
across discovery, configuration, deployment, and post-go-live transition.

=============================================================================
`;
  return homeContent;
}

/**
 * Get credentials and experience content
 */
function getCredentialsContent(): string {
  const credentialsContent = `CREDENTIALS AND EXPERIENCE:
=============================================================================

CERTIFICATIONS:
- AWS Solutions Architect - Associate (SAA-C03, 2025, Valid through November 2028)

WORK EXPERIENCE:

1. Solutions Consultant and COE Lead - Jaggaer (06/2024 - Present)
   Translating complex business requirements into scalable, secure system designs 
   across discovery, configuration, deployment, and post-go-live transition. 
   Acting as primary architectural advisor to client stakeholders, guiding 
   trade-off decisions across functionality, integrations, and compliance constraints.

2. Senior Innovation Management Consultant - Sopheon (05/2022 - 06/2024)
   Drove design and deployment of Portfolio Management solutions across $15M+ ARR 
   in federal contracts. Delivered 12 sensitive DoD solutions by guiding secure, 
   compliance-focused technical decisions aligned with FedRAMP standards.

3. Research Analyst / Innovation Analyst / Founder - Wilde Group (02/2019 - 05/2022)
   Coordinated cross-functional teams across product, engineering, and business 
   groups for 4 Fortune 500 clients. Guided early architecture exploration 
   contributing to the launch of 9 enterprise innovation initiatives.

4. Lead Analyst Global Talent Acquisition Insights - Stryker (09/2018 - 06/2020)
   Unified cross-departmental data models in Workday to establish a centralized 
   KPI framework. Developed Tableau-based reporting system eliminating 40+ manual 
   reports and reducing stakeholder requests by 50%.

5. Founding Partner - Elegant Solutions (02/2016 - 12/2018)
   Led discovery sessions with over 200 ER patients and hospital staff to uncover 
   workflow inefficiencies. Conceived and wireframed an ER platform MVP with custom 
   IoT-based mesh network, leading to company acquisition in 2019.

CORE SKILLS:
AWS Services: EC2, S3, RDS, Lambda, VPC, CloudFront, Route 53, APIs, IAM, 
CloudTrail, CloudWatch, Systems Manager, DynamoDB, Redshift, Athena, Glue, QuickSight

Infrastructure as Code: CloudFormation, CDK, Terraform, GitHub, Jenkins, CodePipeline

Security: Cognito, SAML, RBAC, KMS, TLS, FedRAMP, Zero Trust, CAF

Data & Analytics: Data Modeling, Tableau, QuickSight, Redshift, Athena

APIs & Integration: REST, OAuth2, JWT, OpenAPI, Postman

AI/ML: Bedrock, SageMaker, Gradio

Methodologies: Agile, OKRs, Jira

Languages: Python, TypeScript, Bash, YAML, JSON, HCL, SQL, JavaScript

Frontend: React, Next.js, Tailwind

AI Agents & Frameworks: Anthropic MCP, AutoGen, LangGraph, CrewAI, OpenAI SDK

AI/NLP: OCR, NLP, GenAI, HuggingFace

Vector Databases: Weaviate, Pinecone, OpenAI API

=============================================================================
`;
  return credentialsContent;
}

/**
 * Fetch comprehensive website content
 */
export async function fetchComprehensiveWebsiteContent(): Promise<string | null> {
  const now = Date.now();
  
  if (fullWebsiteCache.data && (now - fullWebsiteCache.timestamp) < FULL_WEBSITE_CACHE_TTL) {
    console.log('[Scraper] Using cached comprehensive website content');
    return fullWebsiteCache.data;
  }
  
  try {
    console.log('[Scraper] Fetching comprehensive website content...');
    
    let fullContent = 'CASEY DEAN PORTFOLIO - COMPLETE WEBSITE CONTENT\n';
    fullContent += '='.repeat(70) + '\n\n';
    
    // Add home page
    fullContent += getHomePageContent();
    fullContent += '\n\n';
    
    // Add credentials
    fullContent += getCredentialsContent();
    fullContent += '\n\n';
    
    // Add projects
    const projectsContent = await getProjectsContent();
    fullContent += projectsContent;
    fullContent += '\n\n';
    
    // Add blog posts
    const blogContent = await getBlogPostsContent();
    fullContent += blogContent;
    
    // Filter sensitive information
    fullContent = filterSensitiveInfo(fullContent);
    
    fullWebsiteCache = { data: fullContent, timestamp: now };
    console.log('[Scraper] Fetched comprehensive website content successfully');
    return fullContent;
  } catch (error) {
    console.error('[Scraper] Failed to fetch comprehensive website content:', error);
    return null;
  }
}


// =============================================================================
// Cache Management
// =============================================================================

/**
 * Clear the website scrape cache
 * Called when blog posts or website content changes
 */
export function clearWebsiteScraperCache(): void {
  console.log('[Scraper] Clearing website content cache');
  fullWebsiteCache = { data: null, timestamp: 0 };
}
