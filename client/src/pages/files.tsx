import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { FileUpload } from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Upload,
  Book,
  Music,
  Video,
  FileText,
  Search,
  Download,
  Eye,
  Share2,
  Filter,
  TrendingUp
} from "lucide-react";

const FILE_CATEGORIES = [
  { id: 'ebooks', label: 'E-Books', icon: Book, color: 'text-[hsl(151,100%,50%)]' },
  { id: 'music', label: 'Music', icon: Music, color: 'text-[hsl(0,79%,70%)]' },
  { id: 'videos', label: 'Videos', icon: Video, color: 'text-[hsl(217,91%,60%)]' },
  { id: 'docs', label: 'Documents', icon: FileText, color: 'text-[hsl(256,87%,66%)]' },
];

export default function Files() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ["/api/files", selectedCategory !== 'all' ? selectedCategory : undefined],
    enabled: isAuthenticated,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File Uploaded",
        description: "Your file has been uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = useCallback((files: File[], category: string, description: string, isPublic: boolean) => {
    if (files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('isPublic', isPublic.toString());

    uploadMutation.mutate(formData);
  }, [uploadMutation]);

  const handleDownload = async (fileId: number, filename: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(240,50%,7%)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[hsl(151,100%,50%)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading file galaxy...</p>
        </div>
      </div>
    );
  }

  const filteredFiles = files?.filter((file: any) => {
    if (searchQuery && !file.originalName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text font-mono">Universal File Galaxy</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Share everything from tiny texts to massive movies. Browse our public collection of ebooks, music, documentaries, and more.
          </p>
        </div>

        {/* File Upload */}
        <Card className="glass-effect bg-transparent border-white/20 mb-8">
          <CardContent className="p-8">
            <FileUpload
              onUpload={handleFileUpload}
              isUploading={uploadMutation.isPending}
            />
          </CardContent>
        </Card>

        {/* File Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {FILE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant="ghost"
                className={`glass-effect h-auto p-6 text-center hover:scale-105 transition-transform group ${
                  isSelected ? 'bg-white/10 border-[hsl(151,100%,50%)]' : 'border-white/20'
                }`}
                onClick={() => setSelectedCategory(isSelected ? 'all' : category.id)}
              >
                <div className="w-full">
                  <Icon className={`h-8 w-8 mx-auto mb-3 group-hover:scale-110 transition-transform ${category.color}`} />
                  <h3 className="font-bold mb-1">{category.label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {filteredFiles.filter((file: any) => file.category === category.id).length} files
                  </Badge>
                </div>
              </Button>
            );
          })}
        </div>

        {/* File Browser */}
        <Card className="glass-effect bg-transparent border-white/20 overflow-hidden">
          <CardHeader className="border-b border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                Public File Gallery
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[hsl(240,29%,11%)] border-gray-600 pl-10 focus:border-[hsl(151,100%,50%)]"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-[hsl(240,29%,11%)] border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Sort by: Recent</SelectItem>
                    <SelectItem value="popular">Sort by: Popular</SelectItem>
                    <SelectItem value="size">Sort by: Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {filesLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-[hsl(151,100%,50%)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading files...</p>
                </div>
              ) : filteredFiles.length > 0 ? (
                filteredFiles.map((file: any) => {
                  const categoryInfo = FILE_CATEGORIES.find(cat => cat.id === file.category);
                  const Icon = categoryInfo?.icon || FileText;
                  
                  return (
                    <div key={file.id} className="p-4 border-b border-gray-700/50 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] rounded-lg flex items-center justify-center">
                          <Icon className="text-white h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{file.originalName}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {file.downloadCount} downloads
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                            <span>•</span>
                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-[hsl(151,100%,50%)] hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-[hsl(217,91%,60%)] hover:text-white"
                            onClick={() => handleDownload(file.id, file.originalName)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-[hsl(0,79%,70%)] hover:text-white"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No files found.</p>
                  <p className="text-sm text-gray-500">
                    {searchQuery ? "Try a different search term." : "Be the first to upload a file!"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
