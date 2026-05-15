import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InviteModal } from "@/components/InviteModal";
import { Rocket, Palette, Cloud, MessageCircle, Play, Key, LogIn, Loader2, Lock, User } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => apiRequest("POST", "/api/auth/login", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome back!", description: "Logged in successfully." });
      onClose();
    },
    onError: () => {
      toast({ title: "Login Failed", description: "Invalid username or password.", variant: "destructive" });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect bg-[hsl(240,29%,11%)] border-white/20 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text font-mono flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Sign In
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[hsl(151,100%,50%)]" />Username
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="your_username" className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]" />
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
                    <Lock className="h-4 w-4 text-[hsl(151,100%,50%)]" />Password
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Your password" className="bg-[hsl(240,50%,7%)] border-gray-600 focus:border-[hsl(151,100%,50%)]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] text-black font-semibold hover:scale-105 transition-transform"
            >
              {loginMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
              ) : (
                <><LogIn className="mr-2 h-4 w-4" />Sign In</>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Landing() {
  const { toast } = useToast();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const demoMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/auth/demo", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome!", description: "You're now exploring as a demo user." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not start demo. Please try again.", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(240,50%,7%)] to-[hsl(240,29%,11%)] text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[hsl(256,87%,66%)]/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(151,100%,50%)]/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-[hsl(0,79%,70%)]/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Top nav */}
      <div className="relative z-10 flex justify-end px-6 pt-6">
        <Button
          variant="ghost"
          onClick={() => setShowLoginModal(true)}
          className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/20"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 font-mono">
            <span className="gradient-text animate-glow">Welcome to</span><br/>
            <span className="text-white">SpaceLink</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your personal universe of creativity, connection, and unlimited expression.
            Just like the golden days, but better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] px-8 py-4 text-lg font-semibold text-black hover:scale-105 transition-transform animate-pulse-neon"
              size="lg"
            >
              <Key className="mr-2 h-5 w-5" />
              Enter with Invite
            </Button>
            <Button
              variant="outline"
              onClick={() => demoMutation.mutate()}
              disabled={demoMutation.isPending}
              className="glass-effect px-8 py-4 text-lg font-semibold hover:bg-white/20 transition-colors border-white/20"
              size="lg"
            >
              {demoMutation.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading...</>
              ) : (
                <><Play className="mr-2 h-5 w-5" />Try Demo</>
              )}
            </Button>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Have an invite? Try code <span className="text-[hsl(151,100%,50%)] font-mono">WELCOME2025</span>
          </p>
        </div>

        {/* Features showcase */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="glass-effect bg-transparent border-white/20 hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(0,79%,70%)] rounded-lg flex items-center justify-center mb-4">
                <Palette className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Unlimited Customization</h3>
              <p className="text-gray-300">Create your space exactly how you want it. Custom CSS, themes, layouts - your creativity is the limit.</p>
            </CardContent>
          </Card>

          <Card className="glass-effect bg-transparent border-white/20 hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] rounded-lg flex items-center justify-center mb-4">
                <Cloud className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Massive File Sharing</h3>
              <p className="text-gray-300">Share everything from small texts to full movies. Public gallery with ebooks, music, docs, and more.</p>
            </CardContent>
          </Card>

          <Card className="glass-effect bg-transparent border-white/20 hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(0,79%,70%)] to-[hsl(256,87%,66%)] rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Integrated Messaging</h3>
              <p className="text-gray-300">Real-time chat that works seamlessly. Stay connected everywhere.</p>
            </CardContent>
          </Card>
        </div>

        {/* Logo and branding */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] rounded-lg flex items-center justify-center">
              <Rocket className="text-white text-lg" />
            </div>
            <h2 className="text-2xl font-bold gradient-text font-mono">SpaceLink</h2>
          </div>
          <p className="text-gray-400 text-sm">Bringing back the creative spirit of early social media.</p>
        </div>
      </div>

      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
