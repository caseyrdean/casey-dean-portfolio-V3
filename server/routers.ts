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
  getAttachmentById
} from "./db";
import { storagePut } from "./storage";
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
});

export type AppRouter = typeof appRouter;
