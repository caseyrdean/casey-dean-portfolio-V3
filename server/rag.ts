// =============================================================================
// The Oracle RAG (Retrieval-Augmented Generation) Service
// =============================================================================
// This service handles document processing, embedding generation, and
// semantic search for The Oracle fortune teller feature.
// =============================================================================

import { invokeLLM } from "./_core/llm";
import { 
  getAllActiveChunks, 
  getChunksByIds,
  getKnowledgeDocumentById 
} from "./db";
import { DocumentChunk } from "../drizzle/schema";

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
  
  // Find relevant chunks
  const relevantResults = await findRelevantChunks(query, 5, 0.05);
  
  // Build context from relevant chunks
  let context = '';
  const sourceChunkIds: number[] = [];
  const relevantChunks: { content: string; documentTitle?: string; score: number }[] = [];
  
  if (relevantResults.length > 0) {
    context = 'CONTEXT DOCUMENTS:\n\n';
    for (const result of relevantResults) {
      context += `--- From: ${result.documentTitle || 'Unknown Document'} ---\n`;
      context += result.chunk.content + '\n\n';
      sourceChunkIds.push(result.chunk.id);
      relevantChunks.push({
        content: result.chunk.content,
        documentTitle: result.documentTitle,
        score: result.score
      });
    }
  }
  
  // Build conversation messages
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: ORACLE_SYSTEM_PROMPT }
  ];
  
  // Add context if available
  if (context) {
    messages.push({
      role: 'system',
      content: context
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
  
  // Generate response
  try {
    const response = await invokeLLM({ messages });
    const messageContent = response.choices[0]?.message?.content;
    const responseText = typeof messageContent === 'string' ? messageContent : 
      "The crystal ball grows dark... I cannot divine an answer at this moment. Please try again.";
    
    // Determine if we had relevant knowledge
    const hasKnowledge = relevantResults.length > 0 && relevantResults[0].score > 0.1;
    
    return {
      response: responseText,
      sourceChunkIds,
      hasKnowledge,
      relevantChunks
    };
  } catch (error) {
    console.error('[RAG] Error generating response:', error);
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
