import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Rocket, Key, User, Mail, Lock, Loader2 } from "lucide-react";

const inviteSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

const registerSchema = z.object({
  inviteCode: z.string().min(1),
  username: z.string().min(3, "At least 3 characters").max(20, "Max 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
  email: z.string().email("Valid email required").or(z.literal("")),
  password: z.string().min(6, "At least 6 characters"),
  displayName: z.string().min(1, "Display name is required"),
});

type InviteForm = z.infer<typeof inviteSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'invite' | 'register'>('invite');
  const [validatedCode, setValidatedCode] = useState('');

  const inviteForm = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { inviteCode: '' },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
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
    onSuccess: (_, code) => {
      setValidatedCode(code);
      registerForm.setValue('inviteCode', code);
      setStep('register');
      toast({ title: "Invite Valid!", description: "Complete your registration below." });
    },
    onError: () => {
      toast({ title: "Invalid Code", description: "That invite code is not valid or has been used up.", variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome to SpaceLink!", description: "Your account has been created." });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error?.message || "Could not create account. Try a different username.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setStep('invite');
    setValidatedCode('');
    inviteForm.reset();
    registerForm.reset();
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

        {step === 'invite' ? (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">Enter an invite code to get started. Try: <span className="text-[hsl(151,100%,50%)] font-mono">WELCOME2025</span></p>
            <Form {...inviteForm}>
              <form onSubmit={inviteForm.handleSubmit((d) => validateInviteMutation.mutate(d.inviteCode))} className="space-y-4">
                <FormField
                  control={inviteForm.control}
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
                          placeholder="e.g. WELCOME2025"
                          className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)] uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={validateInviteMutation.isPending}
                  className="w-full bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] text-black font-semibold hover:scale-105 transition-transform"
                >
                  {validateInviteMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking...</>
                  ) : (
                    <><Key className="mr-2 h-4 w-4" />Validate Code</>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <span className="inline-flex items-center gap-2 text-[hsl(151,100%,50%)] text-sm">
                <Key className="h-4 w-4" /> Code accepted: <strong>{validatedCode}</strong>
              </span>
            </div>
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit((d) => registerMutation.mutate(d))} className="space-y-3">
                <FormField
                  control={registerForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[hsl(151,100%,50%)]" />Display Name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your display name" className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[hsl(151,100%,50%)]" />Username
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="your_space_name" className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[hsl(151,100%,50%)]" />Email <span className="text-gray-500 text-xs">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="your@email.com" className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[hsl(151,100%,50%)]" />Password
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Min 6 characters" className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep('invite')} className="flex-1 border-gray-600 hover:bg-white/10">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] text-black font-semibold hover:scale-105 transition-transform"
                  >
                    {registerMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                    ) : (
                      <>Launch My Space <Rocket className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
