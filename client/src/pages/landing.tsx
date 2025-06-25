import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InviteModal } from "@/components/InviteModal";
import { Rocket, Palette, Cloud, MessageCircle, Play, Key } from "lucide-react";

export default function Landing() {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(240,50%,7%)] to-[hsl(240,29%,11%)] text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[hsl(256,87%,66%)]/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(151,100%,50%)]/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-[hsl(0,79%,70%)]/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-20">
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
              className="bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform animate-pulse-neon"
              size="lg"
            >
              <Key className="mr-2 h-5 w-5" />
              Enter with Invite
            </Button>
            <Button 
              variant="outline"
              className="glass-effect px-8 py-4 text-lg font-semibold hover:bg-white/20 transition-colors border-white/20"
              size="lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
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
              <p className="text-gray-300">Real-time chat that works seamlessly across web, Android, and iOS. Stay connected everywhere.</p>
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

      <InviteModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
      />
    </div>
  );
}
