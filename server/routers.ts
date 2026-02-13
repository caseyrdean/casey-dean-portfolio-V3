/**
 * tRPC Routers - Standalone Version
 * 
 * All API routes for the portfolio website.
 * No Manus dependencies - fully portable to AWS.
 */

import { z } from "zod";
import { 
  publicProcedure, 
  protectedProcedure, 
  adminProcedure, 
  router 
} from "./trpc";
import { 
  AUTH_COOKIE_NAME, 
  getSessionCookieOptions, 
  loginWithPassword 
} from "./auth";
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
  // Project imports
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  getProjectBySlug,
  getAllProjects,
  getPublishedProjects,
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
import { storagePut, isStorageAvailable } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  // System routes
  system: router({
    health: publicProcedure
      .input(z.object({ timestamp: z.number().min(0) }))
      .query(() => ({ ok: true })),
    storageStatus: publicProcedure.query(() => ({
      s3Available: isStorageAvailable(),
      message: isStorageAvailable()
        ? "S3 storage configured"
        : "Using database storage (S3 not configured). Files stored as data URLs.",
    })),
    envDiagnostic: publicProcedure.query(() => {
      const check = (key: string) => {
        const val = process.env[key];
        if (!val) return { set: false, preview: "NOT SET" };
        return { set: true, preview: `${val.slice(0, 4)}...${val.slice(-4)} (${val.length} chars)` };
      };
      return {
        nodeEnv: process.env.NODE_ENV || "NOT SET",
        OPENAI_API_KEY: check("OPENAI_API_KEY"),
        ADMIN_PASSWORD: { set: !!process.env.ADMIN_PASSWORD },
        JWT_SECRET: { set: !!process.env.JWT_SECRET },
        DATABASE_URL: { set: !!process.env.DATABASE_URL },
        serverEntryPoint: "server/index.ts (standalone)",
        dotenvLoaded: true,
      };
    }),
    oracleDiagnostic: publicProcedure.query(async () => {
      const steps: Record<string, any> = {};
      try {
        // Step 1: Check OpenAI key
        const apiKey = process.env.OPENAI_API_KEY;
        steps.openaiKeyPresent = !!apiKey;
        if (!apiKey) return { steps, error: "OPENAI_API_KEY not set" };

        // Step 2: Test OpenAI connection
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey, baseURL: "https://api.openai.com/v1" });
        steps.openaiClientCreated = true;

        // Step 3: Test a minimal completion
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Say hello" }],
          max_tokens: 10,
        });
        steps.openaiCallSuccess = true;
        steps.openaiResponse = response.choices[0]?.message?.content;
        steps.tokensUsed = response.usage?.total_tokens;

        // Step 4: Test database knowledge fetch
        const { getAllKnowledgeDocuments } = await import("./db");
        const docs = await getAllKnowledgeDocuments(true);
        steps.knowledgeDocsCount = docs.length;
        steps.knowledgeDocTitles = docs.map((d: any) => d.title);

        // Step 5: Test comprehensive scraper
        const { fetchComprehensiveWebsiteContent } = await import("./comprehensive-scraper");
        const websiteContent = await fetchComprehensiveWebsiteContent();
        steps.websiteContentLength = websiteContent?.length || 0;
        steps.websiteContentAvailable = !!websiteContent;

        return { steps, error: null, status: "ALL SYSTEMS OPERATIONAL" };
      } catch (err: any) {
        steps.failedAt = Object.keys(steps).pop();
        return { steps, error: err.message, errorCode: err.code, errorType: err.constructor.name };
      }
    }),
    // Full Oracle chat test - runs the exact same RAG pipeline as the chat mutation
    oracleTestChat: publicProcedure.query(async () => {
      const startTime = Date.now();
      const testMessage = "What does Casey Dean do?";
      const steps: Record<string, any> = { testMessage };
      try {
        // Step 1: generateRAGResponse (the exact function used by oracle.chat)
        steps.callingGenerateRAG = true;
        const result = await generateRAGResponse(testMessage, []);
        steps.ragSuccess = true;
        steps.responseLength = result.response.length;
        steps.responsePreview = result.response.substring(0, 200);
        steps.hasKnowledge = result.hasKnowledge;
        steps.relevantChunksCount = result.relevantChunks.length;
        steps.responseTimeMs = Date.now() - startTime;
        return { steps, error: null, status: "ORACLE CHAT PIPELINE WORKING" };
      } catch (err: any) {
        steps.failedAt = Object.keys(steps).pop();
        steps.responseTimeMs = Date.now() - startTime;
        return { 
          steps, 
          error: err.message, 
          errorStack: err.stack?.substring(0, 500),
          errorCode: err.code, 
          errorType: err.constructor.name 
        };
      }
    }),
  }),

  // Authentication routes
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({ password: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await loginWithPassword(input.password);
          
          if (!result) {
            return { success: false as const, error: "Invalid password" };
          }
          
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(AUTH_COOKIE_NAME, result.token, cookieOptions);
          
          return { success: true as const, user: result.user };
        } catch (err: any) {
          // Catch env var errors and return user-friendly message
          if (err?.message?.includes('ADMIN_PASSWORD')) {
            console.error('[Auth] ADMIN_PASSWORD not configured:', err.message);
            return { success: false as const, error: "Admin login is not configured. Set ADMIN_PASSWORD in environment variables." };
          }
          if (err?.message?.includes('JWT_SECRET')) {
            console.error('[Auth] JWT_SECRET not configured:', err.message);
            return { success: false as const, error: "Server authentication is not configured. Set JWT_SECRET in environment variables." };
          }
          throw err;
        }
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(AUTH_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
  }),

  // Blog routes
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

  // Project routes
  project: router({
    // Public: Get all published projects
    list: publicProcedure.query(async () => {
      return getPublishedProjects();
    }),

    // Admin: Get all projects (including unpublished)
    adminList: adminProcedure.query(async () => {
      return getAllProjects(true);
    }),

    // Public: Get a specific project by slug
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getProjectBySlug(input.slug);
      }),

    // Public: Get a specific project by ID
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getProjectById(input.id);
      }),

    // Admin: Create a new project
    create: adminProcedure
      .input(z.object({
        slug: z.string(),
        title: z.string(),
        subtitle: z.string().optional(),
        category: z.string().optional(),
        image: z.string().optional(),
        description: z.string().optional(),
        challenge: z.string().optional(),
        solution: z.string().optional(),
        results: z.array(z.string()).optional(),
        technologies: z.array(z.string()).optional(),
        architectureDiagram: z.string().optional(),
        downloadUrl: z.string().optional(),
        published: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const projectId = await createProject(input);
        return { id: projectId };
      }),

    // Admin: Update a project
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        category: z.string().optional(),
        image: z.string().optional(),
        description: z.string().optional(),
        challenge: z.string().optional(),
        solution: z.string().optional(),
        results: z.array(z.string()).optional(),
        technologies: z.array(z.string()).optional(),
        architectureDiagram: z.string().optional(),
        downloadUrl: z.string().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        await updateProject(id, updateData);
        return { success: true };
      }),

    // Admin: Delete a project
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProject(input.id);
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
        
        // Try to save conversation history, but don't let DB failures block the response
        let conversationId: number | null = null;
        let conversationHistory: { role: 'user' | 'oracle'; content: string }[] = [];
        
        try {
          // x-forwarded-for can contain comma-separated IPs like "clientIP, proxyIP"
          // Extract only the first (client) IP and truncate to fit varchar(45)
          const rawIp = ctx.req.headers['x-forwarded-for'] as string || ctx.req.socket?.remoteAddress || '';
          const ipAddress = rawIp.split(',')[0].trim().substring(0, 45) || undefined;
          conversationId = await getOrCreateConversation(
            input.sessionId,
            ctx.user?.id,
            ipAddress
          );
          
          await createMessage({
            conversationId,
            role: 'user',
            content: input.message,
          });
          
          const history = await getMessagesByConversationId(conversationId, 10);
          conversationHistory = history.map(m => ({
            role: m.role as 'user' | 'oracle',
            content: m.content
          }));
        } catch (dbErr: any) {
          // Database operations failed - log but continue with RAG response
          console.error('[Oracle] Database error (non-fatal, continuing with RAG):', dbErr?.message || dbErr);
        }
        
        // Generate RAG response - this is the critical path
        try {
          const result = await generateRAGResponse(input.message, conversationHistory.slice(0, -1));
          
          const responseTimeMs = Date.now() - startTime;
          
          // Try to save Oracle response (non-fatal if it fails)
          if (conversationId !== null) {
            try {
              await createMessage({
                conversationId,
                role: 'oracle',
                content: result.response,
                sourceChunkIds: JSON.stringify(result.sourceChunkIds || []),
                hasKnowledge: result.hasKnowledge,
                responseTimeMs,
              });
            } catch (saveErr: any) {
              console.error('[Oracle] Failed to save response (non-fatal):', saveErr?.message);
            }
          }
          
          return {
            response: result.response,
            hasKnowledge: result.hasKnowledge,
            responseTimeMs,
          };
        } catch (err: any) {
          console.error('[Oracle] Error generating response:', err?.message || err);
          const errorMsg = err?.message || 'Unknown error';
          const responseTimeMs = Date.now() - startTime;
          
          const fallbackResponse = errorMsg.includes('OPENAI_API_KEY')
            ? 'The Oracle cannot connect — OPENAI_API_KEY is not configured in the server environment.'
            : errorMsg.includes('API key') || errorMsg.includes('401')
            ? 'The Oracle\'s API key appears to be invalid. Please check the OPENAI_API_KEY.'
            : 'The Oracle encountered an error processing your question. Please try again.';
          
          // Try to save error response (non-fatal)
          if (conversationId !== null) {
            try {
              await createMessage({
                conversationId,
                role: 'oracle',
                content: fallbackResponse,
                responseTimeMs,
              });
            } catch (saveErr: any) {
              console.error('[Oracle] Failed to save error response:', saveErr?.message);
            }
          }
          
          return {
            response: fallbackResponse,
            hasKnowledge: false,
            responseTimeMs,
          };
        }
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
        
        console.log(`[Knowledge] Starting upload: ${title} (${filename}, ${mimeType})`);
        
        // Decode base64 data
        const buffer = Buffer.from(data, "base64");
        const rawContent = buffer.toString('utf-8');
        console.log(`[Knowledge] Decoded content: ${buffer.length} bytes, ${rawContent.length} chars`);
        
        // Generate unique file key
        const uniqueId = nanoid(10);
        const fileKey = `knowledge/${docType}/${uniqueId}-${filename}`;
        
        // Upload to S3 (falls back to data URL if S3 not configured)
        let url: string;
        try {
          const result = await storagePut(fileKey, buffer, mimeType);
          url = result.url;
          console.log(`[Knowledge] Storage upload complete: ${url.substring(0, 80)}...`);
        } catch (storageErr: any) {
          console.error(`[Knowledge] Storage upload failed:`, storageErr?.message);
          // Use a placeholder URL - the rawContent is what matters for RAG
          url = `local://${fileKey}`;
        }
        
        // Create document record
        console.log(`[Knowledge] Creating document record...`);
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
        console.log(`[Knowledge] Document created with ID: ${docId}`);
        
        // Process document into chunks
        const { chunkCount, chunks } = await processDocumentForRAG(docId, rawContent, mimeType);
        console.log(`[Knowledge] Processed into ${chunkCount} chunks`);
        
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
        
        console.log(`[Knowledge] Upload complete: ${title} (${chunkCount} chunks)`);
        
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
