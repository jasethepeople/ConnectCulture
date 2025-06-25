import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  Calendar, 
  CreditCard, 
  Upload, 
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export function AgeVerificationModal({ isOpen, onClose, onVerified }: AgeVerificationModalProps) {
  const [step, setStep] = useState<'warning' | 'verify' | 'method'>('warning');
  const [verificationMethod, setVerificationMethod] = useState<'birthdate' | 'id_upload' | 'credit_card'>('birthdate');
  const [birthDate, setBirthDate] = useState('');
  const [confirmAge, setConfirmAge] = useState(false);
  const [confirmLegal, setConfirmLegal] = useState(false);
  const [confirmResponsible, setConfirmResponsible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyAgeMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/verify-age', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ 
        title: "Age verification successful", 
        description: "You now have access to adult content areas." 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onVerified();
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Verification failed", 
        description: error.message || "Please try again or use a different method.",
        variant: "destructive" 
      });
    }
  });

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleVerification = async () => {
    if (!confirmAge || !confirmLegal || !confirmResponsible) {
      toast({
        title: "Please confirm all statements",
        description: "All confirmations are required for age verification.",
        variant: "destructive"
      });
      return;
    }

    if (verificationMethod === 'birthdate') {
      if (!birthDate) {
        toast({
          title: "Birth date required",
          description: "Please enter your birth date to continue.",
          variant: "destructive"
        });
        return;
      }

      const age = calculateAge(birthDate);
      if (age < 18) {
        toast({
          title: "Access denied",
          description: "You must be 18 or older to access adult content.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      await verifyAgeMutation.mutateAsync({
        method: verificationMethod,
        birthDate: verificationMethod === 'birthdate' ? birthDate : undefined,
        confirmations: {
          age: confirmAge,
          legal: confirmLegal,
          responsible: confirmResponsible
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderWarningStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-red-400 mb-4">Adult Content Warning</h3>
        <p className="text-gray-300 leading-relaxed">
          You are about to access areas that may contain adult content, including explicit material, 
          controversial discussions, and content not suitable for minors.
        </p>
      </div>

      <Card className="glass-effect bg-red-900/20 border-red-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Shield className="h-5 w-5" />
            Important Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-gray-300">• You must be 18+ years old to proceed</p>
          <p className="text-gray-300">• Content may include explicit adult material</p>
          <p className="text-gray-300">• Controversial and uncensored discussions</p>
          <p className="text-gray-300">• You acknowledge legal viewing in your jurisdiction</p>
          <p className="text-gray-300">• Platform maintains zero tolerance for illegal content</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex-1"
        >
          I am under 18 / Cancel
        </Button>
        <Button 
          onClick={() => setStep('verify')}
          className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
        >
          I am 18+ / Continue
        </Button>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Age Verification Required</h3>
        <p className="text-gray-300 text-sm">
          Choose your preferred verification method to access adult content areas.
        </p>
      </div>

      <div className="grid gap-3">
        <Card 
          className={`cursor-pointer transition-colors ${
            verificationMethod === 'birthdate' 
              ? 'glass-effect bg-blue-900/30 border-blue-500' 
              : 'glass-effect bg-transparent border-white/20 hover:border-blue-400'
          }`}
          onClick={() => setVerificationMethod('birthdate')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-400" />
            <div>
              <p className="font-medium">Birth Date Verification</p>
              <p className="text-xs text-gray-400">Quick verification using birth date</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${
            verificationMethod === 'id_upload' 
              ? 'glass-effect bg-blue-900/30 border-blue-500' 
              : 'glass-effect bg-transparent border-white/20 hover:border-blue-400'
          }`}
          onClick={() => setVerificationMethod('id_upload')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Upload className="h-6 w-6 text-green-400" />
            <div>
              <p className="font-medium">ID Upload (Coming Soon)</p>
              <p className="text-xs text-gray-400">Upload government-issued ID for verification</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${
            verificationMethod === 'credit_card' 
              ? 'glass-effect bg-blue-900/30 border-blue-500' 
              : 'glass-effect bg-transparent border-white/20 hover:border-blue-400'
          }`}
          onClick={() => setVerificationMethod('credit_card')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-purple-400" />
            <div>
              <p className="font-medium">Credit Card Verification (Coming Soon)</p>
              <p className="text-xs text-gray-400">$1 verification charge (refunded)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {verificationMethod === 'birthdate' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="birthdate" className="text-sm font-medium">Birth Date</Label>
            <Input
              id="birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="mt-1 bg-[hsl(240,29%,11%)] border-gray-700"
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox 
            id="confirm-age" 
            checked={confirmAge}
            onCheckedChange={(checked) => setConfirmAge(checked as boolean)}
          />
          <Label htmlFor="confirm-age" className="text-sm leading-relaxed">
            I confirm that I am 18 years of age or older and legally permitted to view adult content in my jurisdiction.
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox 
            id="confirm-legal" 
            checked={confirmLegal}
            onCheckedChange={(checked) => setConfirmLegal(checked as boolean)}
          />
          <Label htmlFor="confirm-legal" className="text-sm leading-relaxed">
            I understand that I may encounter explicit, controversial, or adult content and that viewing such content is legal in my location.
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox 
            id="confirm-responsible" 
            checked={confirmResponsible}
            onCheckedChange={(checked) => setConfirmResponsible(checked as boolean)}
          />
          <Label htmlFor="confirm-responsible" className="text-sm leading-relaxed">
            I will use this platform responsibly and understand that only illegal content is prohibited.
          </Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setStep('warning')}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleVerification}
          disabled={isProcessing || verifyAgeMutation.isPending}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isProcessing ? 'Verifying...' : 'Verify Age'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect bg-[hsl(240,50%,7%)] border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-400" />
            Age Verification Required
          </DialogTitle>
          <DialogDescription>
            This content requires age verification to ensure compliance with legal requirements.
          </DialogDescription>
        </DialogHeader>
        
        {step === 'warning' && renderWarningStep()}
        {step === 'verify' && renderVerificationStep()}
      </DialogContent>
    </Dialog>
  );
}