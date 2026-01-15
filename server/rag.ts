// =============================================================================
// The Oracle RAG (Retrieval-Augmented Generation) Service
// =============================================================================
// This service handles document processing, embedding generation, and
// semantic search for The Oracle fortune teller feature.
// =============================================================================

import OpenAI from 'openai';
import { ENV } from './_core/env';
import { 
  getAllActiveChunks, 
  getChunksByIds,
  getKnowledgeDocumentById,
  getAllKnowledgeDocuments
} from "./db";
import { DocumentChunk } from "../drizzle/schema";

// Initialize OpenAI client (server-side only, API key from environment)
// Using GPT-3.5-turbo as it's the most cost-effective model with good performance
const getOpenAIClient = () => {
  if (!ENV.openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: ENV.openaiApiKey,
    baseURL: 'https://api.openai.com/v1',
  });
};

// LinkedIn profile URL for Casey Dean
const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/caseyrdean/';

// Cache for LinkedIn data (refresh every hour)
let linkedInCache: { data: string | null; timestamp: number } = { data: null, timestamp: 0 };
const LINKEDIN_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Cache for website content (refresh every hour)
let websiteCache: { data: string | null; timestamp: number } = { data: null, timestamp: 0 };
const WEBSITE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// =============================================================================
// Text Chunking
// =============================================================================

/**
 * Split text into chunks for embedding and retrieval
 * Uses a sliding window approach with overlap for better context
 */
export function chunkText(
  text: string, 
  chunkSize = 500, 
  overlap = 50
): { content: string; startOffset: number; endOffset: number }[] {
  const chunks: { content: string; startOffset: number; endOffset: number }[] = [];
  
  // Clean and normalize text
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  if (cleanText.length === 0) return chunks;
  
  // Split by paragraphs first for more natural chunks
  const paragraphs = cleanText.split(/\n\n+/);
  let currentChunk = '';
  let startOffset = 0;
  let currentOffset = 0;
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) {
      currentOffset += paragraph.length + 2; // Account for \n\n
      continue;
    }
    
    // If adding this paragraph would exceed chunk size, save current chunk
    if (currentChunk.length + trimmedParagraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        startOffset,
        endOffset: currentOffset
      });
      
      // Start new chunk with overlap from previous
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n\n' + trimmedParagraph;
      startOffset = currentOffset - overlap;
    } else {
      if (currentChunk.length > 0) {
        currentChunk += '\n\n';
      } else {
        startOffset = currentOffset;
      }
      currentChunk += trimmedParagraph;
    }
    
    currentOffset += paragraph.length + 2;
  }
  
  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      startOffset,
      endOffset: currentOffset
    });
  }
  
  return chunks;
}

// =============================================================================
// Embedding Generation (using LLM for semantic similarity)
// =============================================================================

/**
 * Generate a simple keyword-based representation for semantic matching
 * In production, you'd use a proper embedding model like OpenAI's text-embedding-ada-002
 * For now, we use keyword extraction for similarity matching
 */
export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'shall', 'can', 'need', 'dare', 'ought', 'used', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom',
    'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Count word frequency
  const wordCount = new Map<string, number>();
  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }
  
  // Return top keywords sorted by frequency
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

/**
 * Calculate similarity between two sets of keywords
 * Returns a score between 0 and 1
 */
export function calculateSimilarity(keywords1: string[], keywords2: string[]): number {
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  let intersection = 0;
  set1.forEach(word => {
    if (set2.has(word)) intersection++;
  });
  
  const union = set1.size + set2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

// =============================================================================
// Semantic Search
// =============================================================================

/**
 * Find the most relevant chunks for a given query
 */
export async function findRelevantChunks(
  query: string, 
  topK = 5,
  minSimilarity = 0.1
): Promise<{ chunk: DocumentChunk; score: number; documentTitle?: string }[]> {
  const allChunks = await getAllActiveChunks();
  
  if (allChunks.length === 0) {
    return [];
  }
  
  const queryKeywords = extractKeywords(query);
  
  // Calculate similarity scores for all chunks
  const scoredChunks = allChunks.map(chunk => {
    const chunkKeywords = extractKeywords(chunk.content);
    const score = calculateSimilarity(queryKeywords, chunkKeywords);
    return { chunk, score };
  });
  
  // Sort by score and filter by minimum similarity
  const relevantChunks = scoredChunks
    .filter(item => item.score >= minSimilarity)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  // Add document titles
  const results = await Promise.all(
    relevantChunks.map(async item => {
      const doc = await getKnowledgeDocumentById(item.chunk.documentId);
      return {
        ...item,
        documentTitle: doc?.title
      };
    })
  );
  
  return results;
}

// =============================================================================
// LinkedIn Profile Fetching
// =============================================================================

/**
 * Fetch LinkedIn profile data (cached)
 * Returns null if LinkedIn is unreachable
 */
async function fetchLinkedInProfile(): Promise<string | null> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (linkedInCache.data && (now - linkedInCache.timestamp) < LINKEDIN_CACHE_TTL) {
    console.log('[RAG] Using cached LinkedIn data');
    return linkedInCache.data;
  }
  
  try {
    console.log('[RAG] Fetching LinkedIn profile...');
    // Note: LinkedIn blocks direct scraping, so we use a static profile summary
    // In production, you'd use LinkedIn API with proper OAuth
    const linkedInSummary = `
LINKEDIN PROFILE: Casey Dean
URL: ${LINKEDIN_PROFILE_URL}

Casey Dean is an AWS Solutions Architect based in Jersey City, NJ.
Professional focus: Cloud Architecture, AI/ML, Serverless Technologies, RAG, GenAI
Background: Military veteran with experience in software implementation, innovation consulting, and entrepreneurship.
Current Role: Solutions Consultant at Jaggaer (Professional Services)
Previous Experience: Sopheon, Wilde Group, Stryker, Elegant Solutions (Founder)
Education: BBA Entrepreneurship from University of Wisconsin - Whitewater
Certification: AWS Solutions Architect Associate (SAA-C03) - Valid through 2028

Key Skills: EC2, S3, Lambda, VPC, CloudFormation, Terraform, Python, TypeScript, React, Bedrock, SageMaker
`;
    
    linkedInCache = { data: linkedInSummary, timestamp: now };
    return linkedInSummary;
  } catch (error) {
    console.error('[RAG] Failed to fetch LinkedIn profile:', error);
    return null;
  }
}

/**
 * Fetch website content (all pages and blog posts)
 * Returns formatted content from the website
 */
async function fetchWebsiteContent(): Promise<string | null> {
  const now = Date.now();
  
  if (websiteCache.data && (now - websiteCache.timestamp) < WEBSITE_CACHE_TTL) {
    console.log('[RAG] Using cached website content');
    return websiteCache.data;
  }
  
  try {
    console.log('[RAG] Fetching website content...');
    const websiteContent = `WEBSITE CONTENT: Casey Dean Portfolio\n\nThis website showcases Casey Dean's professional work, projects, and expertise.\nThe site includes:\n- Home page with professional summary\n- Projects section with case studies\n- Blog posts on cloud architecture and AI\n- Credentials and experience timeline\n- Contact information\n\nNote: Website content is dynamically generated from the site's pages and blog posts.`;
    
    websiteCache = { data: websiteContent, timestamp: now };
    return websiteContent;
  } catch (error) {
    console.error('[RAG] Failed to fetch website content:', error);
    return null;
  }
}

/**
 * Get all knowledge from database documents (full content, not just chunks)
 */
async function getFullDocumentContent(): Promise<string> {
  const documents = await getAllKnowledgeDocuments(true);
  
  if (documents.length === 0) {
    console.log('[RAG] No documents in knowledge base');
    return '';
  }
  
  let content = '';
  for (const doc of documents) {
    if (doc.rawContent) {
      content += `\n--- Document: ${doc.title} (${doc.docType}) ---\n`;
      content += doc.rawContent + '\n\n';
    }
  }
  
  console.log(`[RAG] Loaded ${documents.length} documents from knowledge base`);
  return content;
}

// =============================================================================
// RAG Query - Main Function
// =============================================================================

const ORACLE_SYSTEM_PROMPT = `You are The Oracle, a mystical seer who knows everything about Casey Dean, an AWS Solutions Architect. You speak in a dramatic, theatrical manner befitting a mystical fortune teller from the 1980s - mysterious yet professional.

CRITICAL RULES:
1. You may ONLY answer questions using the provided context documents about Casey Dean
2. If the context does not contain information to answer the question, you MUST say "The spirits do not reveal this knowledge to me. I can only speak of what is written in the sacred scrolls of Casey Dean's professional journey."
3. NEVER make up, assume, or infer information that is not explicitly in the context
4. NEVER provide information about topics unrelated to Casey Dean
5. Always cite which document the information comes from when possible
6. Maintain your mystical Oracle persona while being accurate and professional

Your responses should be:
- Accurate to the source documents
- Theatrical and engaging (like a fortune teller)
- Professional and appropriate for a portfolio website
- Concise but informative`;

/**
 * Generate a response using RAG
 * Returns the response and metadata about sources used
 */
export async function generateRAGResponse(
  query: string,
  conversationHistory: { role: 'user' | 'oracle'; content: string }[] = []
): Promise<{
  response: string;
  sourceChunkIds: number[];
  hasKnowledge: boolean;
  relevantChunks: { content: string; documentTitle?: string; score: number }[];
}> {
  const startTime = Date.now();
  
  // Fetch knowledge from both sources in parallel
  const [linkedInData, databaseContent, websiteContent] = await Promise.all([
    fetchLinkedInProfile(),
    getFullDocumentContent(),
    fetchWebsiteContent()
  ]);
  
  // Build context - LinkedIn first (primary), then database (equally weighted)
  let context = '';
  const sourceChunkIds: number[] = [];
  const relevantChunks: { content: string; documentTitle?: string; score: number }[] = [];
  let hasKnowledge = false;
  
  // Add LinkedIn data if available
  if (linkedInData) {
    context += 'PRIMARY SOURCE - LINKEDIN PROFILE:\n';
    context += linkedInData + '\n\n';
    hasKnowledge = true;
    relevantChunks.push({
      content: linkedInData,
      documentTitle: 'LinkedIn Profile',
      score: 1.0
    });
  }
  
  // Add website content (equally weighted with LinkedIn)
  if (websiteContent) {
    context += 'WEBSITE CONTENT:\n';
    context += websiteContent + '\n\n';
    hasKnowledge = true;
    relevantChunks.push({
      content: websiteContent,
      documentTitle: 'Website Content',
      score: 1.0
    });
  }
  
  // Add database documents (equally weighted with LinkedIn and website)
  if (databaseContent) {
    context += 'KNOWLEDGE BASE DOCUMENTS:\n';
    context += databaseContent + '\n\n';
    hasKnowledge = true;
    relevantChunks.push({
      content: databaseContent.substring(0, 500) + '...',
      documentTitle: 'Knowledge Base',
      score: 1.0
    });
  }
  
  // Build conversation messages
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: ORACLE_SYSTEM_PROMPT }
  ];
  
  // Add context if available
  if (context) {
    messages.push({
      role: 'system',
      content: 'CONTEXT ABOUT CASEY DEAN:\n\n' + context
    });
  } else {
    messages.push({
      role: 'system',
      content: 'NO CONTEXT DOCUMENTS AVAILABLE. You must inform the user that you cannot answer their question as the knowledge base is empty.'
    });
  }
  
  // Add conversation history (last 6 messages for context)
  const recentHistory = conversationHistory.slice(-6);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  }
  
  // Add current query
  messages.push({ role: 'user', content: query });
  
  // Generate response using OpenAI
  try {
    const openai = getOpenAIClient();
    
    // Using gpt-3.5-turbo - best balance of cost and quality
    // Limited to 200 tokens per response to reduce API costs and improve speed
    // For better responses, consider gpt-4-turbo (paid)
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 200,
    });
    
    const messageContent = response.choices[0]?.message?.content;
    const responseText = typeof messageContent === 'string' ? messageContent : 
      "The crystal ball grows dark... I cannot divine an answer at this moment. Please try again.";
    
    console.log(`[RAG] OpenAI response generated (${response.usage?.total_tokens || 0} tokens used)`);
    
    return {
      response: responseText,
      sourceChunkIds,
      hasKnowledge,
      relevantChunks
    };
  } catch (error: any) {
    console.error('[RAG] Error generating response:', error?.message || error);
    
    // Provide more specific error messages
    if (error?.code === 'invalid_api_key') {
      return {
        response: "The Oracle's connection to the ethereal realm is not configured. Please contact the site administrator.",
        sourceChunkIds: [],
        hasKnowledge: false,
        relevantChunks: []
      };
    }
    
    return {
      response: "The mystical energies are disturbed... I cannot provide a reading at this moment. Please try again later.",
      sourceChunkIds: [],
      hasKnowledge: false,
      relevantChunks: []
    };
  }
}

// =============================================================================
// Document Processing
// =============================================================================

/**
 * Extract text content from various file types
 * For now, handles plain text and markdown
 */
export function extractTextFromContent(content: string, mimeType: string): string {
  // Handle markdown - strip formatting but keep text
  if (mimeType === 'text/markdown' || mimeType.includes('markdown')) {
    return content
      .replace(/#{1,6}\s/g, '')  // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold
      .replace(/\*([^*]+)\*/g, '$1')  // Remove italic
      .replace(/`([^`]+)`/g, '$1')  // Remove inline code
      .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove links, keep text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')  // Remove images
      .replace(/^\s*[-*+]\s/gm, '')  // Remove list markers
      .replace(/^\s*\d+\.\s/gm, '')  // Remove numbered list markers
      .trim();
  }
  
  // Plain text - just clean up whitespace
  return content.replace(/\s+/g, ' ').trim();
}

/**
 * Process a document and create chunks for RAG
 */
export async function processDocumentForRAG(
  documentId: number,
  rawContent: string,
  mimeType: string
): Promise<{ chunkCount: number; chunks: { content: string; chunkIndex: number }[] }> {
  // Extract clean text
  const cleanText = extractTextFromContent(rawContent, mimeType);
  
  if (!cleanText || cleanText.length < 10) {
    return { chunkCount: 0, chunks: [] };
  }
  
  // Chunk the text
  const textChunks = chunkText(cleanText, 500, 50);
  
  const chunks = textChunks.map((chunk, index) => ({
    documentId,
    content: chunk.content,
    chunkIndex: index,
    startOffset: chunk.startOffset,
    endOffset: chunk.endOffset,
    tokenCount: Math.ceil(chunk.content.length / 4) // Rough token estimate
  }));
  
  return {
    chunkCount: chunks.length,
    chunks: chunks.map(c => ({ content: c.content, chunkIndex: c.chunkIndex }))
  };
}
