import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useEffect } from "react";
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
  ArrowLeft,
  Loader2,
  FileText,
  FolderOpen
} from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function ProjectAdmin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("projects");
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [results, setResults] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [architectureDiagram, setArchitectureDiagram] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [published, setPublished] = useState(true);
  
  // Queries
  const { data: projects, refetch: refetchProjects, isLoading: projectsLoading } = trpc.project.adminList.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === 'admin' }
  );
  
  const { data: currentProject } = trpc.project.byId.useQuery(
    { id: editingProject! },
    { enabled: !!editingProject }
  );
  
  // Mutations
  const createMutation = trpc.project.create.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully!");
      resetForm();
      refetchProjects();
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });
  
  const updateMutation = trpc.project.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully!");
      refetchProjects();
    },
    onError: (error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });
  
  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted successfully!");
      refetchProjects();
      setEditingProject(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });
  
  // Load project data when editing
  useEffect(() => {
    if (currentProject) {
      setTitle(currentProject.title);
      setSlug(currentProject.slug);
      setSubtitle(currentProject.subtitle || "");
      setCategory(currentProject.category || "");
      setImage(currentProject.image || "");
      setDescription(currentProject.description || "");
      setChallenge(currentProject.challenge || "");
      setSolution(currentProject.solution || "");
      setResults(Array.isArray(currentProject.results) ? currentProject.results.join("\n") : "");
      setTechnologies(Array.isArray(currentProject.technologies) ? currentProject.technologies.join(", ") : "");
      setArchitectureDiagram(currentProject.architectureDiagram || "");
      setDownloadUrl(currentProject.downloadUrl || "");
      setPublished(currentProject.published);
    }
  }, [currentProject]);
  
  // Auto-generate slug from title
  useEffect(() => {
    if (isCreating && title && !slug) {
      setSlug(slugify(title));
    }
  }, [title, isCreating, slug]);
  
  const resetForm = () => {
    setTitle("");
    setSlug("");
    setSubtitle("");
    setCategory("");
    setImage("");
    setDescription("");
    setChallenge("");
    setSolution("");
    setResults("");
    setTechnologies("");
    setArchitectureDiagram("");
    setDownloadUrl("");
    setPublished(true);
    setEditingProject(null);
  };
  
  const handleSave = () => {
    const projectData = {
      title,
      slug,
      subtitle: subtitle || undefined,
      category: category || undefined,
      image: image || undefined,
      description: description || undefined,
      challenge: challenge || undefined,
      solution: solution || undefined,
      results: results ? results.split("\n").map(r => r.trim()).filter(Boolean) : undefined,
      technologies: technologies ? technologies.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      architectureDiagram: architectureDiagram || undefined,
      downloadUrl: downloadUrl || undefined,
      published,
    };
    
    if (editingProject) {
      updateMutation.mutate({ id: editingProject, ...projectData });
    } else {
      createMutation.mutate(projectData);
    }
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate({ id });
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
          <p className="text-muted-foreground mb-8">Please log in to access the project admin panel.</p>
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
            <h1 className="text-4xl font-display text-foreground">PROJECT ADMIN</h1>
            <p className="text-muted-foreground font-body mt-2">Manage your case studies and projects</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setLocation("/admin/blog")}
              variant="outline"
              className="font-subhead tracking-wider border-secondary text-secondary hover:bg-secondary/10"
            >
              <FileText className="w-4 h-4 mr-2" />
              BLOG POSTS
            </Button>
            <Button 
              onClick={() => { resetForm(); setIsCreating(true); setActiveTab("editor"); }}
              className="font-subhead tracking-wider"
            >
              <Plus className="w-4 h-4 mr-2" />
              NEW PROJECT
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="projects" className="font-subhead">All Projects</TabsTrigger>
            <TabsTrigger value="editor" className="font-subhead">
              {editingProject ? "Edit Project" : isCreating ? "New Project" : "Editor"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects">
            {projectsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : projects?.length === 0 ? (
              <Card className="border-primary/30 bg-card">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground font-body">No projects yet. Create your first project!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {projects?.map((project) => (
                  <Card key={project.id} className="border-primary/30 bg-card hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-display text-foreground">{project.title}</h3>
                            {project.published ? (
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
                            {project.description || project.subtitle || "No description"}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-body">
                            <span>/{project.slug}</span>
                            {project.category && <span className="text-secondary">{project.category}</span>}
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/project/${project.slug}`, '_blank')}
                            className="border-primary/30"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setEditingProject(project.id); setIsCreating(false); setActiveTab("editor"); }}
                            className="border-primary/30"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(project.id)}
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
                      {editingProject ? "EDIT PROJECT" : "NEW PROJECT"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="font-subhead text-sm">Title *</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Project title..."
                          className="bg-background border-primary/30 focus:border-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="slug" className="font-subhead text-sm">Slug *</Label>
                        <Input
                          id="slug"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="project-url-slug"
                          className="bg-background border-primary/30 focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subtitle" className="font-subhead text-sm">Subtitle</Label>
                        <Input
                          id="subtitle"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          placeholder="Brief tagline..."
                          className="bg-background border-primary/30 focus:border-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category" className="font-subhead text-sm">Category</Label>
                        <Input
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="Healthcare IoT, Enterprise, Federal..."
                          className="bg-background border-primary/30 focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="font-subhead text-sm">Overview / Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief overview of the project..."
                        rows={3}
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="challenge" className="font-subhead text-sm">The Challenge</Label>
                      <Textarea
                        id="challenge"
                        value={challenge}
                        onChange={(e) => setChallenge(e.target.value)}
                        placeholder="What problem did this project solve?"
                        rows={4}
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="solution" className="font-subhead text-sm">The Solution</Label>
                      <Textarea
                        id="solution"
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                        placeholder="How did you solve the challenge?"
                        rows={4}
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="results" className="font-subhead text-sm">Results & Impact (one per line)</Label>
                      <Textarea
                        id="results"
                        value={results}
                        onChange={(e) => setResults(e.target.value)}
                        placeholder="Increased efficiency by 50%&#10;Reduced costs by $1M&#10;Improved customer satisfaction by 30%"
                        rows={4}
                        className="bg-background border-primary/30 focus:border-primary"
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
                        disabled={createMutation.isPending || updateMutation.isPending || !title || !slug}
                        className="flex-1 font-subhead tracking-wider"
                      >
                        {(createMutation.isPending || updateMutation.isPending) ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {editingProject ? "UPDATE" : "SAVE"}
                      </Button>
                      {(editingProject || isCreating) && (
                        <Button
                          variant="outline"
                          onClick={() => { resetForm(); setIsCreating(false); setActiveTab("projects"); }}
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
                    <CardTitle className="font-display text-foreground text-lg">MEDIA</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image" className="font-subhead text-sm">Cover Image URL</Label>
                      <Input
                        id="image"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="/images/project-cover.png"
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="architectureDiagram" className="font-subhead text-sm">Architecture Diagram URL</Label>
                      <Input
                        id="architectureDiagram"
                        value={architectureDiagram}
                        onChange={(e) => setArchitectureDiagram(e.target.value)}
                        placeholder="/images/architecture.png"
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="downloadUrl" className="font-subhead text-sm">Download PDF URL</Label>
                      <Input
                        id="downloadUrl"
                        value={downloadUrl}
                        onChange={(e) => setDownloadUrl(e.target.value)}
                        placeholder="/docs/architecture.pdf"
                        className="bg-background border-primary/30 focus:border-primary"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/30 bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-foreground text-lg">TECHNOLOGIES</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="technologies" className="font-subhead text-sm">Technologies (comma separated)</Label>
                      <Input
                        id="technologies"
                        value={technologies}
                        onChange={(e) => setTechnologies(e.target.value)}
                        placeholder="AWS, Lambda, DynamoDB, React..."
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
                    <p><strong className="text-primary">Title:</strong> Keep it concise and descriptive</p>
                    <p><strong className="text-secondary">Results:</strong> Use metrics and numbers when possible</p>
                    <p><strong className="text-accent">Technologies:</strong> List all relevant tech stack items</p>
                    <p><strong className="text-foreground">Images:</strong> Use high-quality visuals for impact</p>
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
