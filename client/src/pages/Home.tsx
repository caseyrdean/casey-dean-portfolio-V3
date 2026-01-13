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
                  AWS Solutions Architect • Cloud Infrastructure Expert
                </span>
              </div>
              
              <h1 className="text-7xl md:text-9xl font-display text-foreground leading-none tracking-tight">
                CASEY
                <br />
                <span className="chrome-text">DEAN</span>
              </h1>
              
              <p className="text-xl md:text-2xl font-subhead text-muted-foreground max-w-2xl leading-relaxed">
                Architecting scalable cloud solutions that transform enterprise infrastructure. 
                Specializing in AWS migration, serverless architectures, and zero-trust security.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <a href="#projects">
                  <Button 
                    size="lg" 
                    className="font-subhead tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary neon-border group"
                  >
                    VIEW PROJECTS
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <a href="#contact">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="font-subhead tracking-wider border-2 border-secondary text-secondary hover:bg-secondary/10"
                  >
                    GET IN TOUCH
                  </Button>
                </a>
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
              <Link key={project.id} href={`/project/${project.slug}`}>
                <a className="group block relative overflow-hidden border border-primary/30 bg-card hover:border-primary transition-all duration-500">
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
                </a>
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
              AWARDS & PUBLICATIONS
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Awards */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-display text-foreground">AWARDS</h3>
              </div>
              
              {[
                {
                  year: "2025",
                  title: "AWS Hero",
                  org: "Amazon Web Services",
                  description: "Recognized for outstanding contributions to the AWS community"
                },
                {
                  year: "2024",
                  title: "Cloud Architect of the Year",
                  org: "Cloud Computing Association",
                  description: "Excellence in enterprise cloud architecture design"
                },
                {
                  year: "2023",
                  title: "Innovation Award",
                  org: "TechCrunch Disrupt",
                  description: "Serverless architecture innovation in fintech"
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
            </div>
            
            {/* Publications */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <BookOpen className="w-8 h-8 text-secondary" />
                <h3 className="text-2xl font-display text-foreground">PUBLICATIONS</h3>
              </div>
              
              {[
                {
                  year: "2025",
                  title: "Serverless Architectures: A Practical Guide",
                  publisher: "O'Reilly Media",
                  type: "Book"
                },
                {
                  year: "2024",
                  title: "Zero Trust Security in AWS",
                  publisher: "AWS Architecture Blog",
                  type: "Article"
                },
                {
                  year: "2024",
                  title: "Cost Optimization Strategies for EKS",
                  publisher: "InfoQ",
                  type: "Article"
                },
                {
                  year: "2023",
                  title: "Migrating Legacy Systems to the Cloud",
                  publisher: "IEEE Cloud Computing",
                  type: "Paper"
                }
              ].map((pub, i) => (
                <div key={i} className="border border-primary/30 bg-card p-6 hover:border-secondary transition-colors group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-subhead tracking-widest text-secondary uppercase">{pub.type}</span>
                      <span className="text-xs font-body text-muted-foreground">{pub.year}</span>
                    </div>
                    <h4 className="text-lg font-display text-foreground group-hover:text-secondary transition-colors">
                      {pub.title}
                    </h4>
                    <p className="text-sm font-body text-muted-foreground">
                      {pub.publisher}
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
