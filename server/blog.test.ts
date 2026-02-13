import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createBlogPost: vi.fn().mockResolvedValue(1),
  updateBlogPost: vi.fn().mockResolvedValue(undefined),
  deleteBlogPost: vi.fn().mockResolvedValue(undefined),
  getBlogPostById: vi.fn().mockResolvedValue({
    id: 1,
    slug: "test-post",
    title: "Test Post",
    excerpt: "Test excerpt",
    content: "Test content",
    coverImage: null,
    category: "Test",
    tags: ["test"],
    readTime: "5 min read",
    published: false,
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
  }),
  getBlogPostBySlug: vi.fn().mockImplementation((slug: string) => {
    if (slug === "test-post") {
      return Promise.resolve({
        id: 1,
        slug: "test-post",
        title: "Test Post",
        excerpt: "Test excerpt",
        content: "Test content",
        coverImage: null,
        category: "Test",
        tags: ["test"],
        readTime: "5 min read",
        published: true,
        authorId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      });
    }
    return Promise.resolve(undefined);
  }),
  getAllBlogPosts: vi.fn().mockResolvedValue([
    {
      id: 1,
      slug: "test-post",
      title: "Test Post",
      excerpt: "Test excerpt",
      content: "Test content",
      published: true,
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
    },
  ]),
  getPublishedBlogPosts: vi.fn().mockResolvedValue([
    {
      id: 1,
      slug: "test-post",
      title: "Test Post",
      excerpt: "Test excerpt",
      content: "Test content",
      published: true,
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
    },
  ]),
  createBlogAttachment: vi.fn().mockResolvedValue(1),
  deleteBlogAttachment: vi.fn().mockResolvedValue(undefined),
  getAttachmentsByPostId: vi.fn().mockResolvedValue([]),
  getAttachmentById: vi.fn().mockResolvedValue(undefined),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://example.com/test.png" }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "password",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "password",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("blog.list", () => {
  it("returns published posts for public users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.list();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Test Post");
  });
});

describe("blog.getBySlug", () => {
  it("returns a published post by slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.getBySlug({ slug: "test-post" });

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Test Post");
  });

  it("returns null for non-existent slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.getBySlug({ slug: "non-existent" });

    expect(result).toBeNull();
  });
});

describe("blog.adminList", () => {
  it("returns all posts for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.adminList();

    expect(result).toHaveLength(1);
  });

  it("throws error for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.blog.adminList()).rejects.toThrow();
  });

  it("throws error for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.blog.adminList()).rejects.toThrow();
  });
});

describe("blog.create", () => {
  it("creates a new post for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.create({
      title: "New Post",
      slug: "new-post",
      content: "New content",
      published: false,
    });

    expect(result.id).toBe(1);
  });

  it("throws error for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.blog.create({
        title: "New Post",
        slug: "new-post",
        content: "New content",
        published: false,
      })
    ).rejects.toThrow();
  });
});

describe("blog.update", () => {
  it("updates a post for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.update({
      id: 1,
      title: "Updated Title",
    });

    expect(result.success).toBe(true);
  });

  it("throws error for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.blog.update({
        id: 1,
        title: "Updated Title",
      })
    ).rejects.toThrow();
  });
});

describe("blog.delete", () => {
  it("deletes a post for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.delete({ id: 1 });

    expect(result.success).toBe(true);
  });

  it("throws error for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.blog.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("blog.uploadAttachment", () => {
  it("uploads an attachment for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.uploadAttachment({
      filename: "test.png",
      mimeType: "image/png",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      type: "image",
    });

    expect(result.url).toBe("https://example.com/test.png");
    expect(result.id).toBe(1);
  });

  it("throws error for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.blog.uploadAttachment({
        filename: "test.png",
        mimeType: "image/png",
        data: "base64data",
        type: "image",
      })
    ).rejects.toThrow();
  });
});
