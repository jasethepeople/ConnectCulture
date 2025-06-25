import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Maximize, 
  Minimize, 
  X, 
  Music, 
  Play, 
  Gamepad2,
  Clock,
  Code,
  MessageSquare,
  Palette
} from "lucide-react";

interface AppWidgetProps {
  app: {
    id: number;
    name: string;
    slug: string;
    category: string;
    size: string;
    iframeUrl?: string;
    settings?: any;
  };
  isVisible: boolean;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onSettings: () => void;
}

const getAppIcon = (category: string) => {
  switch (category) {
    case 'music': return Music;
    case 'games': return Gamepad2;
    case 'tools': return Code;
    case 'social': return MessageSquare;
    case 'themes': return Palette;
    default: return Settings;
  }
};

const getAppContent = (app: any) => {
  // Demo content for different app types
  switch (app.slug) {
    case 'spotify-player':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Currently Playing</p>
              <p className="text-xs text-gray-400">Synthwave Dreams</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Play className="h-4 w-4" />
            </Button>
            <div className="flex-1 h-1 bg-gray-700 rounded-full">
              <div className="h-full w-1/3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      );
    
    case 'bitcoin-tracker':
      return (
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Bitcoin (BTC)</p>
            <p className="text-2xl font-bold text-orange-400">$42,350</p>
            <p className="text-xs text-green-400">+2.5% (24h)</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Ethereum (ETH)</p>
            <p className="text-lg font-semibold text-blue-400">$2,890</p>
            <p className="text-xs text-red-400">-1.2% (24h)</p>
          </div>
        </div>
      );
    
    case 'weather-widget':
      return (
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-400">San Francisco, CA</p>
          <p className="text-3xl font-bold">72°F</p>
          <p className="text-sm text-gray-300">Partly Cloudy</p>
          <div className="flex justify-center gap-4 text-xs">
            <span>High: 78°</span>
            <span>Low: 65°</span>
          </div>
        </div>
      );
    
    case 'neon-clock':
      return (
        <div className="text-center">
          <p className="text-3xl font-mono font-bold text-cyan-400 neon-glow">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      );
    
    case 'retro-snake':
      return (
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm font-medium mb-2">Snake Game</p>
            <div className="w-full h-24 bg-black border border-green-400 rounded flex items-center justify-center">
              <p className="text-green-400 text-xs">Click to Play</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">High Score: 1,250</p>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">App content loading...</p>
        </div>
      );
  }
};

export function AppWidget({ app, isVisible, onToggleVisibility, onRemove, onSettings }: AppWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const Icon = getAppIcon(app.category);
  
  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-2 row-span-1", 
    large: "col-span-2 row-span-2",
    fullscreen: "col-span-3 row-span-2"
  };

  if (!isVisible) return null;

  return (
    <Card 
      className={`glass-effect bg-transparent border-white/20 hover:border-[hsl(151,100%,50%)]/50 transition-all duration-300 ${sizeClasses[app.size as keyof typeof sizeClasses]} ${isMinimized ? 'h-16' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className="h-4 w-4 text-[hsl(151,100%,50%)]" />
            {app.name}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 hover:bg-white/10"
            >
              {isMinimized ? <Maximize className="h-3 w-3" /> : <Minimize className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onSettings}
              className="h-6 w-6 p-0 hover:bg-white/10"
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Badge variant="outline" className="text-xs w-fit">
          {app.category}
        </Badge>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="pt-0">
          {app.iframeUrl ? (
            <iframe
              src={app.iframeUrl}
              className="w-full h-32 rounded border-0"
              frameBorder="0"
              title={app.name}
            />
          ) : (
            getAppContent(app)
          )}
        </CardContent>
      )}
    </Card>
  );
}