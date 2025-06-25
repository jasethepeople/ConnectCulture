import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertInviteSchema, insertFileSchema, insertPostSchema, insertCommentSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users/profile/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Record profile view if authenticated
      if (req.user?.claims?.sub) {
        await storage.recordProfileView(req.user.claims.sub, user.id);
      }

      const viewCount = await storage.getProfileViewCount(user.id);
      res.json({ ...user, viewCount });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/users/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }
      const users = await storage.searchUsers(q);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Invite routes
  app.post('/api/invites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inviteData = insertInviteSchema.parse({
        ...req.body,
        createdBy: userId,
        code: Math.random().toString(36).substring(2, 15),
      });
      const invite = await storage.createInvite(inviteData);
      res.json(invite);
    } catch (error) {
      console.error("Error creating invite:", error);
      res.status(500).json({ message: "Failed to create invite" });
    }
  });

  app.post('/api/invites/validate', async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Invite code required" });
      }

      const invite = await storage.getInviteByCode(code);
      if (!invite || invite.currentUses >= invite.maxUses) {
        return res.status(400).json({ message: "Invalid or expired invite code" });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error("Error validating invite:", error);
      res.status(500).json({ message: "Failed to validate invite" });
    }
  });

  // Connection routes
  app.post('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { addresseeId } = req.body;
      
      if (userId === addresseeId) {
        return res.status(400).json({ message: "Cannot connect to yourself" });
      }

      const existingStatus = await storage.getConnectionStatus(userId, addresseeId);
      if (existingStatus) {
        return res.status(400).json({ message: "Connection already exists" });
      }

      const connection = await storage.createConnection({
        requesterId: userId,
        addresseeId,
        status: "pending",
      });
      res.json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(500).json({ message: "Failed to create connection" });
    }
  });

  app.get('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await storage.getConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.put('/api/connections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const connection = await storage.updateConnectionStatus(parseInt(id), status);
      res.json(connection);
    } catch (error) {
      console.error("Error updating connection:", error);
      res.status(500).json({ message: "Failed to update connection" });
    }
  });

  // File routes
  app.post('/api/files', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileData = insertFileSchema.parse({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        category: req.body.category || 'other',
        description: req.body.description || '',
        isPublic: req.body.isPublic !== 'false',
        uploadedBy: userId,
        tags: req.body.tags ? req.body.tags.split(',') : [],
        filePath: req.file.path,
      });

      const file = await storage.createFile(fileData);
      res.json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get('/api/files', async (req, res) => {
    try {
      const { category, limit, offset } = req.query;
      const files = await storage.getFiles(
        category as string,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get('/api/files/:id/download', async (req, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getFileById(parseInt(id));
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      await storage.incrementDownloadCount(parseInt(id));
      
      const filePath = path.join(process.cwd(), file.filePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.download(filePath, file.originalName);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Post routes
  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({
        ...req.body,
        authorId: userId,
      });
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/posts', async (req, res) => {
    try {
      const { userId, limit, offset } = req.query;
      const posts = await storage.getPosts(
        userId as string,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Comment routes
  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentData = insertCommentSchema.parse({
        ...req.body,
        authorId: userId,
      });
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get('/api/comments/:postId', async (req, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getCommentsByPost(parseInt(postId));
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Message routes
  app.get('/api/messages/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId } = req.params;
      const messages = await storage.getMessages(userId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages/:otherUserId/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId } = req.params;
      await storage.markMessagesAsRead(otherUserId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    let userId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          userId = message.userId;
          if (userId) {
            clients.set(userId, ws);
          }
        } else if (message.type === 'message' && userId) {
          const messageData = insertMessageSchema.parse({
            content: message.content,
            senderId: userId,
            receiverId: message.receiverId,
          });
          
          const newMessage = await storage.createMessage(messageData);
          
          // Send to receiver if online
          const receiverWs = clients.get(message.receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
              type: 'message',
              message: newMessage,
            }));
          }
          
          // Confirm to sender
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'messageConfirm',
              message: newMessage,
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  return httpServer;
}
