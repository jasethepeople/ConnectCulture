import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  displayName: varchar("display_name"),
  tagline: varchar("tagline"),
  customCss: text("custom_css"),
  themeId: varchar("theme_id").default("cyberpunk"),
  layoutId: varchar("layout_id").default("creative"),
  widgets: jsonb("widgets").default([]),
  profileSettings: jsonb("profile_settings").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invites table for invite-only registration
export const invites = pgTable("invites", {
  id: serial("id").primaryKey(),
  code: varchar("code").unique().notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  usedBy: varchar("used_by").references(() => users.id),
  maxUses: integer("max_uses").default(1),
  currentUses: integer("current_uses").default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Connections/friendships table
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  addresseeId: varchar("addressee_id").references(() => users.id).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Files table for file sharing
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  category: varchar("category").notNull(), // ebooks, music, videos, docs, images, other
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  downloadCount: integer("download_count").default(0),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  tags: text("tags").array(),
  filePath: varchar("file_path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Posts table for user posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  isPublic: boolean("is_public").default(true),
  likes: integer("likes").default(0),
  mediaType: varchar("media_type"), // video, link, image, text
  mediaUrl: text("media_url"), // external video/link URL
  mediaPlatform: varchar("media_platform"), // youtube, rumble, bitchute, x, etc
  mediaTitle: text("media_title"),
  mediaDescription: text("media_description"),
  mediaThumbnail: text("media_thumbnail"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table for real-time messaging
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Profile views table for analytics
export const profileViews = pgTable("profile_views", {
  id: serial("id").primaryKey(),
  viewerId: varchar("viewer_id").references(() => users.id),
  profileId: varchar("profile_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Apps marketplace table
export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description").notNull(),
  version: varchar("version").notNull(),
  author: varchar("author").notNull(),
  category: varchar("category").notNull(), // widgets, games, tools, social, music, etc
  iconUrl: text("icon_url"),
  screenshots: text("screenshots").array(),
  manifestUrl: text("manifest_url").notNull(), // JSON config for the app
  iframeUrl: text("iframe_url"), // For embeddable apps
  isVerified: boolean("is_verified").default(false),
  installCount: integer("install_count").default(0),
  rating: integer("rating").default(0), // 1-5 stars
  tags: text("tags").array(),
  permissions: text("permissions").array(), // what the app can access
  size: varchar("size"), // small, medium, large, fullscreen
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User installed apps
export const userApps = pgTable("user_apps", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  appId: integer("app_id").references(() => apps.id).notNull(),
  position: integer("position").default(0), // order on profile
  settings: jsonb("settings").default('{}'), // app-specific settings
  isVisible: boolean("is_visible").default(true),
  installedAt: timestamp("installed_at").defaultNow(),
});

// App reviews
export const appReviews = pgTable("app_reviews", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").references(() => apps.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentConnections: many(connections, { relationName: "requester" }),
  receivedConnections: many(connections, { relationName: "addressee" }),
  files: many(files),
  posts: many(posts),
  comments: many(comments),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  profileViews: many(profileViews, { relationName: "profile" }),
  viewedProfiles: many(profileViews, { relationName: "viewer" }),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  requester: one(users, {
    fields: [connections.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  addressee: one(users, {
    fields: [connections.addresseeId],
    references: [users.id],
    relationName: "addressee",
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  uploader: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const profileViewsRelations = relations(profileViews, ({ one }) => ({
  viewer: one(users, {
    fields: [profileViews.viewerId],
    references: [users.id],
    relationName: "viewer",
  }),
  profile: one(users, {
    fields: [profileViews.profileId],
    references: [users.id],
    relationName: "profile",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertInviteSchema = createInsertSchema(invites).omit({
  id: true,
  createdAt: true,
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  downloadCount: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Invite = typeof invites.$inferSelect;
export type InsertInvite = z.infer<typeof insertInviteSchema>;
export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ProfileView = typeof profileViews.$inferSelect;
