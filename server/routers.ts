import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost, 
  getBlogPostById, 
  getBlogPostBySlug, 
  getAllBlogPosts,
  getPublishedBlogPosts,
  createBlogAttachment,
  deleteBlogAttachment,
  getAttachmentsByPostId,
  getAttachmentById,
  // Oracle RAG imports
  createKnowledgeDocument,
  updateKnowledgeDocument,
  deleteKnowledgeDocument,
  getKnowledgeDocumentById,
  getAllKnowledgeDocuments,
  createDocumentChunks,
  getOrCreateConversation,
  createMessage,
  getMessagesByConversationId,
  getRecentConversations
} from "./db";
import { generateRAGResponse, processDocumentForRAG } from "./rag";
import { storagePut } from "./storage";
import { generateSpeech } from "./_core/textToSpeech";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  blog: router({
    // Public: Get all published posts
    list: publicProcedure.query(async () => {
      return getPublishedBlogPosts();
    }),

    // Public: Get single post by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await getBlogPostBySlug(input.slug);
        if (!post) return null;
        // Only return published posts to public
        if (!post.published) return null;
        return post;
      }),

    // Admin: Get all posts including unpublished
    adminList: adminProcedure.query(async () => {
      return getAllBlogPosts(true);
    }),

    // Admin: Get single post by ID (for editing)
    adminGetById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getBlogPostById(input.id);
      }),

    // Admin: Create new post
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string(),
        coverImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        readTime: z.string().optional(),
        published: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const postId = await createBlogPost({
          ...input,
          authorId: ctx.user.id,
          publishedAt: input.published ? new Date() : null,
        });
        return { id: postId };
      }),

    // Admin: Update post
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        coverImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        readTime: z.string().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // If publishing for first time, set publishedAt
        if (data.published) {
          const existing = await getBlogPostById(id);
          if (existing && !existing.published) {
            (data as any).publishedAt = new Date();
          }
        }
        
        await updateBlogPost(id, data);
        return { success: true };
      }),

    // Admin: Delete post
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBlogPost(input.id);
        return { success: true };
      }),

    // Admin: Upload file attachment
    uploadAttachment: adminProcedure
      .input(z.object({
        postId: z.number().optional(),
        filename: z.string(),
        mimeType: z.string(),
        data: z.string(), // base64 encoded
        type: z.enum(["image", "document", "video"]),
      }))
      .mutation(async ({ input }) => {
        const { filename, mimeType, data, type, postId } = input;
        
        // Decode base64 data
        const buffer = Buffer.from(data, "base64");
        
        // Generate unique file key
        const ext = filename.split('.').pop() || '';
        const uniqueId = nanoid(10);
        const fileKey = `blog/${type}s/${uniqueId}-${filename}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, mimeType);
        
        // Save to database
        const attachmentId = await createBlogAttachment({
          postId: postId || null,
          filename: `${uniqueId}-${filename}`,
          originalName: filename,
          mimeType,
          size: buffer.length,
          url,
          fileKey,
          type,
        });
        
        return { 
          id: attachmentId, 
          url, 
          filename: `${uniqueId}-${filename}`,
          originalName: filename,
        };
      }),

    // Admin: Get attachments for a post
    getAttachments: adminProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return getAttachmentsByPostId(input.postId);
      }),

    // Admin: Delete attachment
    deleteAttachment: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBlogAttachment(input.id);
        return { success: true };
      }),
  }),

  // The Oracle RAG Fortune Teller
  oracle: router({
    // Public: Send a message to The Oracle
    chat: publicProcedure
      .input(z.object({
        message: z.string().min(1).max(1000),
        sessionId: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const startTime = Date.now();
        
        // Get or create conversation
        const ipAddress = ctx.req.headers['x-forwarded-for'] as string || ctx.req.socket?.remoteAddress;
        const conversationId = await getOrCreateConversation(
          input.sessionId,
          ctx.user?.id,
          ipAddress
        );
        
        // Save user message
        await createMessage({
          conversationId,
          role: 'user',
          content: input.message,
        });
        
        // Get conversation history
        const history = await getMessagesByConversationId(conversationId, 10);
        const conversationHistory = history.map(m => ({
          role: m.role as 'user' | 'oracle',
          content: m.content
        }));
        
        // Generate RAG response
        const result = await generateRAGResponse(input.message, conversationHistory.slice(0, -1));
        
        const responseTimeMs = Date.now() - startTime;
        
        // Save Oracle response
        await createMessage({
          conversationId,
          role: 'oracle',
          content: result.response,
          sourceChunkIds: result.sourceChunkIds,
          hasKnowledge: result.hasKnowledge,
          responseTimeMs,
        });
        
        return {
          response: result.response,
          hasKnowledge: result.hasKnowledge,
          responseTimeMs,
        };
      }),

    // Public: Get conversation history
    getHistory: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const conv = await getOrCreateConversation(input.sessionId);
        const messages = await getMessagesByConversationId(conv, 50);
        return messages.map(m => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        }));
      }),

    // Public: Generate speech for Oracle response
    speak: publicProcedure
      .input(z.object({
        text: z.string().min(1).max(2000),
      }))
      .mutation(async ({ input }) => {
        try {
          // Use "onyx" voice - the deepest male voice, with slower speed for gravitas
          const result = await generateSpeech({
            text: input.text,
            voice: "onyx", // Deep, sage-like male voice
            speed: 0.85, // Slightly slower for a wise, deliberate tone
          });
          
          return {
            audioUrl: result.audioUrl,
            contentType: result.contentType,
          };
        } catch (error) {
          console.error('[Oracle TTS] Error generating speech:', error);
          throw new Error('Failed to generate speech');
        }
      }),
  }),

  // Knowledge Base Admin
  knowledge: router({
    // Admin: List all documents
    list: adminProcedure.query(async () => {
      return getAllKnowledgeDocuments(false);
    }),

    // Admin: Get single document
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getKnowledgeDocumentById(input.id);
      }),

    // Admin: Upload and process document
    upload: adminProcedure
      .input(z.object({
        filename: z.string(),
        title: z.string(),
        description: z.string().optional(),
        mimeType: z.string(),
        data: z.string(), // base64 encoded
        docType: z.enum(["resume", "project", "bio", "skills", "experience", "other"]).default("other"),
      }))
      .mutation(async ({ ctx, input }) => {
        const { filename, title, description, mimeType, data, docType } = input;
        
        // Decode base64 data
        const buffer = Buffer.from(data, "base64");
        const rawContent = buffer.toString('utf-8');
        
        // Generate unique file key
        const uniqueId = nanoid(10);
        const fileKey = `knowledge/${docType}/${uniqueId}-${filename}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, mimeType);
        
        // Create document record
        const docId = await createKnowledgeDocument({
          filename,
          title,
          description: description || null,
          mimeType,
          size: buffer.length,
          url,
          fileKey,
          docType,
          rawContent,
          uploadedBy: ctx.user.id,
        });
        
        // Process document into chunks
        const { chunkCount, chunks } = await processDocumentForRAG(docId, rawContent, mimeType);
        
        // Save chunks to database
        if (chunks.length > 0) {
          await createDocumentChunks(
            chunks.map((c, i) => ({
              documentId: docId,
              content: c.content,
              chunkIndex: i,
            }))
          );
        }
        
        // Update document with chunk count
        await updateKnowledgeDocument(docId, { chunkCount });
        
        return { 
          id: docId, 
          url, 
          chunkCount,
          title,
        };
      }),

    // Admin: Toggle document active status
    toggleActive: adminProcedure
      .input(z.object({ id: z.number(), active: z.boolean() }))
      .mutation(async ({ input }) => {
        await updateKnowledgeDocument(input.id, { active: input.active });
        return { success: true };
      }),

    // Admin: Update document metadata
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        docType: z.enum(["resume", "project", "bio", "skills", "experience", "other"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateKnowledgeDocument(id, data);
        return { success: true };
      }),

    // Admin: Delete document
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteKnowledgeDocument(input.id);
        return { success: true };
      }),

    // Admin: View recent conversations
    conversations: adminProcedure.query(async () => {
      return getRecentConversations(50);
    }),
  }),
});

export type AppRouter = typeof appRouter;
