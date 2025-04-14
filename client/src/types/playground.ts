export interface Playground {
  id: number;
  name: string;
  description?: string;
  items: PlaygroundItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaygroundItem {
  id: number;
  title: string;
  type: 'code' | 'markdown';
  content: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
} 