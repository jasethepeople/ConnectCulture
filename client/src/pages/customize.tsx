import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { themes } from "@/lib/themes";
import { 
  Palette,
  Grid3X3,
  Puzzle,
  Code,
  Save,
  Eye,
  Sparkles
} from "lucide-react";

const LAYOUTS = [
  { id: 'classic', name: 'Classic Grid', description: 'Traditional 2-column layout', color: 'bg-[hsl(217,91%,60%)]' },
  { id: 'creative', name: 'Creative Flow', description: 'Asymmetric MySpace-style layout', color: 'bg-[hsl(151,100%,50%)]' },
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple design', color: 'bg-[hsl(256,87%,66%)]' },
];

const WIDGETS = [
  { id: 'music', name: 'Music Player', icon: '🎵' },
  { id: 'activity', name: 'Activity Graph', icon: '📊' },
  { id: 'quote', name: 'Quote of the Day', icon: '💭' },
  { id: 'custom', name: 'Custom HTML', icon: '⚡' },
];

export default function Customize() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState(user?.themeId || 'cyberpunk');
  const [selectedLayout, setSelectedLayout] = useState(user?.layoutId || 'creative');
  const [customCss, setCustomCss] = useState(user?.customCss || '');
  const [previewMode, setPreviewMode] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      await apiRequest("PUT", "/api/users/profile", updates);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your customizations have been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to save customizations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveCustomizations = () => {
    updateProfileMutation.mutate({
      themeId: selectedTheme,
      layoutId: selectedLayout,
      customCss: customCss,
    });
  };

  const applyTheme = (themeId: string) => {
    const theme = themes[themeId];
    if (theme) {
      document.documentElement.className = `theme-${themeId}`;
    }
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    if (previewMode) {
      applyTheme(themeId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(240,50%,7%)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[hsl(151,100%,50%)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading customization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text font-mono">Customize Your Universe</h1>
          <p className="text-xl text-gray-300">Make your space truly yours with unlimited customization options.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Theme selector */}
          <Card className="glass-effect bg-transparent border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-[hsl(0,79%,70%)]" />
                Themes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(themes).map(([themeId, theme]) => {
                  const isSelected = selectedTheme === themeId;
                  
                  return (
                    <div
                      key={themeId}
                      className={`cursor-pointer border-2 rounded-lg p-4 hover:scale-105 transition-transform ${
                        isSelected ? 'border-[hsl(151,100%,50%)]' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleThemeChange(themeId)}
                    >
                      <div 
                        className="h-20 rounded mb-2"
                        style={{
                          background: `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                        }}
                      ></div>
                      <p className="text-sm font-semibold">{theme.name}</p>
                      <p className="text-xs text-gray-400">{theme.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Layout options */}
          <Card className="glass-effect bg-transparent border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-[hsl(217,91%,60%)]" />
                Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {LAYOUTS.map((layout) => {
                  const isSelected = selectedLayout === layout.id;
                  
                  return (
                    <div
                      key={layout.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-[hsl(151,100%,50%)] bg-[hsl(151,100%,50%)]/10' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedLayout(layout.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-6 h-6 ${layout.color} rounded`}></div>
                        <span className="font-semibold">{layout.name}</span>
                      </div>
                      <p className="text-sm text-gray-400">{layout.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Widget library */}
          <Card className="glass-effect bg-transparent border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Puzzle className="h-5 w-5 text-[hsl(151,100%,50%)]" />
                Widgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {WIDGETS.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3 border border-gray-600 rounded-lg hover:border-[hsl(151,100%,50%)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{widget.icon}</span>
                      <span>{widget.name}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-[hsl(151,100%,50%)]">
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CSS Editor */}
        <Card className="glass-effect bg-transparent border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-[hsl(151,100%,50%)]" />
              Custom CSS Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[hsl(240,29%,11%)] rounded-lg p-4 font-mono text-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">/* Customize your profile appearance */</span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                    className={previewMode ? 'bg-[hsl(151,100%,50%)]/20 border-[hsl(151,100%,50%)]' : ''}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {previewMode ? 'Exit Preview' : 'Preview'}
                  </Button>
                </div>
              </div>
              <Textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                placeholder={`.profile-header {
  background: linear-gradient(45deg, #8B5CF6, #EC4899);
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
}

.widget-card {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 136, 0.3);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 0 5px #00FF88; }
  to { box-shadow: 0 0 20px #00FF88; }
}`}
                className="w-full h-48 bg-transparent border border-gray-600 rounded p-4 text-white focus:border-[hsl(151,100%,50%)] focus:outline-none resize-none custom-scrollbar font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="text-center">
          <Button
            onClick={handleSaveCustomizations}
            disabled={updateProfileMutation.isPending}
            className="bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Customizations'}
          </Button>
        </div>
      </div>
    </div>
  );
}
