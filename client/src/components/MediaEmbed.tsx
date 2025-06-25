import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  ExternalLink, 
  Share2, 
  Eye,
  Heart,
  MessageCircle,
  Volume2,
  Maximize
} from "lucide-react";

interface MediaEmbedProps {
  url: string;
  platform: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  className?: string;
}

const PLATFORM_CONFIGS = {
  youtube: {
    name: 'YouTube',
    color: 'bg-red-600',
    embedTemplate: (videoId: string) => `https://www.youtube.com/embed/${videoId}`,
    extractId: (url: string) => {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      return match?.[1] || null;
    }
  },
  rumble: {
    name: 'Rumble',
    color: 'bg-green-600',
    embedTemplate: (videoId: string) => `https://rumble.com/embed/${videoId}/`,
    extractId: (url: string) => {
      const match = url.match(/rumble\.com\/(?:v|embed)\/([^\/\?]+)/);
      return match?.[1] || null;
    }
  },
  bitchute: {
    name: 'BitChute',
    color: 'bg-orange-600',
    embedTemplate: (videoId: string) => `https://www.bitchute.com/embed/${videoId}/`,
    extractId: (url: string) => {
      const match = url.match(/bitchute\.com\/video\/([^\/\?]+)/);
      return match?.[1] || null;
    }
  },
  x: {
    name: 'X (Twitter)',
    color: 'bg-black',
    embedTemplate: (tweetId: string) => `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
    extractId: (url: string) => {
      const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
      return match?.[1] || null;
    }
  },
  odysee: {
    name: 'Odysee',
    color: 'bg-purple-600',
    embedTemplate: (videoId: string) => `https://odysee.com/$/embed/${videoId}`,
    extractId: (url: string) => {
      const match = url.match(/odysee\.com\/([^:]+:[^\/]+)/);
      return match?.[1] || null;
    }
  },
  brighteon: {
    name: 'Brighteon',
    color: 'bg-blue-600',
    embedTemplate: (videoId: string) => `https://www.brighteon.com/embed/${videoId}`,
    extractId: (url: string) => {
      const match = url.match(/brighteon\.com\/([a-f0-9-]+)/);
      return match?.[1] || null;
    }
  }
};

export function MediaEmbed({ url, platform, title, description, thumbnail, className = "" }: MediaEmbedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  
  const platformConfig = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
  
  if (!platformConfig) {
    // Generic link preview for unsupported platforms
    return (
      <Card className={`glass-effect bg-transparent border-white/20 hover:border-[hsl(151,100%,50%)]/50 transition-colors ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] rounded-lg flex items-center justify-center">
              <ExternalLink className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{title || 'External Link'}</h4>
              <p className="text-sm text-gray-400 truncate">{description || url}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">Link</Badge>
                <Button size="sm" variant="ghost" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Visit
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const videoId = platformConfig.extractId(url);
  const embedUrl = videoId ? platformConfig.embedTemplate(videoId) : null;

  return (
    <Card className={`glass-effect bg-transparent border-white/20 overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Media Preview */}
        <div className="relative">
          {showEmbed && embedUrl ? (
            <div className="relative w-full aspect-video">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
              />
            </div>
          ) : (
            <div 
              className="relative w-full aspect-video bg-gradient-to-br from-[hsl(240,50%,7%)] to-[hsl(240,29%,11%)] flex items-center justify-center cursor-pointer group"
              onClick={() => setShowEmbed(true)}
            >
              {thumbnail ? (
                <img 
                  src={thumbnail} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] rounded-full flex items-center justify-center">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{title || 'Media Content'}</p>
                    <p className="text-sm text-gray-400">Click to load</p>
                  </div>
                </div>
              )}
              
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="h-10 w-10 text-white ml-1" />
                </div>
              </div>
              
              {/* Platform badge */}
              <div className="absolute top-4 left-4">
                <Badge className={`${platformConfig.color} text-white border-0`}>
                  {platformConfig.name}
                </Badge>
              </div>
              
              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" className="bg-black/40 backdrop-blur-sm hover:bg-black/60">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="bg-black/40 backdrop-blur-sm hover:bg-black/60">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Media Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold mb-2 line-clamp-2">{title || 'Shared Media'}</h4>
              {description && (
                <p className={`text-sm text-gray-400 ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {description}
                </p>
              )}
              {description && description.length > 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[hsl(151,100%,50%)] hover:text-white p-0 h-auto mt-1"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Engagement buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/50 mt-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[hsl(0,79%,70%)]">
                <Heart className="h-4 w-4 mr-1" />
                <span className="text-sm">0</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[hsl(217,91%,60%)]">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">0</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[hsl(151,100%,50%)]">
                <Eye className="h-4 w-4 mr-1" />
                <span className="text-sm">0</span>
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}