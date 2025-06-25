import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link, Video, Image, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MediaShareDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface DetectedMedia {
  type: 'video' | 'link' | 'image' | 'text';
  platform?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  url: string;
}

const PLATFORM_PATTERNS = {
  youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  rumble: /rumble\.com\/(?:v|embed)\/([^\/\?]+)/,
  bitchute: /bitchute\.com\/video\/([^\/\?]+)/,
  x: /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
  odysee: /odysee\.com\/([^:]+:[^\/]+)/,
  brighteon: /brighteon\.com\/([a-f0-9-]+)/,
};

function detectMediaType(url: string): DetectedMedia {
  const cleanUrl = url.trim();
  
  // Check video platforms
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(cleanUrl)) {
      return {
        type: 'video',
        platform,
        url: cleanUrl,
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video`,
        description: 'Shared video content'
      };
    }
  }
  
  // Check for direct media URLs
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl)) {
    return { type: 'image', url: cleanUrl, title: 'Shared Image' };
  }
  
  if (/\.(mp4|webm|ogg|avi|mov)$/i.test(cleanUrl)) {
    return { type: 'video', url: cleanUrl, title: 'Shared Video' };
  }
  
  // Default to link
  return { type: 'link', url: cleanUrl, title: 'Shared Link' };
}

export function MediaShareDialog({ trigger, onSuccess }: MediaShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [detectedMedia, setDetectedMedia] = useState<DetectedMedia | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value.trim()) {
      const detected = detectMediaType(value);
      setDetectedMedia(detected);
    } else {
      setDetectedMedia(null);
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Media shared successfully!",
        description: "Your content has been posted to your profile.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setOpen(false);
      setUrl("");
      setContent("");
      setDetectedMedia(null);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Failed to share media",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!content.trim() && !detectedMedia) {
      toast({
        title: "Nothing to share",
        description: "Please add some content or a media URL.",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      content: content.trim(),
      isPublic,
      ...(detectedMedia && {
        mediaType: detectedMedia.type,
        mediaUrl: detectedMedia.url,
        mediaPlatform: detectedMedia.platform,
        mediaTitle: detectedMedia.title,
        mediaDescription: detectedMedia.description,
        mediaThumbnail: detectedMedia.thumbnail,
      })
    };

    createPostMutation.mutate(postData);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform?: string) => {
    switch (platform) {
      case 'youtube': return 'bg-red-600';
      case 'rumble': return 'bg-green-600';
      case 'bitchute': return 'bg-orange-600';
      case 'x': return 'bg-black';
      case 'odysee': return 'bg-purple-600';
      case 'brighteon': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] hover:from-[hsl(256,87%,76%)] hover:to-[hsl(151,100%,60%)] text-white border-0">
            <Plus className="h-4 w-4 mr-2" />
            Share Media
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-effect bg-[hsl(240,50%,7%)]/95 border-white/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[hsl(151,100%,50%)]">Share Media Content</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="media-url">Media URL (optional)</Label>
            <Input
              id="media-url"
              placeholder="Paste YouTube, Rumble, BitChute, X, or any other media link..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="bg-[hsl(240,29%,11%)] border-gray-700"
            />
            <p className="text-xs text-gray-400">
              Supports: YouTube, Rumble, BitChute, X (Twitter), Odysee, Brighteon, and direct media files
            </p>
          </div>

          {/* Media Preview */}
          {detectedMedia && (
            <Card className="glass-effect bg-transparent border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(detectedMedia.type)}
                    <span className="font-medium capitalize">{detectedMedia.type}</span>
                  </div>
                  {detectedMedia.platform && (
                    <Badge className={`${getPlatformColor(detectedMedia.platform)} text-white border-0`}>
                      {detectedMedia.platform.charAt(0).toUpperCase() + detectedMedia.platform.slice(1)}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{detectedMedia.title}</p>
                  <p className="text-sm text-gray-400 break-all">{detectedMedia.url}</p>
                  {detectedMedia.description && (
                    <p className="text-sm text-gray-300">{detectedMedia.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="content">Your message</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts about this content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-[hsl(240,29%,11%)] border-gray-700 min-h-[100px]"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is-public" className="text-sm">
              Make this post public (visible to all users)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-700 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPostMutation.isPending || (!content.trim() && !detectedMedia)}
              className="bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] hover:from-[hsl(256,87%,76%)] hover:to-[hsl(151,100%,60%)] text-white border-0"
            >
              {createPostMutation.isPending ? "Sharing..." : "Share"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}