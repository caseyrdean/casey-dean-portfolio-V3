/**
 * Migration script to insert static blog posts from client/src/data/blog.ts into the database
 * Run with: node server/migrate-blog-posts.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Static blog posts from client/src/data/blog.ts
const staticBlogPosts = [
  {
    slug: "my-journey-with-generative-ai",
    title: "My Journey with Generative AI: From Skeptic to Architect",
    excerpt: "How I went from questioning the hype around generative AI to building enterprise-grade AI solutions that transform how organizations operate.",
    date: "2025-01-10",
    readTime: "8 min read",
    tags: ["Generative AI", "AWS Bedrock", "LangGraph", "Enterprise Architecture"],
    featured: true,
    category: "AI & Architecture",
    content: `
## The Beginning: Healthy Skepticism

When ChatGPT first exploded onto the scene in late 2022, I'll admit I was skeptical. As someone who had spent years building enterprise software solutions, I'd seen plenty of "revolutionary" technologies come and go. But something felt different this time.

My first real exposure to generative AI's potential came during my work at Manus AI, where I had the opportunity to architect an AI agent platform from the ground up. What started as curiosity quickly transformed into obsession.

## The Technical Deep Dive

### Understanding the Stack

The generative AI landscape is vast, but I've found that successful enterprise implementations typically involve:

- **Foundation Models**: Working with AWS Bedrock, I've deployed solutions using Claude, Llama, and various specialized models. The key insight? No single model fits all use cases.

- **Orchestration Frameworks**: LangGraph and CrewAI have become essential tools in my arsenal. Building multi-agent systems that can reason, plan, and execute complex tasks requires sophisticated orchestration.

- **Vector Databases**: Weaviate and Pinecone have been game-changers for building RAG (Retrieval-Augmented Generation) systems that ground AI responses in organizational knowledge.

- **Model Context Protocol (MCP)**: Anthropic's MCP has opened new possibilities for building AI systems that can interact with external tools and data sources in standardized ways.

### Real-World Applications

At Jaggaer, I've been leading the development of AI-powered solutions that are transforming procurement processes. Some highlights:

**Intelligent Document Processing**: Using OCR combined with NLP models, we've built systems that can extract, classify, and validate procurement documents with unprecedented accuracy.

**Conversational AI for Procurement**: Implementing chatbots that understand complex procurement queries and can navigate enterprise systems to provide actionable insights.

**Predictive Analytics**: Leveraging GenAI to analyze spending patterns and predict future procurement needs, helping organizations optimize their supply chains.

## Lessons Learned

### 1. Start with the Problem, Not the Technology

It's tempting to implement AI for AI's sake. The most successful projects I've led started with clear business problems: "How do we reduce contract review time from weeks to hours?" or "How can we make our knowledge base actually useful?"

### 2. Governance is Non-Negotiable

Especially in regulated industries, AI governance isn't optional. At Sopheon, working on DoD FedRAMP solutions taught me that security, compliance, and auditability must be baked in from day one.

### 3. Human-in-the-Loop is Essential

The best AI systems augment human decision-making rather than replace it. Building confidence calibration and escalation paths into AI workflows has been crucial for enterprise adoption.

### 4. Infrastructure Matters

You can have the best models in the world, but without proper infrastructure—scalable compute, efficient data pipelines, robust monitoring—your AI initiative will fail. My AWS architecture experience has been invaluable here.

## The Future I'm Building Toward

I believe we're at the beginning of a fundamental shift in how software is built and used. The combination of:

- **Agentic AI**: Systems that can plan, reason, and execute multi-step tasks autonomously
- **Multimodal Understanding**: AI that can process text, images, audio, and video seamlessly
- **Enterprise Integration**: AI that works within existing security, compliance, and governance frameworks

...will create entirely new categories of software applications.

## Getting Started

For fellow architects and developers looking to dive into generative AI, here's my recommended path:

1. **Master the Fundamentals**: Understand transformer architectures, attention mechanisms, and how LLMs actually work.

2. **Build Something Real**: Theory only gets you so far. Build a RAG system, create an AI agent, deploy a fine-tuned model.

3. **Focus on Integration**: The hardest part isn't the AI—it's integrating AI capabilities into existing enterprise systems securely and reliably.

4. **Stay Current**: This field moves fast. Follow the research, experiment with new tools, and never stop learning.

## Conclusion

My journey with generative AI has been one of the most intellectually stimulating experiences of my career. From building AI agent platforms to implementing enterprise AI solutions, I've seen firsthand how this technology can transform organizations.

But we're still early. The architectures, patterns, and best practices are still being discovered. For those of us building in this space, that's what makes it exciting.

If you're working on generative AI initiatives and want to connect, reach out. I'm always eager to discuss architecture patterns, share lessons learned, and explore new possibilities.

---

*Casey Dean is an AWS Solutions Architect specializing in enterprise AI solutions and cloud architecture. Currently leading AI initiatives at Jaggaer.*
    `
  },
  {
    slug: "fedramp-cloud-architecture",
    title: "Building FedRAMP-Compliant Cloud Architectures",
    excerpt: "Lessons learned from designing and implementing cloud solutions that meet the rigorous security requirements of federal agencies.",
    date: "2024-11-15",
    readTime: "6 min read",
    tags: ["FedRAMP", "AWS", "Security", "Compliance"],
    featured: false,
    category: "Security & Compliance",
    content: `
## Introduction

Federal Risk and Authorization Management Program (FedRAMP) compliance isn't just a checkbox—it's a fundamental shift in how you approach cloud architecture. During my time at Sopheon, I led the design and implementation of DoD-grade cloud solutions that met these stringent requirements.

## Key Architectural Considerations

### 1. Security by Design

FedRAMP requires security to be embedded at every layer:

- **Network Segmentation**: Implementing strict VPC configurations with private subnets, NACLs, and security groups
- **Encryption Everywhere**: Data at rest and in transit must be encrypted using FIPS 140-2 validated modules
- **Identity Management**: Robust IAM policies with least-privilege access and MFA enforcement

### 2. Continuous Monitoring

The continuous monitoring requirement means building comprehensive observability:

- CloudTrail for API auditing
- CloudWatch for metrics and alerting
- GuardDuty for threat detection
- Security Hub for centralized security findings

### 3. Incident Response

Having documented, tested incident response procedures is mandatory. This includes:

- Automated alerting and escalation
- Forensic data collection capabilities
- Clear communication protocols

## Lessons for Enterprise Architects

Even if you're not building for federal agencies, FedRAMP principles provide an excellent framework for enterprise security architecture. The discipline required translates directly to better security posture across any organization.

---

*More detailed technical guides coming soon.*
    `
  }
];

async function migrateBlogs() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'casey_dean_portfolio',
  });

  try {
    console.log('Starting blog post migration...');
    
    for (const post of staticBlogPosts) {
      // Check if post already exists
      const [existing] = await connection.execute(
        'SELECT id FROM blog_posts WHERE slug = ?',
        [post.slug]
      );

      if (existing.length > 0) {
        console.log(`✓ Post "${post.title}" already exists, skipping...`);
        continue;
      }

      // Insert the blog post
      const [result] = await connection.execute(
        `INSERT INTO blog_posts 
         (slug, title, excerpt, content, category, tags, readTime, published, publishedAt, authorId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          post.slug,
          post.title,
          post.excerpt,
          post.content,
          post.category,
          JSON.stringify(post.tags),
          post.readTime,
          true, // published
          new Date(post.date), // publishedAt
          1 // authorId (default admin user)
        ]
      );

      console.log(`✓ Migrated: "${post.title}" (ID: ${result.insertId})`);
    }

    console.log('\n✓ Blog post migration completed successfully!');
    console.log(`Total posts migrated: ${staticBlogPosts.length}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrateBlogs();
