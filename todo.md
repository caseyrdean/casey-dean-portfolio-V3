# Project TODO

## Completed Features
- [x] Basic portfolio website with Neon Apocalypse theme
- [x] Hero section with profile image
- [x] Project grid with hover effects
- [x] Case study detail pages
- [x] Credentials and Experience section
- [x] Skills section with neon ripple effects
- [x] Blog section with static articles
- [x] VHS glitch effect
- [x] Navigation with scroll-to-section
- [x] Footer with social links (GitHub, LinkedIn, HuggingFace, Email)
- [x] Upgraded to full-stack with database and authentication

## Blog Management System
- [x] Create blog posts database schema
- [x] Create blog admin page for writing posts
- [ ] Implement rich text editor for blog posts
- [x] Add file/document upload functionality (S3)
- [x] Add image upload for blog posts
- [ ] Add video embed support
- [x] Create blog post CRUD operations
- [x] Protect admin routes with authentication
- [x] Update blog listing to fetch from database
- [x] Update blog post detail to fetch from database

## UI Improvements
- [x] Add admin login button in footer next to copyright

## Infrastructure & Deployment
- [x] Create Terraform main configuration for AWS Amplify
- [x] Create RDS MySQL database configuration
- [x] Create S3 bucket for file uploads
- [x] Create IAM roles and policies
- [x] Create VPC and security groups
- [x] Create environment variables configuration
- [x] Create deployment documentation

## Zoltar RAG Fortune Teller Feature
- [x] Design database schema for knowledge base documents
- [x] Create document chunks table for RAG retrieval
- [x] Create conversation history table
- [x] Build document upload and processing API
- [x] Implement RAG query system with LLM integration
- [x] Create animated Zoltar character with 1980s heavy metal style
- [x] Build chat interface with typing animations
- [x] Add admin interface for document management
- [x] Implement strict guardrails (no hallucination)
- [x] Update Terraform for vector database support
- [x] Write tests for RAG functionality

## Rename Zoltar to The Oracle
- [x] Rename database tables from zoltar_* to oracle_*
- [x] Update all code references from Zoltar to The Oracle
- [x] Update UI text and component names
- [x] Update tests

## Voice Synthesis for The Oracle
- [x] Add text-to-speech API endpoint for Oracle responses
- [x] Integrate audio playback in TheOracle component
- [x] Configure deep, sage-like voice (Dumbledore style)

## Voice Enhancements
- [x] Add mystical pronunciation effects (pauses, pitch variation, slower speech, mystical language)

## Bug Fixes
- [x] Fix TTS API failure for Oracle voice synthesis (switched to Web Speech API)
- [x] Fix database schema error for sourceChunkIds column type
- [x] Fix database content column size for long messages (changed to LONGTEXT)
- [x] Fix role enum missing 'oracle' value (was still 'zoltar' in database)

## Voice Adjustments
- [x] Reduce dramatic pauses in Oracle voice for more natural speech

## Admin Panel Improvements
- [x] Add toggle switch in Blog Admin header to switch between blog and Oracle knowledge base editor

## Oracle Knowledge Source Integration
- [x] Fix Oracle to properly connect to knowledge base database
- [x] Add LinkedIn profile as primary knowledge source
- [x] Implement fallback logic (LinkedIn first, then database)

## OpenAI Integration
- [x] Install OpenAI SDK
- [x] Add OPENAI_API_KEY to environment variables (server-side only)
- [x] Update RAG to use OpenAI API instead of Manus LLM
- [x] Ensure no hardcoded keys or PII
- [x] Configure API key and test with OpenAI
- [x] Fix SDK baseURL issue for service account tokens

## Oracle Voice Improvements
- [x] Remove special characters from spoken text (asterisks, markdown formatting, etc.)

## Oracle Response Optimization
- [x] Limit Oracle responses to maximum 200 tokens

## Oracle Knowledge Sources
- [x] Add website content as reference source with equal weight to LinkedIn

## Dynamic Website Content Scraping
- [x] Implement blog post scraping for Oracle
- [x] Implement project page scraping for Oracle
- [x] Integrate scraped content into RAG system

## Comprehensive Website Scraping for Oracle
- [x] Scrape all blog posts with full content
- [x] Scrape blog attachments (images, documents, videos)
- [x] Scrape case studies and project pages
- [x] Scrape all navigable pages (home, projects, credentials, contact)
- [x] Add PII and secret filtering
- [x] Integrate full website content into Oracle RAG

## Project Admin Page
- [x] Create Project Admin page mirroring Blog Admin functionality
- [x] Add "Projects" navigation button to Blog Admin page (like Oracle Knowledge button)
- [x] Add route for /admin/projects in App.tsx
- [x] Test Project Admin CRUD operations
- [x] Fix Oracle not finding database information (cache issue resolved)

## AWS Amplify Production Deployment
- [x] Audit codebase for build errors and TypeScript issues
- [x] Create amplify.yml build specification
- [x] Configure production environment variables
- [x] Ensure proper build output structure
- [x] Update Terraform document for AWS alignment
- [x] Test production build locally (pnpm build successful)
- [x] Verify all database connections work
- [x] Verify Oracle functionality works
- [x] Final checkpoint for deployment

## Full AWS Independence Refactoring
- [x] Audit all Manus-specific dependencies in codebase
- [x] Replace Manus OAuth with simple password-based admin auth
- [x] Replace Manus LLM wrapper (invokeLLM) with direct OpenAI SDK (already using direct SDK)
- [x] Remove Manus-specific environment variables
- [x] Create standalone server/auth.ts, server/context.ts, server/trpc.ts
- [x] Update storage.ts to use AWS S3 SDK directly
- [x] Update Terraform for standalone auth (ADMIN_PASSWORD)
- [x] Test authentication flow works without Manus
- [x] Test Oracle LLM calls work with direct OpenAI
- [x] Create AWS_DEPLOYMENT.md for AWS-only deployment
- [x] Final verification of all functionality (all 45 tests passing)
