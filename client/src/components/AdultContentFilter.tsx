import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgeVerificationModal } from "./AgeVerificationModal";
import { useState } from "react";
import { Shield, Lock, Eye } from "lucide-react";

interface AdultContentFilterProps {
  isAdult?: boolean;
  contentWarning?: string;
  children: ReactNode;
  blurLevel?: 'none' | 'light' | 'heavy';
  showPreview?: boolean;
}

export function AdultContentFilter({ 
  isAdult = false, 
  contentWarning,
  children, 
  blurLevel = 'heavy',
  showPreview = false 
}: AdultContentFilterProps) {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { user } = useAuth();

  // If not adult content, show normally
  if (!isAdult && !contentWarning) {
    return <>{children}</>;
  }

  // If user has adult content enabled, show normally
  if (user?.adultContentEnabled) {
    return <>{children}</>;
  }

  // If user manually chose to view this specific content
  if (showContent) {
    return <>{children}</>;
  }

  const handleVerified = () => {
    setShowContent(true);
    setShowVerificationModal(false);
  };

  const getBlurClass = () => {
    switch (blurLevel) {
      case 'light': return 'blur-sm';
      case 'heavy': return 'blur-lg';
      default: return '';
    }
  };

  return (
    <>
      <Card className="glass-effect bg-red-900/20 border-red-700 relative overflow-hidden">
        {showPreview && (
          <div className={`absolute inset-0 ${getBlurClass()}`}>
            {children}
          </div>
        )}
        
        <div className="relative z-10 bg-[hsl(240,50%,7%)]/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Shield className="h-5 w-5" />
              Adult Content Warning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Lock className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Age Verification Required
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                This content is marked as adult material and requires age verification to view.
                {contentWarning && ` Content warning: ${contentWarning}`}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              {user?.isAgeVerified ? (
                <Button
                  onClick={() => setShowContent(true)}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  I'm 18+ / View Content
                </Button>
              ) : (
                <Button
                  onClick={() => setShowVerificationModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Age to View
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-gray-400">
              You must be 18+ to view adult content. Age verification protects minors while maintaining free speech.
            </p>
          </CardContent>
        </div>
      </Card>

      <AgeVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerified={handleVerified}
      />
    </>
  );
}