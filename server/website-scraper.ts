/**
 * Website content scraper for The Oracle RAG system
 * Dynamically fetches blog posts and website content
 */

// Cache for website data (refresh every hour)
let websiteCache: { data: string | null; timestamp: number } = { data: null, timestamp: 0 };
const WEBSITE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch website content including all published blog posts
 */
export async function fetchWebsiteContent(): Promise<string | null> {
  const now = Date.now();
  
  if (websiteCache.data && (now - websiteCache.timestamp) < WEBSITE_CACHE_TTL) {
    console.log('[RAG] Using cached website content');
    return websiteCache.data;
  }
  
  try {
    console.log('[RAG] Fetching website content...');
    
    // Import here to avoid circular dependencies
    const { getPublishedBlogPostsForOracle } = await import('./db');
    
    // Fetch all published blog posts
    const blogPosts = await getPublishedBlogPostsForOracle();
    
    let websiteContent = 'WEBSITE CONTENT: Casey Dean Portfolio\n\n';
    websiteContent += 'This website showcases Casey Dean professional work, projects, and expertise.\n\n';
    
    // Add blog posts if available
    if (blogPosts && blogPosts.length > 0) {
      websiteContent += `BLOG POSTS (${blogPosts.length} published):\n`;
      websiteContent += '='.repeat(50) + '\n\n';
      
      for (const post of blogPosts) {
        websiteContent += `BLOG POST: ${post.title}\n`;
        if (post.category) websiteContent += `Category: ${post.category}\n`;
        if (post.tags && post.tags.length > 0) websiteContent += `Tags: ${post.tags.join(', ')}\n`;
        websiteContent += `\n${post.content}\n\n`;
        websiteContent += '-'.repeat(50) + '\n\n';
      }
    } else {
      websiteContent += 'No published blog posts yet.\n\n';
    }
    
    websiteCache = { data: websiteContent, timestamp: now };
    console.log(`[RAG] Fetched website content with ${blogPosts?.length || 0} blog posts`);
    return websiteContent;
  } catch (error) {
    console.error('[RAG] Failed to fetch website content:', error);
    return null;
  }
}
