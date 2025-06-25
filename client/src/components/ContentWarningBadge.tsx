import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";

interface ContentWarningBadgeProps {
  isAdult?: boolean;
  contentWarning?: string;
  className?: string;
}

export function ContentWarningBadge({ isAdult, contentWarning, className = "" }: ContentWarningBadgeProps) {
  if (!isAdult && !contentWarning) return null;

  const getWarningColor = (warning?: string) => {
    if (!warning) return "text-red-400 border-red-400";
    
    switch (warning.toLowerCase()) {
      case 'nudity':
      case 'sexual':
        return "text-red-400 border-red-400";
      case 'violence':
        return "text-orange-400 border-orange-400";
      case 'controversial':
        return "text-yellow-400 border-yellow-400";
      case 'graphic':
        return "text-purple-400 border-purple-400";
      default:
        return "text-red-400 border-red-400";
    }
  };

  const getWarningIcon = (warning?: string) => {
    if (!warning) return AlertTriangle;
    
    switch (warning.toLowerCase()) {
      case 'nudity':
      case 'sexual':
        return EyeOff;
      case 'violence':
      case 'graphic':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const WarningIcon = getWarningIcon(contentWarning);
  const colorClass = getWarningColor(contentWarning);

  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${colorClass} ${className}`}
    >
      <WarningIcon className="h-3 w-3 mr-1" />
      {isAdult ? "18+" : contentWarning}
    </Badge>
  );
}