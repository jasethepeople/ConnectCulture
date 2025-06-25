import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Navigation } from "@/components/Navigation";
import { MessageChat } from "@/components/MessageChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  MessageSquare,
  Plus,
  Search,
  Phone,
  Video,
  MoreVertical
} from "lucide-react";

export default function Messages() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversations } = useQuery({
    queryKey: ["/api/messages/conversations"],
    enabled: isAuthenticated,
  });

  const { sendMessage, messages } = useWebSocket(user?.id);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(240,50%,7%)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[hsl(151,100%,50%)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading messages...</p>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations?.filter((conv: any) => 
    conv.otherUserId?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[hsl(240,50%,7%)] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-12 gradient-text font-mono">
          SpaceLink Messenger
        </h1>
        
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-effect bg-transparent border-white/20 h-96 lg:h-[600px]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Button size="sm" variant="ghost" className="text-[hsl(151,100%,50%)] hover:scale-110 transition-transform">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[hsl(240,29%,11%)] border border-gray-600 rounded-lg px-4 py-2 pl-10 text-sm focus:border-[hsl(151,100%,50%)] focus:outline-none transition-colors"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-0 h-full overflow-y-auto custom-scrollbar">
                <div className="space-y-1 px-4 pb-4">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation: any, index: number) => {
                      const isActive = selectedConversation === conversation.otherUserId;
                      
                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg transition-colors cursor-pointer ${
                            isActive ? 'bg-[hsl(151,100%,50%)]/20 border border-[hsl(151,100%,50%)]/50' : 'hover:bg-white/10'
                          }`}
                          onClick={() => setSelectedConversation(conversation.otherUserId)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] text-white">
                                  {(conversation.otherUserId || 'U')[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[hsl(151,100%,50%)] rounded-full border-2 border-[hsl(240,50%,7%)]"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{conversation.otherUserId}</p>
                              <p className="text-xs text-gray-400 truncate">{conversation.lastMessage}</p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No conversations yet.</p>
                      <p className="text-sm text-gray-500">Start a new conversation!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat window */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <MessageChat
                otherUserId={selectedConversation}
                currentUserId={user?.id || ''}
                onSendMessage={sendMessage}
                messages={messages}
              />
            ) : (
              <Card className="glass-effect bg-transparent border-white/20 h-96 lg:h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Conversation</h3>
                  <p className="text-gray-400">Choose a conversation from the sidebar to start messaging.</p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Start New Chat
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
