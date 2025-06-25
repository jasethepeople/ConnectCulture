import {
  users,
  invites,
  connections,
  files,
  posts,
  comments,
  messages,
  profileViews,
  type User,
  type UpsertUser,
  type InsertUser,
  type Invite,
  type InsertInvite,
  type Connection,
  type InsertConnection,
  type File,
  type InsertFile,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type Message,
  type InsertMessage,
  type ProfileView,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Additional user operations
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;
  
  // Invite operations
  createInvite(invite: InsertInvite): Promise<Invite>;
  getInviteByCode(code: string): Promise<Invite | undefined>;
  useInvite(code: string, userId: string): Promise<boolean>;
  
  // Connection operations
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnections(userId: string): Promise<Connection[]>;
  updateConnectionStatus(id: number, status: string): Promise<Connection>;
  getConnectionStatus(userId1: string, userId2: string): Promise<string | null>;
  
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFiles(category?: string, limit?: number, offset?: number): Promise<File[]>;
  getFileById(id: number): Promise<File | undefined>;
  incrementDownloadCount(id: number): Promise<void>;
  getUserFiles(userId: string): Promise<File[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(userId?: string, limit?: number, offset?: number): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  updatePost(id: number, updates: Partial<InsertPost>): Promise<Post>;
  deletePost(id: number): Promise<void>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId1: string, userId2: string, limit?: number): Promise<Message[]>;
  getConversations(userId: string): Promise<any[]>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
  
  // Profile view operations
  recordProfileView(viewerId: string | null, profileId: string): Promise<void>;
  getProfileViewCount(profileId: string): Promise<number>;
  
  // App operations
  getApps(category?: string, search?: string): Promise<any[]>;
  getAppById(id: number): Promise<any | undefined>;
  installApp(userId: string, appId: number): Promise<any>;
  uninstallApp(userAppId: number): Promise<void>;
  getUserApps(userId: string): Promise<any[]>;
  updateAppInstallCount(appId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          like(users.username, `%${query}%`),
          like(users.displayName, `%${query}%`)
        )
      )
      .limit(20);
  }

  // Invite operations
  async createInvite(invite: InsertInvite): Promise<Invite> {
    const [newInvite] = await db.insert(invites).values(invite).returning();
    return newInvite;
  }

  async getInviteByCode(code: string): Promise<Invite | undefined> {
    const [invite] = await db.select().from(invites).where(eq(invites.code, code));
    return invite;
  }

  async useInvite(code: string, userId: string): Promise<boolean> {
    const invite = await this.getInviteByCode(code);
    if (!invite || (invite.currentUses || 0) >= (invite.maxUses || 1)) {
      return false;
    }

    await db
      .update(invites)
      .set({
        currentUses: (invite.currentUses || 0) + 1,
        usedBy: userId,
      })
      .where(eq(invites.code, code));

    return true;
  }

  // Connection operations
  async createConnection(connection: InsertConnection): Promise<Connection> {
    const [newConnection] = await db.insert(connections).values(connection).returning();
    return newConnection;
  }

  async getConnections(userId: string): Promise<Connection[]> {
    return await db
      .select()
      .from(connections)
      .where(
        and(
          or(eq(connections.requesterId, userId), eq(connections.addresseeId, userId)),
          eq(connections.status, "accepted")
        )
      );
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection> {
    const [connection] = await db
      .update(connections)
      .set({ status, updatedAt: new Date() })
      .where(eq(connections.id, id))
      .returning();
    return connection;
  }

  async getConnectionStatus(userId1: string, userId2: string): Promise<string | null> {
    const [connection] = await db
      .select()
      .from(connections)
      .where(
        or(
          and(eq(connections.requesterId, userId1), eq(connections.addresseeId, userId2)),
          and(eq(connections.requesterId, userId2), eq(connections.addresseeId, userId1))
        )
      );
    return connection?.status || null;
  }

  // File operations
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async getFiles(category?: string, limit = 50, offset = 0): Promise<File[]> {
    let query = db.select().from(files);
    
    if (category) {
      query = query.where(and(eq(files.isPublic, true), eq(files.category, category)));
    } else {
      query = query.where(eq(files.isPublic, true));
    }
    
    return await query
      .orderBy(desc(files.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getFileById(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await db
      .update(files)
      .set({ downloadCount: sql`${files.downloadCount} + 1` })
      .where(eq(files.id, id));
  }

  async getUserFiles(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.uploadedBy, userId))
      .orderBy(desc(files.createdAt));
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPosts(userId?: string, limit = 20, offset = 0): Promise<Post[]> {
    let query = db.select().from(posts);
    
    if (userId) {
      query = query.where(eq(posts.authorId, userId));
    } else {
      query = query.where(eq(posts.isPublic, true));
    }
    
    return await query
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async updatePost(id: number, updates: Partial<InsertPost>): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(userId1: string, userId2: string, limit = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async getConversations(userId: string): Promise<any[]> {
    const conversations = await db
      .select({
        otherUserId: sql`CASE 
          WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId}
          ELSE ${messages.senderId}
        END`.as("otherUserId"),
        lastMessage: messages.content,
        lastMessageTime: messages.createdAt,
        isRead: messages.isRead,
      })
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt))
      .limit(20);

    return conversations;
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(eq(messages.senderId, senderId), eq(messages.receiverId, receiverId))
      );
  }

  // Profile view operations
  async recordProfileView(viewerId: string | null, profileId: string): Promise<void> {
    if (viewerId && viewerId !== profileId) {
      await db.insert(profileViews).values({
        viewerId,
        profileId,
      });
    }
  }

  async getProfileViewCount(profileId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(profileViews)
      .where(eq(profileViews.profileId, profileId));
    return result.count;
  }

  // App operations
  async getApps(category?: string, search?: string): Promise<any[]> {
    let query = db
      .select()
      .from(apps)
      .where(eq(apps.isActive, true))
      .orderBy(desc(apps.installCount));

    const results = await query;
    let filtered = results;

    if (category && category !== 'all') {
      filtered = filtered.filter(app => app.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchLower) ||
        app.description.toLowerCase().includes(searchLower) ||
        app.shortDescription.toLowerCase().includes(searchLower) ||
        app.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }

  async getAppById(id: number): Promise<any | undefined> {
    const result = await db
      .select()
      .from(apps)
      .where(eq(apps.id, id))
      .limit(1);
    
    return result[0];
  }

  async installApp(userId: string, appId: number): Promise<any> {
    const existing = await db
      .select()
      .from(userApps)
      .where(and(eq(userApps.userId, userId), eq(userApps.appId, appId)))
      .limit(1);
    
    if (existing.length > 0) {
      throw new Error('App already installed');
    }

    const userAppCount = await db
      .select({ count: count() })
      .from(userApps)
      .where(eq(userApps.userId, userId));
    
    const position = (userAppCount[0]?.count || 0) + 1;

    const result = await db
      .insert(userApps)
      .values({
        userId,
        appId,
        position,
        settings: {},
        isVisible: true,
      })
      .returning();

    await this.updateAppInstallCount(appId);
    return result[0];
  }

  async uninstallApp(userAppId: number): Promise<void> {
    await db
      .delete(userApps)
      .where(eq(userApps.id, userAppId));
  }

  async getUserApps(userId: string): Promise<any[]> {
    const result = await db
      .select({
        id: userApps.id,
        appId: userApps.appId,
        position: userApps.position,
        settings: userApps.settings,
        isVisible: userApps.isVisible,
        installedAt: userApps.installedAt,
        app: {
          id: apps.id,
          name: apps.name,
          slug: apps.slug,
          category: apps.category,
          iconUrl: apps.iconUrl,
          version: apps.version,
          author: apps.author,
          size: apps.size,
        }
      })
      .from(userApps)
      .leftJoin(apps, eq(userApps.appId, apps.id))
      .where(eq(userApps.userId, userId))
      .orderBy(userApps.position);

    return result;
  }

  async updateAppInstallCount(appId: number): Promise<void> {
    await db
      .update(apps)
      .set({
        installCount: sql`${apps.installCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(apps.id, appId));
  }
}

export const storage = new DatabaseStorage();
