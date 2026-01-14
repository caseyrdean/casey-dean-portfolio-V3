/**
 * Knowledge Base Admin Page
 * Manage documents that Zoltar uses to answer questions
 */

import { useState, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileText, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  ArrowLeft,
  Database,
  MessageCircle,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const DOC_TYPES = [
  { value: 'resume', label: 'Resume' },
  { value: 'project', label: 'Project' },
  { value: 'bio', label: 'Bio' },
  { value: 'skills', label: 'Skills' },
  { value: 'experience', label: 'Experience' },
  { value: 'other', label: 'Other' },
] as const;

export default function KnowledgeAdmin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadDocType, setUploadDocType] = useState<typeof DOC_TYPES[number]['value']>('other');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: documents, isLoading: docsLoading } = trpc.knowledge.list.useQuery();
  const uploadMutation = trpc.knowledge.upload.useMutation({
    onSuccess: () => {
      utils.knowledge.list.invalidate();
      toast.success('Document uploaded and processed!');
      setUploadTitle('');
      setUploadDescription('');
      setUploadDocType('other');
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });
  const toggleMutation = trpc.knowledge.toggleActive.useMutation({
    onSuccess: () => {
      utils.knowledge.list.invalidate();
    },
  });
  const deleteMutation = trpc.knowledge.delete.useMutation({
    onSuccess: () => {
      utils.knowledge.list.invalidate();
      toast.success('Document deleted');
    },
  });

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-body">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <Database className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-3xl font-display text-foreground">KNOWLEDGE BASE</h1>
          <p className="text-muted-foreground font-body">
            Please log in to manage Zoltar's knowledge base.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/80">
              LOG IN
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-3xl font-display text-foreground">ACCESS DENIED</h1>
          <p className="text-muted-foreground font-body">
            You don't have permission to manage the knowledge base.
          </p>
          <Link href="/">
            <Button variant="outline" className="border-primary text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              RETURN HOME
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!uploadTitle.trim()) {
      toast.error('Please enter a title for the document');
      return;
    }

    // Check file type
    const allowedTypes = ['text/plain', 'text/markdown', 'application/json'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      toast.error('Only .txt, .md, and .json files are supported');
      return;
    }

    setIsUploading(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        
        await uploadMutation.mutateAsync({
          filename: file.name,
          title: uploadTitle.trim(),
          description: uploadDescription.trim() || undefined,
          mimeType: file.type || 'text/plain',
          data: base64,
          docType: uploadDocType,
        });
        
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    await toggleMutation.mutateAsync({ id, active: !currentActive });
  };

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-subhead tracking-wider">BACK TO BLOG ADMIN</span>
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <Database className="w-10 h-10 text-accent" />
              <h1 className="text-4xl font-display text-foreground">ZOLTAR KNOWLEDGE BASE</h1>
            </div>
            <p className="text-muted-foreground font-body">
              Upload documents that Zoltar will use to answer questions about you. 
              Only information from these documents will be used - Zoltar never makes things up.
            </p>
          </div>

          {/* Upload Form */}
          <div className="border border-primary/30 bg-card p-6 mb-8">
            <h2 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              UPLOAD DOCUMENT
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-subhead text-muted-foreground mb-2">
                    TITLE *
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Casey Dean Resume 2025"
                    className="w-full bg-background border border-primary/50 px-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-subhead text-muted-foreground mb-2">
                    DOCUMENT TYPE
                  </label>
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value as typeof uploadDocType)}
                    className="w-full bg-background border border-primary/50 px-4 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary"
                  >
                    {DOC_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-subhead text-muted-foreground mb-2">
                  DESCRIPTION (optional)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief description of the document content..."
                  rows={2}
                  className="w-full bg-background border border-primary/50 px-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-subhead text-muted-foreground mb-2">
                  FILE (.txt, .md, .json)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.json,text/plain,text/markdown,application/json"
                  onChange={handleFileUpload}
                  disabled={isUploading || !uploadTitle.trim()}
                  className="w-full bg-background border border-primary/50 px-4 py-2 text-sm font-body text-foreground file:mr-4 file:py-1 file:px-4 file:border file:border-primary/50 file:bg-primary/10 file:text-primary file:font-subhead file:text-xs file:tracking-wider file:cursor-pointer disabled:opacity-50"
                />
              </div>
              
              {isUploading && (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-body">Processing document...</span>
                </div>
              )}
            </div>
          </div>

          {/* Documents List */}
          <div className="border border-secondary/30 bg-card p-6">
            <h2 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              KNOWLEDGE DOCUMENTS
              {documents && (
                <span className="text-sm font-body text-muted-foreground">
                  ({documents.length} total)
                </span>
              )}
            </h2>
            
            {docsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className={`border p-4 transition-colors ${
                      doc.active 
                        ? 'border-accent/50 bg-accent/5' 
                        : 'border-muted/30 bg-muted/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-foreground truncate">{doc.title}</h3>
                          <span className={`text-xs font-subhead px-2 py-0.5 ${
                            doc.active 
                              ? 'bg-accent/20 text-accent' 
                              : 'bg-muted/20 text-muted-foreground'
                          }`}>
                            {doc.active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-body mb-2">
                          {doc.description || doc.filename}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-body">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {doc.docType}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {doc.chunkCount} chunks
                          </span>
                          <span>
                            {(doc.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(doc.id, doc.active)}
                          className={`p-2 border transition-colors ${
                            doc.active
                              ? 'border-accent/50 text-accent hover:bg-accent/20'
                              : 'border-muted/50 text-muted-foreground hover:bg-muted/20'
                          }`}
                          title={doc.active ? 'Deactivate' : 'Activate'}
                        >
                          {doc.active ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-2 border border-destructive/50 text-destructive hover:bg-destructive/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-body">
                  No documents uploaded yet. Upload your first document above.
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 border border-primary/20 bg-primary/5">
            <h3 className="text-sm font-display text-primary mb-2">TIPS FOR BEST RESULTS</h3>
            <ul className="text-sm text-muted-foreground font-body space-y-1">
              <li>• Upload your resume, project descriptions, and bio for comprehensive coverage</li>
              <li>• Use Markdown (.md) files for better text structure</li>
              <li>• Keep documents focused - one topic per document works best</li>
              <li>• Deactivate documents you don't want Zoltar to reference</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
