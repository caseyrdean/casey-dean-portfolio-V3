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
