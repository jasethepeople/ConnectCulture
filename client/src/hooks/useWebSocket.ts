import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
}

export function useWebSocket(userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      // Authenticate with the WebSocket server
      ws.current?.send(JSON.stringify({
        type: 'auth',
        userId: userId,
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          setMessages(prev => [...prev, data.message]);
        } else if (data.type === 'messageConfirm') {
          // Message sent confirmation
          setMessages(prev => [...prev, data.message]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to messaging service.",
        variant: "destructive",
      });
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId, toast]);

  const sendMessage = (receiverId: string, content: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'message',
        receiverId,
        content,
      }));
    } else {
      toast({
        title: "Connection Error",
        description: "Unable to send message. Please check your connection.",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    isConnected,
    sendMessage,
  };
}
