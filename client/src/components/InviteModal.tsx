import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Rocket, Key, User, Mail, Lock, Loader2 } from "lucide-react";

const registrationSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(1, "Display name is required"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'invite' | 'register'>('invite');
  const [validatedInvite, setValidatedInvite] = useState<string>('');

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      inviteCode: '',
      username: '',
      email: '',
      password: '',
      displayName: '',
    },
  });

  const validateInviteMutation = useMutation({
    mutationFn: async (code: string) => {
      await apiRequest("POST", "/api/invites/validate", { code });
    },
    onSuccess: () => {
      setValidatedInvite(form.getValues('inviteCode'));
      setStep('register');
      toast({
        title: "Invite Valid!",
        description: "Please complete your registration.",
      });
    },
    onError: (error) => {
      toast({
        title: "Invalid Invite",
        description: "The invite code you entered is invalid or expired.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      // This would typically register the user and then redirect to login
      // For now, we'll show a success message and redirect to login
      console.log("Registration data:", data);
      
      // In a real implementation, this would create the user account
      // await apiRequest("POST", "/api/auth/register", data);
      
      // For demo purposes, redirect to login
      window.location.href = "/api/login";
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Your account has been created. Redirecting to login...",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInviteValidation = () => {
    const inviteCode = form.getValues('inviteCode');
    if (!inviteCode) {
      form.setError('inviteCode', { message: 'Please enter an invite code' });
      return;
    }
    validateInviteMutation.mutate(inviteCode);
  };

  const onSubmit = (data: RegistrationForm) => {
    registerMutation.mutate(data);
  };

  const handleClose = () => {
    setStep('invite');
    setValidatedInvite('');
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-effect bg-[hsl(240,29%,11%)] border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text font-mono flex items-center gap-2">
            <Rocket className="h-6 w-6" />
            Join SpaceLink
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 'invite' ? (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-[hsl(151,100%,50%)]" />
                        Invite Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your invite code"
                          className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="button"
                  onClick={handleInviteValidation}
                  disabled={validateInviteMutation.isPending}
                  className="w-full bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] hover:scale-105 transition-transform"
                >
                  {validateInviteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Validate Invite
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 text-[hsl(151,100%,50%)] text-sm">
                    <Key className="h-4 w-4" />
                    Invite code validated: {validatedInvite}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[hsl(151,100%,50%)]" />
                        Display Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Your display name"
                          className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[hsl(151,100%,50%)]" />
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Choose your space name"
                          className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[hsl(151,100%,50%)]" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="your@email.com"
                          className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[hsl(151,100%,50%)]" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Create a strong password"
                          className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setStep('invite')}
                    className="flex-1 border-gray-600 hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] hover:scale-105 transition-transform"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Launch My Space
                        <Rocket className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
