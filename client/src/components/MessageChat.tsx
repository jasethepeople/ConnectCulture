import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Send, 
  Paperclip, 
  Image, 
  Mic, 
  Phone, 
  Video, 
  MoreVertical,
  Smile
} from "lucide-react";

interface Message {
  id: number;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
}

interface MessageChatProps {
  otherUserId: string;
  currentUserId: string;
  onSendMessage: (receiverId: string, content: string) => void;
  messages: Message[];
}

export function MessageChat({ otherUserId, currentUserId, onSendMessage, messages }: MessageChatProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages for this conversation
  const { data: conversationMessages, isLoading } = useQuery({
    queryKey: ["/api/messages", otherUserId],
    enabled: !!otherUserId,
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/messages/${otherUserId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUserId] });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages, messages]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (otherUserId && conversationMessages) {
      markAsReadMutation.mutate();
    }
  }, [otherUserId, conversationMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    onSendMessage(otherUserId, messageInput.trim());
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Combine API messages with real-time messages
  const allMessages = [...(conversationMessages || []), ...messages.filter(msg => 
    (msg.senderId === currentUserId && msg.receiverId === otherUserId) ||
    (msg.senderId === otherUserId && msg.receiverId === currentUserId)
  )].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="glass-effect bg-transparent border-white/20 h-96 lg:h-[600px] flex flex-col">
      {/* Chat header */}
      <CardHeader className="border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] text-white">
                {otherUserId[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold">{otherUserId}</h3>
              <p className="text-sm text-[hsl(151,100%,50%)]">
                {isTyping ? 'Typing...' : 'Online now'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              <Video className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages area */}
      <CardContent className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-[hsl(151,100%,50%)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : allMessages.length > 0 ? (
          <div className="space-y-4">
            {allMessages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUserId;
              const showAvatar = index === 0 || allMessages[index - 1].senderId !== message.senderId;
              
              return (
                <div key={index} className={`flex gap-3 ${isOwnMessage ? 'justify-end' : ''}`}>
                  {!isOwnMessage && showAvatar && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] text-white text-sm">
                        {message.senderId[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isOwnMessage && !showAvatar && <div className="w-8" />}
                  
                  <div className={`flex-1 ${isOwnMessage ? 'flex justify-end' : ''}`}>
                    <div className={`max-w-md ${isOwnMessage ? 'order-2' : ''}`}>
                      <div
                        className={`rounded-2xl p-4 ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] text-white rounded-tr-md'
                            : 'glass-effect bg-white/10 text-white rounded-tl-md'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                      </div>
                      <span className={`text-xs text-gray-400 mt-1 block ${isOwnMessage ? 'text-right' : ''}`}>
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {isOwnMessage && showAvatar && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-[hsl(0,79%,70%)] to-[hsl(151,100%,50%)] text-white text-sm">
                        {currentUserId[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {isOwnMessage && !showAvatar && <div className="w-8" />}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-400">Start a conversation</p>
              <p className="text-sm text-gray-500">Send a message to get the conversation started!</p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Message input */}
      <div className="p-6 border-t border-gray-700 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <Button size="sm" type="button" variant="ghost" className="text-gray-400 hover:text-[hsl(151,100%,50%)]">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button size="sm" type="button" variant="ghost" className="text-gray-400 hover:text-[hsl(151,100%,50%)]">
            <Image className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="bg-[hsl(240,29%,11%)] border-gray-600 rounded-full px-4 py-3 pr-12 focus:border-[hsl(151,100%,50%)] focus:outline-none"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!messageInput.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[hsl(151,100%,50%)] to-[hsl(217,91%,60%)] w-8 h-8 rounded-full hover:scale-110 transition-transform disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <Button size="sm" type="button" variant="ghost" className="text-gray-400 hover:text-[hsl(151,100%,50%)]">
            <Mic className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
