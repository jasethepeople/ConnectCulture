import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgeVerificationModal } from "./AgeVerificationModal";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";

interface AdultContentToggleProps {
  className?: string;
}

export function AdultContentToggle({ className = "" }: AdultContentToggleProps) {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleAdultContentMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest('/api/toggle-adult-content', {
        method: 'POST',
        body: JSON.stringify({ enabled }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({ 
        title: user?.adultContentEnabled ? "Adult content disabled" : "Adult content enabled",
        description: user?.adultContentEnabled 
          ? "You will no longer see adult content." 
          : "You now have access to adult content areas."
      });
    },
    onError: () => {
      toast({ 
        title: "Failed to update settings", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    }
  });

  const handleToggle = (enabled: boolean) => {
    if (enabled && !user?.isAgeVerified) {
      setShowVerificationModal(true);
      return;
    }
    
    toggleAdultContentMutation.mutate(enabled);
  };

  const handleVerified = () => {
    // After verification, automatically enable adult content
    toggleAdultContentMutation.mutate(true);
  };

  if (!user) return null;

  return (
    <>
      <div className={`flex items-center justify-between p-4 glass-effect bg-transparent border-white/20 rounded-lg ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {user.adultContentEnabled ? (
              <Eye className="h-5 w-5 text-red-400" />
            ) : (
              <EyeOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <Label htmlFor="adult-content-toggle" className="text-sm font-medium cursor-pointer">
                Adult Content Access
              </Label>
              <p className="text-xs text-gray-400">
                {user.isAgeVerified 
                  ? "Access to uncensored and adult content areas" 
                  : "Requires age verification"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user.isAgeVerified ? (
              <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!user.isAgeVerified && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowVerificationModal(true)}
              className="text-xs"
            >
              Verify Age
            </Button>
          )}
          
          <Switch
            id="adult-content-toggle"
            checked={user.adultContentEnabled || false}
            onCheckedChange={handleToggle}
            disabled={toggleAdultContentMutation.isPending}
          />
        </div>
      </div>

      <AgeVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerified={handleVerified}
      />
    </>
  );
}