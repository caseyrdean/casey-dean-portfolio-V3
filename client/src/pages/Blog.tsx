import { Link } from "wouter";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blog";

/* Design Philosophy: Neon Apocalypse - Cyberpunk Metal Fusion
 * Dark theme with electric cyan, magenta, and toxic green neon accents
 * Blog listing with card hover effects and neon borders
 */

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block border border-primary/50 bg-primary/10 px-4 py-2 backdrop-blur-sm mb-6">
              <span className="text-xs font-subhead tracking-widest text-primary uppercase">
                Thoughts & Insights
              </span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">THE</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                BLOG
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground font-body max-w-2xl">
              Technical deep-dives, architecture patterns, and lessons learned from building 
              enterprise cloud and AI solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-8">
            {blogPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article 
                  className="relative border border-border/50 bg-card/30 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/50 hover:bg-card/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Neon glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5" />
                  </div>
                  
                  {/* Featured badge */}
                  {post.featured && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-secondary/20 border border-secondary/50">
                      <span className="text-xs font-subhead tracking-wider text-secondary uppercase">
                        Featured
                      </span>
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-mono">
                          {new Date(post.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-mono">{post.readTime}</span>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                      {post.title}
                    </h2>
                    
                    {/* Excerpt */}
                    <p className="text-muted-foreground font-body mb-6 max-w-3xl">
                      {post.excerpt}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map(tag => (
                        <span 
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-mono border border-primary/30 text-primary/80 bg-primary/5"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Read more */}
                    <div className="flex items-center gap-2 text-primary font-subhead text-sm tracking-wider uppercase">
                      <span>Read Article</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50 group-hover:border-primary transition-colors duration-300" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50 group-hover:border-primary transition-colors duration-300" />
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
