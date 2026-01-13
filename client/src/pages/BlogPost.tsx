import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Calendar, Clock, Tag, Share2, Linkedin, Twitter, Loader2 } from "lucide-react";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getBlogPost, blogPosts } from "@/data/blog";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

/* Design Philosophy: Neon Apocalypse - Cyberpunk Metal Fusion
 * Dark theme with electric cyan, magenta, and toxic green neon accents
 * Article page with markdown rendering and neon accents
 */

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  
  // Try to fetch from database first
  const { data: dbPost, isLoading, error } = trpc.blog.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  
  // Fall back to static data if not in database
  const staticPost = getBlogPost(slug || "");
  
  // Use database post if available, otherwise static
  const post = dbPost ? {
    id: dbPost.id.toString(),
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt || '',
    date: dbPost.publishedAt?.toISOString() || dbPost.createdAt.toISOString(),
    readTime: dbPost.readTime || '5 min read',
    tags: (dbPost.tags as string[]) || [],
    category: dbPost.category || 'General',
    content: dbPost.content,
  } : staticPost;

  useEffect(() => {
    if (!isLoading && !post) {
      setLocation("/blog");
    }
    window.scrollTo(0, 0);
  }, [post, setLocation, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  // Get related posts (excluding current) - only from static for now
  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/3 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          {/* Back link */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-subhead text-sm tracking-wider uppercase">Back to Blog</span>
          </Link>
          
          <div className="max-w-4xl">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-mono">
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
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
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {post.title}
              </span>
            </h1>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
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
            )}
            
            {/* Share buttons */}
            <div className="flex items-center gap-4 pb-8 border-b border-border/50">
              <span className="text-sm text-muted-foreground font-subhead tracking-wider uppercase">Share:</span>
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-primary/30 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-primary/30 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </a>
              <button 
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="w-10 h-10 border border-primary/30 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <Share2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl">
            <article className="prose prose-invert prose-lg max-w-none blog-content">
              <Streamdown>{post.content}</Streamdown>
            </article>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 border-t border-border/50">
          <div className="container">
            <h2 className="font-display text-2xl font-bold mb-8 text-foreground">
              More <span className="text-primary">Articles</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group block"
                >
                  <article className="relative border border-border/50 bg-card/30 backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/50 hover:bg-card/50 h-full">
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <span className="font-mono">
                        {new Date(relatedPost.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="font-mono">{relatedPost.readTime}</span>
                    </div>
                    
                    <h3 className="font-display text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                      {relatedPost.title}
                    </h3>
                    
                    <p className="text-muted-foreground font-body text-sm">
                      {relatedPost.excerpt}
                    </p>
                    
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/50 group-hover:border-primary transition-colors duration-300" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/50 group-hover:border-primary transition-colors duration-300" />
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
