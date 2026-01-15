import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Video,
  ArrowLeft,
  Loader2,
  MessageCircle
} from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function BlogAdmin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("posts");
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [readTime, setReadTime] = useState("");
  const [published, setPublished] = useState(false);
  
  // Queries
  const { data: posts, refetch: refetchPosts, isLoading: postsLoading } = trpc.blog.adminList.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === 'admin' }
  );
  
  const { data: currentPost } = trpc.blog.adminGetById.useQuery(
    { id: editingPost! },
    { enabled: !!editingPost }
  );
  
  // Mutations
  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Post created successfully!");
      resetForm();
      refetchPosts();
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Failed to create post: ${error.message}`);
    },
  });
  
  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated successfully!");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(`Failed to update post: ${error.message}`);
    },
  });
  
  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      refetchPosts();
      setEditingPost(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
  
  const uploadMutation = trpc.blog.uploadAttachment.useMutation({
    onSuccess: (data) => {
      toast.success("File uploaded successfully!");
      // Insert into content based on file type
      const insertText = data.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        ? `![${data.originalName}](${data.url})`
        : `[${data.originalName}](${data.url})`;
      setContent(prev => prev + "\n\n" + insertText);
    },
    onError: (error) => {
      toast.error(`Failed to upload file: ${error.message}`);
    },
  });
  
  // Load post data when editing
  useEffect(() => {
    if (currentPost) {
      setTitle(currentPost.title);
      setSlug(currentPost.slug);
      setExcerpt(currentPost.excerpt || "");
      setContent(currentPost.content);
      setCoverImage(currentPost.coverImage || "");
      setCategory(currentPost.category || "");
      setTags((currentPost.tags as string[] || []).join(", "));
      setReadTime(currentPost.readTime || "");
      setPublished(currentPost.published);
    }
  }, [currentPost]);
  
  // Auto-generate slug from title
  useEffect(() => {
    if (isCreating && title && !slug) {
      setSlug(slugify(title));
    }
  }, [title, isCreating, slug]);
  
  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverImage("");
    setCategory("");
    setTags("");
    setReadTime("");
    setPublished(false);
    setEditingPost(null);
  };
  
  const handleSave = () => {
    const postData = {
      title,
      slug,
      excerpt: excerpt || undefined,
      content,
      coverImage: coverImage || undefined,
      category: category || undefined,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      readTime: readTime || undefined,
      published,
    };
    
    if (editingPost) {
      updateMutation.mutate({ id: editingPost, ...postData });
    } else {
      createMutation.mutate(postData);
    }
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate({ id });
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Determine file type
    let type: "image" | "document" | "video" = "document";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("video/")) type = "video";
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        postId: editingPost || undefined,
        filename: file.name,
        mimeType: file.type,
        data: base64,
        type,
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-32 text-center">
          <h1 className="text-4xl font-display text-foreground mb-8">ADMIN ACCESS REQUIRED</h1>
          <p className="text-muted-foreground mb-8">Please log in to access the blog admin panel.</p>
          <Button 
            onClick={() => window.location.href = getLoginUrl()}
            className="font-subhead tracking-wider"
          >
            LOGIN
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-32 text-center">
          <h1 className="text-4xl font-display text-foreground mb-8">ACCESS DENIED</h1>
          <p className="text-muted-foreground mb-8">You don't have permission to access this page.</p>
          <Button onClick={() => setLocation("/")} className="font-subhead tracking-wider">
            <ArrowLeft className="w-4 h-4 mr-2" />
            RETURN HOME
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display text-foreground">BLOG ADMIN</h1>
            <p className="text-muted-foreground font-body mt-2">Manage your blog posts and uploads</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setLocation("/admin/knowledge")}
              variant="outline"
              className="font-subhead tracking-wider border-secondary text-secondary hover:bg-secondary/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              ORACLE KNOWLEDGE
            </Button>
            <Button 
              onClick={() => { resetForm(); setIsCreating(true); setActiveTab("editor"); }}
              className="font-subhead tracking-wider"
            >
              <Plus className="w-4 h-4 mr-2" />
              NEW POST
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="posts" className="font-subhead">All Posts</TabsTrigger>
            <TabsTrigger value="editor" className="font-subhead">
              {editingPost ? "Edit Post" : isCreating ? "New Post" : "Editor"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            {postsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : posts?.length === 0 ? (
              <Card className="border-primary/30 bg-card">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground font-body">No blog posts yet. Create your first post!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts?.map((post) => (
                  <Card key={post.id} className="border-primary/30 bg-card hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-display text-foreground">{post.title}</h3>
                            {post.published ? (
                              <span className="text-xs font-subhead tracking-wider text-accent bg-accent/20 px-2 py-1 rounded">
                                PUBLISHED
                              </span>
                            ) : (
                              <span className="text-xs font-subhead tracking-wider text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                                DRAFT
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-body line-clamp-2">
                            {post.excerpt || post.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-body">
                            <span>/{post.slug}</span>
                            {post.category && <span className="text-secondary">{post.category}</span>}
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                            className="border-primary/30"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setEditingPost(post.id); setIsCreating(false); setActiveTab("editor"); }}
                            className="border-primary/30"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="editor">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-primary/30 bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-foreground">
                      {editingPost ? "EDIT POST" : "NEW POST"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="font-subhead text-sm">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title..."
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="font-subhead text-sm">Slug</Label>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="post-url-slug"
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="excerpt" className="font-subhead text-sm">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief description for previews..."
                        rows={2}
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="content" className="font-subhead text-sm">Content (Markdown)</Label>
                        <div className="flex gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.md"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadMutation.isPending}
                            className="border-primary/30"
                          >
                            {uploadMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="ml-2">Upload</span>
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your post content in Markdown..."
                        rows={20}
                        className="bg-background border-primary/30 focus:border-primary font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-primary/30 bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-foreground text-lg">PUBLISH</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="published" className="font-subhead text-sm">Published</Label>
                      <Switch
                        id="published"
                        checked={published}
                        onCheckedChange={setPublished}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={createMutation.isPending || updateMutation.isPending || !title || !content}
                        className="flex-1 font-subhead tracking-wider"
                      >
                        {(createMutation.isPending || updateMutation.isPending) ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {editingPost ? "UPDATE" : "SAVE"}
                      </Button>
                      {(editingPost || isCreating) && (
                        <Button
                          variant="outline"
                          onClick={() => { resetForm(); setIsCreating(false); setActiveTab("posts"); }}
                          className="border-primary/30"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/30 bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-foreground text-lg">METADATA</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverImage" className="font-subhead text-sm">Cover Image URL</Label>
                      <Input
                        id="coverImage"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://..."
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category" className="font-subhead text-sm">Category</Label>
                      <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="AI, Cloud, Architecture..."
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="font-subhead text-sm">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="aws, serverless, ai..."
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="readTime" className="font-subhead text-sm">Read Time</Label>
                      <Input
                        id="readTime"
                        value={readTime}
                        onChange={(e) => setReadTime(e.target.value)}
                        placeholder="5 min read"
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/30 bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-foreground text-lg">TIPS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground font-body">
                    <p><strong className="text-primary">Images:</strong> Upload or paste URL, then use ![alt](url) in content</p>
                    <p><strong className="text-secondary">Documents:</strong> Upload PDFs/docs, link appears in content</p>
                    <p><strong className="text-accent">Videos:</strong> Upload or embed YouTube with iframe</p>
                    <p><strong className="text-foreground">Markdown:</strong> Full markdown support including code blocks</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
