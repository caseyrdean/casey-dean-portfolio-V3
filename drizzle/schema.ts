import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Blog posts table for the portfolio blog
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: varchar("coverImage", { length: 1000 }),
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>(),
  readTime: varchar("readTime", { length: 50 }),
  published: boolean("published").default(false).notNull(),
  authorId: int("authorId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Blog attachments for documents, images, and videos
 */
export const blogAttachments = mysqlTable("blog_attachments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId"),
  filename: varchar("filename", { length: 500 }).notNull(),
  originalName: varchar("originalName", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  size: int("size").notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["image", "document", "video"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlogAttachment = typeof blogAttachments.$inferSelect;
export type InsertBlogAttachment = typeof blogAttachments.$inferInsert;


// =============================================================================
// The Oracle RAG Knowledge Base Tables
// =============================================================================

/**
 * Knowledge base documents - stores the original uploaded documents
 * These are the source files that The Oracle uses to answer questions
 */
export const knowledgeDocuments = mysqlTable("knowledge_documents", {
  id: int("id").autoincrement().primaryKey(),
  /** Original filename */
  filename: varchar("filename", { length: 500 }).notNull(),
  /** Document title for display */
  title: varchar("title", { length: 500 }).notNull(),
  /** Brief description of the document content */
  description: text("description"),
  /** MIME type of the original file */
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  /** File size in bytes */
  size: int("size").notNull(),
  /** S3 URL to the original file */
  url: varchar("url", { length: 1000 }).notNull(),
  /** S3 file key */
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  /** Document type category */
  docType: mysqlEnum("docType", ["resume", "project", "bio", "skills", "experience", "other"]).default("other").notNull(),
  /** Whether this document is active for RAG queries */
  active: boolean("active").default(true).notNull(),
  /** Raw text content extracted from the document */
  rawContent: text("rawContent"),
  /** Number of chunks created from this document */
  chunkCount: int("chunkCount").default(0),
  /** User who uploaded this document */
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type InsertKnowledgeDocument = typeof knowledgeDocuments.$inferInsert;

/**
 * Document chunks - stores text chunks with embeddings for RAG retrieval
 * Each document is split into smaller chunks for better semantic search
 */
export const documentChunks = mysqlTable("document_chunks", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the parent document */
  documentId: int("documentId").notNull(),
  /** The text content of this chunk */
  content: text("content").notNull(),
  /** Chunk index within the document (for ordering) */
  chunkIndex: int("chunkIndex").notNull(),
  /** Character offset where this chunk starts in the original document */
  startOffset: int("startOffset"),
  /** Character offset where this chunk ends */
  endOffset: int("endOffset"),
  /** JSON-serialized embedding vector (for semantic search) */
  embedding: json("embedding").$type<number[]>(),
  /** Token count for this chunk */
  tokenCount: int("tokenCount"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentChunk = typeof documentChunks.$inferSelect;
export type InsertDocumentChunk = typeof documentChunks.$inferInsert;

/**
 * Oracle conversation history - stores chat sessions
 */
export const oracleConversations = mysqlTable("oracle_conversations", {
  id: int("id").autoincrement().primaryKey(),
  /** Session identifier for grouping messages */
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  /** User ID if authenticated, null for anonymous */
  userId: int("userId"),
  /** IP address for rate limiting */
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OracleConversation = typeof oracleConversations.$inferSelect;
export type InsertOracleConversation = typeof oracleConversations.$inferInsert;

/**
 * Oracle messages - stores individual messages in conversations
 */
export const oracleMessages = mysqlTable("oracle_messages", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the conversation */
  conversationId: int("conversationId").notNull(),
  /** Message role: user question or oracle response */
  role: mysqlEnum("role", ["user", "oracle"]).notNull(),
  /** The message content */
  content: text("content").notNull(),
  /** IDs of chunks used to generate this response (for oracle messages) */
  sourceChunkIds: text("sourceChunkIds").$type<string>(),
  /** Whether the response was based on knowledge base or "I don't know" */
  hasKnowledge: boolean("hasKnowledge"),
  /** Response generation time in ms */
  responseTimeMs: int("responseTimeMs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OracleMessage = typeof oracleMessages.$inferSelect;
export type InsertOracleMessage = typeof oracleMessages.$inferInsert;
