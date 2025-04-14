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

// Notes table
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  title: true,
  content: true,
  userId: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Canvas items table
export const canvasItems = pgTable("canvas_items", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'text', 'sticky', 'shape', 'image'
  content: text("content"),
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  width: integer("width"),
  height: integer("height"),
  style: jsonb("style"), // For storing styling information
  userId: integer("user_id").references(() => users.id),
});

export const insertCanvasItemSchema = createInsertSchema(canvasItems).pick({
  type: true,
  content: true,
  positionX: true,
  positionY: true,
  width: true,
  height: true,
  style: true,
  userId: true,
});

export type InsertCanvasItem = z.infer<typeof insertCanvasItemSchema>;
export type CanvasItem = typeof canvasItems.$inferSelect;
