
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'closed';
}

export interface Message {
  id: string;
  sessionId: string;
  content: string;
  sender: 'user' | 'ai';
  aiModel?: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    processingTime?: number;
  };
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadedAt: Date;
  processedAt?: Date;
  isProcessed: boolean;
  metadata?: {
    wordCount?: number;
    language?: string;
    category?: string;
  };
}

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek';
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
}

export interface AnalyticsData {
  totalChats: number;
  avgResponseTime: number;
  commonQuestions: string[];
  userSatisfaction: number;
  aiAccuracy: number;
}
