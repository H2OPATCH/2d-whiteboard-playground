import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  notes, type Note, type InsertNote,
  canvasItems, type CanvasItem, type InsertCanvasItem 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Task methods
  getTasks(userId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Note methods
  getNotes(userId?: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;

  // Canvas item methods
  getCanvasItems(userId?: number): Promise<CanvasItem[]>;
  getCanvasItem(id: number): Promise<CanvasItem | undefined>;
  createCanvasItem(item: InsertCanvasItem): Promise<CanvasItem>;
  updateCanvasItem(id: number, item: Partial<InsertCanvasItem>): Promise<CanvasItem | undefined>;
  deleteCanvasItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private notes: Map<number, Note>;
  private canvasItems: Map<number, CanvasItem>;
  private userId: number;
  private taskId: number;
  private noteId: number;
  private canvasItemId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.notes = new Map();
    this.canvasItems = new Map();
    this.userId = 1;
    this.taskId = 1;
    this.noteId = 1;
    this.canvasItemId = 1;

    // Add a default user for demo purposes
    this.createUser({ username: "demo", password: "demo" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task methods
  async getTasks(userId?: number): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());
    if (userId) {
      return allTasks.filter(task => task.userId === userId);
    }
    return allTasks;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, partialTask: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...partialTask };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Note methods
  async getNotes(userId?: number): Promise<Note[]> {
    const allNotes = Array.from(this.notes.values());
    if (userId) {
      return allNotes.filter(note => note.userId === userId);
    }
    return allNotes;
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteId++;
    const note: Note = { 
      ...insertNote, 
      id, 
      updatedAt: new Date() 
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, partialNote: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;

    const updatedNote = { 
      ...note, 
      ...partialNote,
      updatedAt: new Date()
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Canvas item methods
  async getCanvasItems(userId?: number): Promise<CanvasItem[]> {
    const allItems = Array.from(this.canvasItems.values());
    if (userId) {
      return allItems.filter(item => item.userId === userId);
    }
    return allItems;
  }

  async getCanvasItem(id: number): Promise<CanvasItem | undefined> {
    return this.canvasItems.get(id);
  }

  async createCanvasItem(insertItem: InsertCanvasItem): Promise<CanvasItem> {
    const id = this.canvasItemId++;
    const item: CanvasItem = { ...insertItem, id };
    this.canvasItems.set(id, item);
    return item;
  }

  async updateCanvasItem(id: number, partialItem: Partial<InsertCanvasItem>): Promise<CanvasItem | undefined> {
    const item = this.canvasItems.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...partialItem };
    this.canvasItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteCanvasItem(id: number): Promise<boolean> {
    return this.canvasItems.delete(id);
  }
}

export const storage = new MemStorage();
