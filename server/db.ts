import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, blogPosts, InsertBlogPost, BlogPost, blogAttachments, InsertBlogAttachment, BlogAttachment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Blog Post Queries

export async function createBlogPost(post: InsertBlogPost): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(blogPosts).values(post);
  return result[0].insertId;
}

export async function updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(blogPosts).set(post).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete attachments first
  await db.delete(blogAttachments).where(eq(blogAttachments.postId, id));
  // Then delete the post
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

export async function getBlogPostById(id: number): Promise<BlogPost | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return result[0];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0];
}

export async function getAllBlogPosts(includeUnpublished = false): Promise<BlogPost[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (includeUnpublished) {
    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }
  
  return db.select().from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt));
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  return getAllBlogPosts(false);
}

// Blog Attachment Queries

export async function createBlogAttachment(attachment: InsertBlogAttachment): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(blogAttachments).values(attachment);
  return result[0].insertId;
}

export async function deleteBlogAttachment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(blogAttachments).where(eq(blogAttachments.id, id));
}

export async function getAttachmentsByPostId(postId: number): Promise<BlogAttachment[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(blogAttachments).where(eq(blogAttachments.postId, postId));
}

export async function getAttachmentById(id: number): Promise<BlogAttachment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(blogAttachments).where(eq(blogAttachments.id, id)).limit(1);
  return result[0];
}


// =============================================================================
// Zoltar RAG Knowledge Base Queries
// =============================================================================

import { 
  knowledgeDocuments, 
  InsertKnowledgeDocument, 
  KnowledgeDocument,
  documentChunks,
  InsertDocumentChunk,
  DocumentChunk,
  zoltarConversations,
  InsertZoltarConversation,
  ZoltarConversation,
  zoltarMessages,
  InsertZoltarMessage,
  ZoltarMessage
} from "../drizzle/schema";

// Knowledge Document Queries

export async function createKnowledgeDocument(doc: InsertKnowledgeDocument): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(knowledgeDocuments).values(doc);
  return result[0].insertId;
}

export async function updateKnowledgeDocument(id: number, doc: Partial<InsertKnowledgeDocument>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(knowledgeDocuments).set(doc).where(eq(knowledgeDocuments.id, id));
}

export async function deleteKnowledgeDocument(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete chunks first
  await db.delete(documentChunks).where(eq(documentChunks.documentId, id));
  // Then delete the document
  await db.delete(knowledgeDocuments).where(eq(knowledgeDocuments.id, id));
}

export async function getKnowledgeDocumentById(id: number): Promise<KnowledgeDocument | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(knowledgeDocuments).where(eq(knowledgeDocuments.id, id)).limit(1);
  return result[0];
}

export async function getAllKnowledgeDocuments(activeOnly = true): Promise<KnowledgeDocument[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (activeOnly) {
    return db.select().from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.active, true))
      .orderBy(desc(knowledgeDocuments.createdAt));
  }
  
  return db.select().from(knowledgeDocuments).orderBy(desc(knowledgeDocuments.createdAt));
}

// Document Chunk Queries

export async function createDocumentChunks(chunks: InsertDocumentChunk[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (chunks.length === 0) return;
  
  // Insert in batches of 100
  for (let i = 0; i < chunks.length; i += 100) {
    const batch = chunks.slice(i, i + 100);
    await db.insert(documentChunks).values(batch);
  }
}

export async function getChunksByDocumentId(documentId: number): Promise<DocumentChunk[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(documentChunks)
    .where(eq(documentChunks.documentId, documentId))
    .orderBy(documentChunks.chunkIndex);
}

export async function getAllActiveChunks(): Promise<DocumentChunk[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get chunks only from active documents
  const activeDocIds = await db.select({ id: knowledgeDocuments.id })
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.active, true));
  
  if (activeDocIds.length === 0) return [];
  
  const ids = activeDocIds.map(d => d.id);
  
  // Get all chunks from active documents
  const allChunks: DocumentChunk[] = [];
  for (const docId of ids) {
    const chunks = await db.select().from(documentChunks)
      .where(eq(documentChunks.documentId, docId));
    allChunks.push(...chunks);
  }
  
  return allChunks;
}

export async function getChunksByIds(ids: number[]): Promise<DocumentChunk[]> {
  const db = await getDb();
  if (!db) return [];
  if (ids.length === 0) return [];
  
  const chunks: DocumentChunk[] = [];
  for (const id of ids) {
    const result = await db.select().from(documentChunks)
      .where(eq(documentChunks.id, id))
      .limit(1);
    if (result[0]) chunks.push(result[0]);
  }
  
  return chunks;
}

// Zoltar Conversation Queries

export async function createConversation(conv: InsertZoltarConversation): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(zoltarConversations).values(conv);
  return result[0].insertId;
}

export async function getConversationBySessionId(sessionId: string): Promise<ZoltarConversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(zoltarConversations)
    .where(eq(zoltarConversations.sessionId, sessionId))
    .limit(1);
  return result[0];
}

export async function getOrCreateConversation(sessionId: string, userId?: number, ipAddress?: string): Promise<number> {
  const existing = await getConversationBySessionId(sessionId);
  if (existing) return existing.id;
  
  return createConversation({ sessionId, userId, ipAddress });
}

// Zoltar Message Queries

export async function createMessage(msg: InsertZoltarMessage): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(zoltarMessages).values(msg);
  return result[0].insertId;
}

export async function getMessagesByConversationId(conversationId: number, limit = 50): Promise<ZoltarMessage[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(zoltarMessages)
    .where(eq(zoltarMessages.conversationId, conversationId))
    .orderBy(zoltarMessages.createdAt)
    .limit(limit);
}

export async function getRecentConversations(limit = 20): Promise<ZoltarConversation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(zoltarConversations)
    .orderBy(desc(zoltarConversations.updatedAt))
    .limit(limit);
}
