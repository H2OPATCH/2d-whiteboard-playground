import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  notes, type Note, type InsertNote,
  canvasItems, type CanvasItem, type InsertCanvasItem,
  playgrounds, type Playground, type InsertPlayground,
  playgroundItems, type PlaygroundItem, type InsertPlaygroundItem
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

  // Playground methods
  getPlaygrounds(userId?: number): Promise<Playground[]>;
  getPlayground(id: number): Promise<Playground | undefined>;
  createPlayground(playground: InsertPlayground): Promise<Playground>;
  updatePlayground(id: number, playground: Partial<InsertPlayground>): Promise<Playground | undefined>;
  deletePlayground(id: number): Promise<boolean>;

  // Playground item methods
  getPlaygroundItems(playgroundId: number, userId?: number): Promise<PlaygroundItem[]>;
  getPlaygroundItem(id: number): Promise<PlaygroundItem | undefined>;
  createPlaygroundItem(item: InsertPlaygroundItem): Promise<PlaygroundItem>;
  updatePlaygroundItem(id: number, item: Partial<InsertPlaygroundItem>): Promise<PlaygroundItem | undefined>;
  deletePlaygroundItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private notes: Map<number, Note>;
  private canvasItems: Map<number, CanvasItem>;
  private playgrounds: Map<number, Playground>;
  private playgroundItems: Map<number, PlaygroundItem>;
  private userId: number;
  private taskId: number;
  private noteId: number;
  private canvasItemId: number;
  private playgroundId: number;
  private playgroundItemId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.notes = new Map();
    this.canvasItems = new Map();
    this.playgrounds = new Map();
    this.playgroundItems = new Map();
    this.userId = 1;
    this.taskId = 1;
    this.noteId = 1;
    this.canvasItemId = 1;
    this.playgroundId = 1;
    this.playgroundItemId = 1;

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
    const task: Task = { 
      ...insertTask, 
      id,
      completed: insertTask.completed ?? false,
      userId: insertTask.userId ?? null
    };
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
      userId: insertNote.userId ?? null,
      richContent: insertNote.richContent ?? null,
      attachments: insertNote.attachments ?? null,
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
    const item: CanvasItem = { 
      ...insertItem,
      id,
      userId: insertItem.userId ?? null,
      content: insertItem.content ?? null,
      richContent: insertItem.richContent ?? null,
      width: insertItem.width ?? null,
      height: insertItem.height ?? null,
      style: insertItem.style ?? null,
      connectionData: insertItem.connectionData ?? null,
      mediaUrl: insertItem.mediaUrl ?? null,
      mediaType: insertItem.mediaType ?? null
    };
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

  // Playground methods
  async getPlaygrounds(userId?: number): Promise<Playground[]> {
    const allPlaygrounds = Array.from(this.playgrounds.values());
    if (userId) {
      return allPlaygrounds.filter(playground => playground.userId === userId);
    }
    return allPlaygrounds;
  }

  async getPlayground(id: number): Promise<Playground | undefined> {
    return this.playgrounds.get(id);
  }

  async createPlayground(insertPlayground: InsertPlayground): Promise<Playground> {
    const id = this.playgroundId++;
    const playground: Playground = { 
      ...insertPlayground, 
      id, 
      updatedAt: new Date() 
    };
    this.playgrounds.set(id, playground);
    return playground;
  }

  async updatePlayground(id: number, partialPlayground: Partial<InsertPlayground>): Promise<Playground | undefined> {
    const playground = this.playgrounds.get(id);
    if (!playground) return undefined;

    const updatedPlayground = { 
      ...playground, 
      ...partialPlayground,
      updatedAt: new Date()
    };
    this.playgrounds.set(id, updatedPlayground);
    return updatedPlayground;
  }

  async deletePlayground(id: number): Promise<boolean> {
    // Delete all items associated with this playground
    const itemsToDelete = Array.from(this.playgroundItems.values())
      .filter(item => item.playgroundId === id);
    
    for (const item of itemsToDelete) {
      this.playgroundItems.delete(item.id);
    }
    
    return this.playgrounds.delete(id);
  }

  // Playground item methods
  async getPlaygroundItems(playgroundId: number, userId?: number): Promise<PlaygroundItem[]> {
    const allItems = Array.from(this.playgroundItems.values())
      .filter(item => item.playgroundId === playgroundId);
    
    if (userId) {
      return allItems.filter(item => item.userId === userId);
    }
    return allItems;
  }

  async getPlaygroundItem(id: number): Promise<PlaygroundItem | undefined> {
    return this.playgroundItems.get(id);
  }

  async createPlaygroundItem(insertItem: InsertPlaygroundItem): Promise<PlaygroundItem> {
    const id = this.playgroundItemId++;
    const item: PlaygroundItem = { ...insertItem, id };
    this.playgroundItems.set(id, item);
    return item;
  }

  async updatePlaygroundItem(id: number, partialItem: Partial<InsertPlaygroundItem>): Promise<PlaygroundItem | undefined> {
    const item = this.playgroundItems.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...partialItem };
    this.playgroundItems.set(id, updatedItem);
    return updatedItem;
  }

  async deletePlaygroundItem(id: number): Promise<boolean> {
    return this.playgroundItems.delete(id);
  }
}

export const storage = new MemStorage();
