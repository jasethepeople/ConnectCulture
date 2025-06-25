import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Settings, 
  UserPlus, 
  Music, 
  FileText, 
  Users, 
  Calendar,
  Eye,
  Plus,
  Play,
  Download,
  Share,
  MessageCircle
} from "lucide-react";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Determine which profile to show
  const profileUsername = username || currentUser?.username;
  
  useEffect(() => {
    if (currentUser && profileUsername) {
      setIsOwnProfile(currentUser.username === profileUsername);
    }
  }, [currentUser, profileUsername]);

  const { data: profileUser, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/users/profile", profileUsername],
    enabled: !!profileUsername && isAuthenticated,
  });

  const { data: posts } = useQuery({
    queryKey: ["/api/posts", profileUser?.id],
    enabled: !!profileUser?.id,
  });

  const { data: userFiles } = useQuery({
    queryKey: ["/api/files", { userId: profileUser?.id }],
    enabled: !!profileUser?.id,
  });

  const connectMutation = useMutation({
    mutationFn: async (addresseeId: string) => {
      await apiRequest("POST", "/api/connections", { addresseeId });
    },
    onSuccess: () => {
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
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
        title: "Error",
        description: "Failed to send connection request.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-[hsl(240,50%,7%)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[hsl(151,100%,50%)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
        <Navigation />
        <div className="pt-20 container mx-auto px-4 py-8">
          <Card className="glass-effect bg-transparent border-white/20">
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-2">Profile Not Found</h1>
              <p className="text-gray-400">The user you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleConnect = () => {
    if (profileUser && !isOwnProfile) {
      connectMutation.mutate(profileUser.id);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Profile customization sidebar */}
          {isOwnProfile && (
            <div className="lg:col-span-1">
              <Card className="glass-effect bg-transparent border-white/20 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                    Customize
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-white/10"
                    onClick={() => window.location.href = '/customize'}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Themes
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-white/10"
                    onClick={() => window.location.href = '/customize'}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Layout
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-white/10"
                    onClick={() => window.location.href = '/customize'}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Widgets
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-white/10"
                    onClick={() => window.location.href = '/customize'}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Custom CSS
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main profile area */}
          <div className={isOwnProfile ? "lg:col-span-3" : "lg:col-span-4"}>
            {/* Profile header */}
            <Card className="glass-effect bg-transparent border-white/20 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-gradient-to-r from-[hsl(256,87%,66%)] via-[hsl(0,79%,70%)] to-[hsl(151,100%,50%)]"></div>
              </div>
              <CardContent className="relative z-10 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-[hsl(151,100%,50%)]">
                      <AvatarImage src={profileUser.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] text-white text-2xl">
                        {(profileUser.displayName || profileUser.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[hsl(151,100%,50%)] rounded-full flex items-center justify-center">
                      <Eye className="text-[hsl(240,50%,7%)] text-sm" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2 font-mono">
                      {profileUser.displayName || profileUser.username || 'Space Explorer'}
                    </h1>
                    <p className="text-[hsl(151,100%,50%)] font-semibold mb-2">
                      {profileUser.tagline || 'Creative Digital Explorer'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-[hsl(256,87%,66%)]/30">
                        Music
                      </Badge>
                      <Badge variant="secondary" className="bg-[hsl(151,100%,50%)]/30">
                        Tech
                      </Badge>
                      <Badge variant="secondary" className="bg-[hsl(0,79%,70%)]/30">
                        Art
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        -- Connections
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {profileUser.viewCount || 0} Views
                      </span>
                    </div>
                  </div>
                  {!isOwnProfile && (
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={handleConnect}
                        disabled={connectMutation.isPending}
                        className="bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] hover:scale-105 transition-transform"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-white/20 hover:bg-white/10"
                        onClick={() => window.location.href = '/messages'}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customizable content grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent posts */}
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                    Recent Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {posts && posts.length > 0 ? (
                      posts.slice(0, 3).map((post: any, index: number) => (
                        <div key={index} className="border-l-2 border-[hsl(151,100%,50%)] pl-4">
                          <p className="text-sm">{post.content}</p>
                          <span className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No posts yet.</p>
                        {isOwnProfile && (
                          <Button className="mt-4" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Post
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Files */}
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[hsl(0,79%,70%)]" />
                    Shared Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userFiles && userFiles.length > 0 ? (
                      userFiles.slice(0, 3).map((file: any, index: number) => (
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
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No files shared yet.</p>
                        {isOwnProfile && (
                          <Button 
                            className="mt-4" 
                            variant="outline"
                            onClick={() => window.location.href = '/files'}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Files
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Music widget placeholder */}
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-[hsl(0,79%,70%)]" />
                    Now Playing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No music playing.</p>
                    <p className="text-sm text-gray-500">Connect a music service to show what you're listening to.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Connections */}
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[hsl(217,91%,60%)]" />
                    Connections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No connections yet.</p>
                    {isOwnProfile && (
                      <Button className="mt-4" variant="outline">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Find People
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
