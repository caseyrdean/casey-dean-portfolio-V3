/* Design Philosophy: Neon Apocalypse Project Detail Page
 * Detailed case study with challenge, solution, results
 * Downloadable architecture documents, angular layouts
 */

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const [, params] = useRoute("/project/:slug");
  const { data: project, isLoading } = trpc.project.bySlug.useQuery(
    { slug: params?.slug || "" },
    { enabled: !!params?.slug }
  );
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!project) {
    return <NotFound />;
  }

  const technologies = (project.technologies as string[]) || [];
  const results = (project.results as string[]) || [];
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden pt-20">
        {/* Background image */}
        <div className="absolute inset-0">
          {project.image ? (
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background"></div>
        </div>
        
        {/* Scanline effect */}
        <div className="absolute inset-0 scanlines opacity-20"></div>
        
        {/* Content */}
        <div className="container relative z-10 pb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-subhead tracking-wider text-primary hover:text-primary/80 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO PROJECTS
          </Link>
          
          <div className="max-w-4xl space-y-6">
            <div className="inline-block border border-accent/50 bg-accent/10 px-4 py-2 backdrop-blur-sm">
              <span className="text-xs font-subhead tracking-widest text-accent uppercase">
                {project.category}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display text-foreground leading-tight">
              {project.title}
            </h1>
            
            <p className="text-xl md:text-2xl font-subhead text-secondary">
              {project.subtitle}
            </p>
          </div>
        </div>
        
        {/* Diagonal bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background diagonal-slash-reverse"></div>
      </section>
      
      {/* Content Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Overview */}
            {project.description && (
              <div className="space-y-6">
                <h2 className="text-3xl font-display text-primary">OVERVIEW</h2>
                <p className="text-lg font-body text-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}
            
            {/* Challenge */}
            {project.challenge && (
              <div className="border-l-4 border-secondary pl-8 space-y-6">
                <h2 className="text-3xl font-display text-secondary">THE CHALLENGE</h2>
                <p className="text-base font-body text-muted-foreground leading-relaxed">
                  {project.challenge}
                </p>
              </div>
            )}
            
            {/* Solution */}
            {project.solution && (
              <div className="border border-primary/30 bg-card p-8 space-y-6">
                <h2 className="text-3xl font-display text-primary">THE SOLUTION</h2>
                <p className="text-base font-body text-foreground leading-relaxed">
                  {project.solution}
                </p>
              </div>
            )}
            
            {/* Technologies */}
            {technologies.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-display text-accent">TECHNOLOGIES</h2>
                <div className="flex flex-wrap gap-3">
                  {technologies.map((tech, i) => (
                    <div 
                      key={i}
                      className="border border-primary/30 bg-card px-4 py-2 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                    >
                      <span className="text-sm font-subhead tracking-wider text-foreground">
                        {tech}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-display text-accent">RESULTS & IMPACT</h2>
                <div className="grid gap-4">
                  {results.map((result, i) => (
                    <div 
                      key={i}
                      className="flex items-start gap-4 border-l-2 border-accent/50 pl-6 py-3 hover:border-accent transition-colors group"
                    >
                      <div className="w-8 h-8 border border-accent/50 bg-background flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                        <span className="text-xs font-display text-accent">{i + 1}</span>
                      </div>
                      <p className="text-base font-body text-foreground leading-relaxed pt-1">
                        {result}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Download Section */}
            {project.downloadUrl && (
              <div className="border-2 border-primary bg-primary/5 p-8 space-y-6">
                <div className="flex items-start justify-between gap-8">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-display text-primary">ARCHITECTURE DOCUMENT</h2>
                    <p className="text-sm font-body text-muted-foreground leading-relaxed">
                      Download the complete architecture design document including diagrams, 
                      infrastructure specifications, and implementation details.
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    className="font-subhead tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary neon-border flex-shrink-0"
                    onClick={() => {
                      window.open(project.downloadUrl!, '_blank');
                    }}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    DOWNLOAD PDF
                  </Button>
                </div>
              </div>
            )}
            
            {/* Navigation */}
            <div className="flex justify-center pt-8">
              <Link href="/" className="inline-block">
                <Button 
                  variant="outline"
                  size="lg"
                  className="font-subhead tracking-wider border-2 border-secondary text-secondary hover:bg-secondary/10"
                  asChild
                >
                  <span>
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    BACK TO ALL PROJECTS
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
