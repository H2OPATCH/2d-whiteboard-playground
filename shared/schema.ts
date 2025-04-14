import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  userId: integer("user_id").references(() => users.id),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  text: true,
  completed: true,
  userId: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Notes table with rich text support
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  richContent: jsonb("rich_content"), // For rich text content
  attachments: jsonb("attachments"), // For media attachments
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  title: true,
  content: true,
  richContent: true,
  attachments: true,
  userId: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Canvas items table
export const canvasItems = pgTable("canvas_items", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'text', 'sticky', 'shape', 'image', 'media', 'connector', 'flowchart'
  content: text("content"),
  richContent: jsonb("rich_content"), // For rich text items
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  width: integer("width"),
  height: integer("height"),
  style: jsonb("style"), // For styling information
  connectionData: jsonb("connection_data"), // For flowcharts and connections
  mediaUrl: text("media_url"), // For embedded media
  mediaType: text("media_type"), // Type of media (image, video, pdf, etc.)
  userId: integer("user_id").references(() => users.id),
});

export const insertCanvasItemSchema = createInsertSchema(canvasItems).pick({
  type: true,
  content: true,
  richContent: true,
  positionX: true,
  positionY: true,
  width: true,
  height: true,
  style: true,
  connectionData: true,
  mediaUrl: true,
  mediaType: true,
  userId: true,
});

export type InsertCanvasItem = z.infer<typeof insertCanvasItemSchema>;
export type CanvasItem = typeof canvasItems.$inferSelect;

// Playground table for separate whiteboarding workspace
export const playgrounds = pgTable("playgrounds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertPlaygroundSchema = createInsertSchema(playgrounds).pick({
  name: true,
  description: true,
  userId: true,
});

export type InsertPlayground = z.infer<typeof insertPlaygroundSchema>;
export type Playground = typeof playgrounds.$inferSelect;

// Playground items (similar to canvas items but for playground)
export const playgroundItems = pgTable("playground_items", {
  id: serial("id").primaryKey(),
  playgroundId: integer("playground_id").references(() => playgrounds.id).notNull(),
  type: text("type").notNull(), // 'text', 'sticky', 'shape', 'image', 'media', 'connector', 'flowchart'
  content: text("content"),
  richContent: jsonb("rich_content"), // For rich text items
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  width: integer("width"),
  height: integer("height"),
  style: jsonb("style"), // For styling information
  connectionData: jsonb("connection_data"), // For flowcharts and connections
  mediaUrl: text("media_url"), // For embedded media
  mediaType: text("media_type"), // Type of media (image, video, pdf, etc.)
  userId: integer("user_id").references(() => users.id),
});

export const insertPlaygroundItemSchema = createInsertSchema(playgroundItems).pick({
  playgroundId: true,
  type: true,
  content: true,
  richContent: true,
  positionX: true,
  positionY: true,
  width: true,
  height: true,
  style: true,
  connectionData: true,
  mediaUrl: true,
  mediaType: true,
  userId: true,
});

export type InsertPlaygroundItem = z.infer<typeof insertPlaygroundItemSchema>;
export type PlaygroundItem = typeof playgroundItems.$inferSelect;
