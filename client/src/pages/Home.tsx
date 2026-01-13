/* Design Philosophy: Neon Apocalypse Home Page
 * Dramatic hero with diagonal slash, project grid with hover reveals
 * Angular layouts, neon accents, glitch effects
 */

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { projects } from "@/data/projects";
import { Link } from "wouter";
import { Award, BookOpen, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Dramatic with diagonal slash */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img 
            src="/images/hero-main.png" 
            alt="Cloud Architecture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background"></div>
        </div>
        
        {/* Scanline effect */}
        <div className="absolute inset-0 scanlines opacity-30"></div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(oklch(0.7 0.3 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.3 195) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}></div>
        
        {/* Content */}
        <div className="container relative z-10">
          <div className="max-w-4xl">
            <div className="space-y-6">
              <div className="inline-block border border-primary/50 bg-primary/10 px-4 py-2 backdrop-blur-sm">
                <span className="text-xs font-subhead tracking-widest text-primary uppercase">
                  AWS Solutions Architect • Cloud Infrastructure and AI Obsessed
                </span>
              </div>
              
              <h1 className="text-7xl md:text-9xl font-display text-foreground leading-none tracking-tight">
                CASEY
                <br />
                <span className="chrome-text">DEAN</span>
              </h1>
              
              <p className="text-xl md:text-2xl font-subhead text-muted-foreground max-w-2xl leading-relaxed">
                AWS Solutions Architect | Enterprise Software Implementation | Scaling Innovation | Digital Strategist | AI Architect | Cloud Architect | AI Strategy | Ideation | Design Thinking | Veteran | Extreme Ownership
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="font-subhead tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary neon-border group"
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  VIEW PROJECTS
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="font-subhead tracking-wider border-2 border-secondary text-secondary hover:bg-secondary/10"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  GET IN TOUCH
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Diagonal bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-background diagonal-slash-reverse"></div>
      </section>
      
      {/* Projects Section */}
      <section id="projects" className="py-32 relative">
        <div className="container">
          <div className="mb-16 space-y-4">
            <div className="inline-block border border-secondary/50 bg-secondary/10 px-4 py-2">
              <span className="text-xs font-subhead tracking-widest text-secondary uppercase">
                Featured Work
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display text-foreground">
              CASE STUDIES
            </h2>
            <p className="text-lg font-body text-muted-foreground max-w-2xl">
              Real-world cloud architecture projects delivering measurable business impact
            </p>
          </div>
          
          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <Link key={project.id} href={`/project/${project.slug}`} className="group block relative overflow-hidden border border-primary/30 bg-card hover:border-primary transition-all duration-500">
                  {/* Project Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                    
                    {/* Hover overlay with details */}
                    <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <p className="text-sm font-body text-background leading-relaxed line-clamp-4">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-background">
                          <span className="text-sm font-subhead tracking-wider uppercase">View Case Study</span>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Project Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-subhead tracking-widest text-accent uppercase">
                        {project.category}
                      </span>
                      <span className="text-xs font-body text-muted-foreground">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="text-2xl font-display text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm font-subhead text-muted-foreground tracking-wide">
                      {project.subtitle}
                    </p>
                  </div>
                  
                  {/* Neon accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Awards & Publications Section */}
      <section id="awards" className="py-32 relative border-t border-primary/30">
        <div className="container">
          <div className="mb-16 space-y-4">
            <div className="inline-block border border-accent/50 bg-accent/10 px-4 py-2">
              <span className="text-xs font-subhead tracking-widest text-accent uppercase">
                Recognition
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display text-foreground">
              CREDENTIALS & EXPERIENCE
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Awards */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-display text-foreground">CREDENTIALS</h3>
              </div>
              
              {[
                {
                  year: "2025",
                  title: "AWS Solutions Architect - Associate",
                  org: "Amazon Web Services",
                  description: "SAA-C03 certification demonstrating expertise in designing distributed systems on AWS. Valid through November 2028."
                },
                {
                  year: "2019",
                  title: "Successful Startup Exit",
                  org: "Elegant Solutions",
                  description: "Founded healthcare IoT company that was acquired after proving 65% improvement in hospital survey participation."
                },
                {
                  year: "2016",
                  title: "BBA Entrepreneurship",
                  org: "University of Wisconsin - Whitewater",
                  description: "Bachelor of Business Administration with focus on Entrepreneurship."
                }
              ].map((award, i) => (
                <div key={i} className="border-l-2 border-accent/50 pl-6 pb-6 relative group hover:border-accent transition-colors">
                  <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] border-2 border-accent bg-background rounded-full group-hover:bg-accent transition-colors"></div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-subhead tracking-widest text-accent">{award.year}</span>
                      <span className="text-xs font-body text-muted-foreground">{award.org}</span>
                    </div>
                    <h4 className="text-xl font-display text-foreground">{award.title}</h4>
                    <p className="text-sm font-body text-muted-foreground leading-relaxed">
                      {award.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Skills Section */}
              <div className="mt-12 pt-8 border-t border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="text-xl font-display text-foreground">SKILLS</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    // AWS Core Services
                    { name: "EC2", color: "primary" },
                    { name: "S3", color: "secondary" },
                    { name: "RDS", color: "accent" },
                    { name: "Lambda", color: "primary" },
                    { name: "VPC", color: "secondary" },
                    { name: "CloudFront", color: "accent" },
                    { name: "Route 53", color: "primary" },
                    { name: "APIs", color: "secondary" },
                    { name: "IAM", color: "accent" },
                    { name: "CloudTrail", color: "primary" },
                    { name: "CloudWatch", color: "secondary" },
                    { name: "Systems Manager", color: "accent" },
                    // IaC & DevOps
                    { name: "CloudFormation", color: "primary" },
                    { name: "CDK", color: "secondary" },
                    { name: "Terraform", color: "accent" },
                    { name: "GitHub", color: "primary" },
                    { name: "Jenkins", color: "secondary" },
                    { name: "CodePipeline", color: "accent" },
                    // Security
                    { name: "Cognito", color: "primary" },
                    { name: "SAML", color: "secondary" },
                    { name: "RBAC", color: "accent" },
                    { name: "KMS", color: "primary" },
                    { name: "TLS", color: "secondary" },
                    { name: "FedRAMP", color: "accent" },
                    { name: "Zero Trust", color: "primary" },
                    { name: "CAF", color: "secondary" },
                    // Data & Analytics
                    { name: "DynamoDB", color: "accent" },
                    { name: "Redshift", color: "primary" },
                    { name: "Athena", color: "secondary" },
                    { name: "Glue", color: "accent" },
                    { name: "Data Modeling", color: "primary" },
                    { name: "QuickSight", color: "secondary" },
                    // APIs & Integration
                    { name: "REST", color: "accent" },
                    { name: "OAuth2", color: "primary" },
                    { name: "JWT", color: "secondary" },
                    { name: "OpenAPI", color: "accent" },
                    { name: "Postman", color: "primary" },
                    // AI/ML
                    { name: "Bedrock", color: "secondary" },
                    { name: "SageMaker", color: "accent" },
                    { name: "Gradio", color: "primary" },
                    // Methodologies
                    { name: "Agile", color: "secondary" },
                    { name: "OKRs", color: "accent" },
                    { name: "Jira", color: "primary" },
                    // Languages
                    { name: "Python", color: "secondary" },
                    { name: "TypeScript", color: "accent" },
                    { name: "Bash", color: "primary" },
                    { name: "YAML", color: "secondary" },
                    { name: "JSON", color: "accent" },
                    { name: "HCL", color: "primary" },
                    { name: "SQL", color: "secondary" },
                    { name: "JavaScript", color: "accent" },
                    // Frontend
                    { name: "React", color: "primary" },
                    { name: "Next.js", color: "secondary" },
                    { name: "Tailwind", color: "accent" },
                    // AI Agents & Frameworks
                    { name: "Anthropic MCP", color: "primary" },
                    { name: "AutoGen", color: "secondary" },
                    { name: "LangGraph", color: "accent" },
                    { name: "CrewAI", color: "primary" },
                    { name: "OpenAI SDK", color: "secondary" },
                    // AI/NLP
                    { name: "OCR", color: "accent" },
                    { name: "NLP", color: "primary" },
                    { name: "GenAI", color: "secondary" },
                    { name: "HuggingFace", color: "accent" },
                    // Vector DBs
                    { name: "Weaviate", color: "primary" },
                    { name: "Pinecone", color: "secondary" },
                    { name: "OpenAI API", color: "accent" },
                  ].map((skill, i) => (
                    <span 
                      key={i} 
                      className={`skill-tag px-3 py-1 text-xs font-subhead tracking-wider border bg-background/50 backdrop-blur-sm transition-all duration-500 hover:scale-110 cursor-default ${
                        skill.color === 'primary' ? 'border-primary/50 text-primary hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_15px_rgba(0,255,255,0.5)]' :
                        skill.color === 'secondary' ? 'border-secondary/50 text-secondary hover:bg-secondary/20 hover:border-secondary hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]' :
                        'border-accent/50 text-accent hover:bg-accent/20 hover:border-accent hover:shadow-[0_0_15px_rgba(0,255,128,0.5)]'
                      }`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Experience Highlights */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <BookOpen className="w-8 h-8 text-secondary" />
                <h3 className="text-2xl font-display text-foreground">EXPERIENCE</h3>
              </div>
              
              {[
                {
                  year: "06/2024 - Present",
                  title: "Solutions Consultant and COE Lead",
                  company: "Jaggaer",
                  type: "Current",
                  summary: "Translating complex business requirements into scalable, secure system designs across discovery, configuration, deployment, and post-go-live transition. Acting as primary architectural advisor to client stakeholders, guiding trade-off decisions across functionality, integrations, and compliance constraints."
                },
                {
                  year: "05/2022 - 06/2024",
                  title: "Senior Innovation Management Consultant",
                  company: "Sopheon",
                  type: "Federal",
                  summary: "Drove design and deployment of Portfolio Management solutions across $15M+ ARR in federal contracts. Delivered 12 sensitive DoD solutions by guiding secure, compliance-focused technical decisions aligned with FedRAMP standards."
                },
                {
                  year: "02/2019 - 05/2022",
                  title: "Research Analyst / Innovation Analyst / Founder",
                  company: "Wilde Group",
                  type: "Enterprise",
                  summary: "Coordinated cross-functional teams across product, engineering, and business groups for 4 Fortune 500 clients. Guided early architecture exploration contributing to the launch of 9 enterprise innovation initiatives."
                },
                {
                  year: "09/2018 - 06/2020",
                  title: "Lead Analyst Global Talent Acquisition Insights",
                  company: "Stryker",
                  type: "Analytics",
                  summary: "Unified cross-departmental data models in Workday to establish a centralized KPI framework. Developed Tableau-based reporting system eliminating 40+ manual reports and reducing stakeholder requests by 50%."
                },
                {
                  year: "02/2016 - 12/2018",
                  title: "Founding Partner",
                  company: "Elegant Solutions",
                  type: "Founder",
                  summary: "Led discovery sessions with over 200 ER patients and hospital staff to uncover workflow inefficiencies. Conceived and wireframed an ER platform MVP with custom IoT-based mesh network, leading to company acquisition in 2019."
                }
              ].map((exp, i) => (
                <div key={i} className="border border-primary/30 bg-card p-6 hover:border-secondary transition-colors group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-subhead tracking-widest text-secondary uppercase">{exp.type}</span>
                      <span className="text-xs font-body text-muted-foreground">{exp.year}</span>
                    </div>
                    <h4 className="text-lg font-display text-foreground group-hover:text-secondary transition-colors">
                      {exp.title}
                    </h4>
                    <p className="text-sm font-body text-primary">
                      {exp.company}
                    </p>
                    <p className="text-sm font-body text-muted-foreground leading-relaxed">
                      {exp.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: `linear-gradient(oklch(0.7 0.3 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.3 195) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </section>
      
      <Footer />
    </div>
  );
}
