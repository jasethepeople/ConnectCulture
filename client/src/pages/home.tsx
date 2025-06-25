import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MediaShareDialog } from "@/components/MediaShareDialog";
import { MediaEmbed } from "@/components/MediaEmbed";
import { CommentSection } from "@/components/CommentSection";
import { 
  Home as HomeIcon, 
  Users, 
  FileText, 
  MessageSquare, 
  Palette,
  TrendingUp,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Plus
} from "lucide-react";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: posts } = useQuery({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated,
  });

  const { data: connections } = useQuery({
    queryKey: ["/api/connections"],
    enabled: isAuthenticated,
  });

  const { data: files } = useQuery({
    queryKey: ["/api/files"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(240,50%,7%)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[hsl(151,100%,50%)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading your space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-r from-[hsl(256,87%,66%)] via-[hsl(0,79%,70%)] to-[hsl(151,100%,50%)]"></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 font-mono">
              Welcome back, <span className="gradient-text">{user?.displayName || user?.username || 'Space Explorer'}</span>!
            </h1>
            <p className="text-gray-300">Ready to explore your creative universe?</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="glass-effect bg-transparent border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Connections</span>
                  <Badge variant="secondary">{connections?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Posts</span>
                  <Badge variant="secondary">{posts?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Files Shared</span>
                  <Badge variant="secondary">{files?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Profile Views</span>
                  <Badge variant="secondary">--</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-effect bg-transparent border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-white/10"
                  onClick={() => window.location.href = '/profile'}
                >
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-white/10"
                  onClick={() => window.location.href = '/files'}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-white/10"
                  onClick={() => window.location.href = '/messages'}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-white/10"
                  onClick={() => window.location.href = '/customize'}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Customize
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post */}
            <Card className="glass-effect bg-transparent border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                  Share Something Amazing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <MediaShareDialog />
                  <Button 
                    variant="outline" 
                    className="border-gray-700 hover:bg-gray-800"
                    onClick={() => window.location.href = '/files'}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts Feed */}
            <Card className="glass-effect bg-transparent border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[hsl(217,91%,60%)]" />
                  Recent Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {posts && posts.length > 0 ? (
                    posts.map((post: any) => (
                      <div key={post.id} className="p-4 rounded-lg bg-[hsl(240,29%,11%)] border border-gray-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {post.authorId?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{post.authorId}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {post.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                        
                        {post.content && (
                          <p className="text-gray-300 mb-3">{post.content}</p>
                        )}
                        
                        {/* Media embed */}
                        {post.mediaUrl && (
                          <div className="mb-4">
                            <MediaEmbed
                              url={post.mediaUrl}
                              platform={post.mediaPlatform || 'link'}
                              title={post.mediaTitle}
                              description={post.mediaDescription}
                              thumbnail={post.mediaThumbnail}
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mb-4">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[hsl(0,79%,70%)]">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes || 0}
                          </Button>
                        </div>
                        
                        {/* Comments Section */}
                        <CommentSection postId={post.id} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No posts yet. Share something awesome!</p>
                      <p className="text-sm text-gray-500">Try sharing a YouTube video or posting your thoughts!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Popular Files */}
            <Card className="glass-effect bg-transparent border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[hsl(0,79%,70%)]" />
                  Popular Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files && files.length > 0 ? (
                    files.slice(0, 3).map((file: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] rounded-lg flex items-center justify-center">
                          <FileText className="text-white text-sm" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{file.originalName}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{file.downloadCount} downloads</span>
                            <span>•</span>
                            <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        </div>
                        <Badge variant="outline">{file.category}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No files shared yet.</p>
                      <p className="text-sm text-gray-500">Upload your first file to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Connection Suggestions */}
            <Card className="glass-effect bg-transparent border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[hsl(256,87%,66%)]" />
                  Connection Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Discover new connections.</p>
                  <p className="text-sm text-gray-500">We'll suggest people you might know based on your interests.</p>
                  <Button className="mt-4" variant="outline">
                    Find People
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
