import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  Download, 
  Star, 
  Search, 
  Grid3X3, 
  Gamepad2, 
  Music, 
  MessageSquare, 
  Palette,
  Code,
  Shield,
  Verified,
  Settings,
  Trash2
} from "lucide-react";

interface App {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  version: string;
  author: string;
  category: string;
  iconUrl?: string;
  screenshots?: string[];
  isVerified: boolean;
  installCount: number;
  rating: number;
  tags?: string[];
  permissions?: string[];
  size: string;
}

interface UserApp {
  id: number;
  appId: number;
  position: number;
  settings: any;
  isVisible: boolean;
  installedAt: string;
  app: App;
}

const CATEGORIES = [
  { id: 'all', name: 'All Apps', icon: Grid3X3 },
  { id: 'widgets', name: 'Widgets', icon: Grid3X3 },
  { id: 'games', name: 'Games', icon: Gamepad2 },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'social', name: 'Social', icon: MessageSquare },
  { id: 'tools', name: 'Tools', icon: Code },
  { id: 'themes', name: 'Themes', icon: Palette },
];

export default function Apps() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apps = [] } = useQuery({
    queryKey: ['/api/apps', selectedCategory, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);
      return apiRequest(`/api/apps?${params}`);
    }
  });

  const { data: userApps = [] } = useQuery({
    queryKey: ['/api/user-apps'],
    enabled: isAuthenticated,
  });

  const installAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      return apiRequest('/api/user-apps', {
        method: 'POST',
        body: JSON.stringify({ appId }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ title: "App installed successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/user-apps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
    },
    onError: () => {
      toast({ 
        title: "Installation failed", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    }
  });

  const uninstallAppMutation = useMutation({
    mutationFn: async (userAppId: number) => {
      return apiRequest(`/api/user-apps/${userAppId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({ title: "App uninstalled successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/user-apps'] });
    },
    onError: () => {
      toast({ 
        title: "Uninstall failed", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    }
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || Grid3X3;
  };

  const isAppInstalled = (appId: number) => {
    return userApps.some((ua: UserApp) => ua.appId === appId);
  };

  const getUserApp = (appId: number) => {
    return userApps.find((ua: UserApp) => ua.appId === appId);
  };

  return (
    <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-r from-[hsl(256,87%,66%)] via-[hsl(0,79%,70%)] to-[hsl(151,100%,50%)]"></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 font-mono flex items-center gap-3">
              <Store className="h-8 w-8 text-[hsl(151,100%,50%)]" />
              <span className="gradient-text">App Marketplace</span>
            </h1>
            <p className="text-gray-300">Discover and install amazing apps to customize your SpaceLink experience</p>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          {/* Search and Categories */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[hsl(240,29%,11%)] border-gray-700"
                />
              </div>
            </div>
            <TabsList className="grid grid-cols-3 lg:grid-cols-7 w-full lg:w-auto bg-[hsl(240,29%,11%)]">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Installed Apps Sidebar */}
            {isAuthenticated && (
              <div className="lg:col-span-1">
                <Card className="glass-effect bg-transparent border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                      My Apps ({userApps.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userApps.length > 0 ? (
                      <div className="space-y-3">
                        {userApps.map((userApp: UserApp) => (
                          <div key={userApp.id} className="flex items-center gap-3 p-2 rounded-lg bg-[hsl(240,29%,11%)] border border-gray-700">
                            <div className="w-8 h-8 bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] rounded-lg flex items-center justify-center">
                              <Grid3X3 className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{userApp.app?.name}</p>
                              <p className="text-xs text-gray-400">{userApp.app?.category}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => uninstallAppMutation.mutate(userApp.id)}
                              className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No apps installed yet</p>
                        <p className="text-gray-500 text-xs">Browse the marketplace to get started!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Apps Grid */}
            <div className={isAuthenticated ? "lg:col-span-3" : "lg:col-span-4"}>
              <TabsContent value={selectedCategory} className="mt-0">
                {apps.length > 0 ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {apps.map((app: App) => {
                      const Icon = getCategoryIcon(app.category);
                      const installed = isAppInstalled(app.id);
                      
                      return (
                        <Card key={app.id} className="glass-effect bg-transparent border-white/20 hover:border-[hsl(151,100%,50%)]/50 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] rounded-xl flex items-center justify-center">
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold truncate">{app.name}</h3>
                                  {app.isVerified && (
                                    <Verified className="h-4 w-4 text-[hsl(217,91%,60%)]" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-400">by {app.author}</p>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-300 mb-4 line-clamp-2">{app.shortDescription}</p>
                            
                            <div className="flex items-center gap-2 mb-4">
                              <Badge variant="outline" className="text-xs">{app.category}</Badge>
                              <Badge variant="outline" className="text-xs">{app.size}</Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{app.rating}/5</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Download className="h-3 w-3" />
                                <span>{app.installCount.toLocaleString()}</span>
                              </div>
                              
                              {isAuthenticated ? (
                                installed ? (
                                  <Badge className="bg-[hsl(151,100%,50%)] text-black">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Installed
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => installAppMutation.mutate(app.id)}
                                    disabled={installAppMutation.isPending}
                                    className="bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] hover:from-[hsl(256,87%,76%)] hover:to-[hsl(151,100%,60%)] text-white border-0"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Install
                                  </Button>
                                )
                              ) : (
                                <Button size="sm" variant="outline" disabled>
                                  Login to Install
                                </Button>
                              )}
                            </div>
                            
                            {app.permissions && app.permissions.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-700">
                                <p className="text-xs text-gray-400 mb-1">Permissions:</p>
                                <div className="flex flex-wrap gap-1">
                                  {app.permissions.slice(0, 3).map((permission, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {permission}
                                    </Badge>
                                  ))}
                                  {app.permissions.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{app.permissions.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No apps found</h3>
                    <p className="text-gray-400 mb-4">
                      {searchQuery 
                        ? `No apps match "${searchQuery}" in the ${selectedCategory === 'all' ? 'marketplace' : selectedCategory + ' category'}`
                        : `No apps available in the ${selectedCategory === 'all' ? 'marketplace' : selectedCategory + ' category'} yet`
                      }
                    </p>
                    {searchQuery && (
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchQuery('')}
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}