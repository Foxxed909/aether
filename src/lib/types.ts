export type Mode = "chat" | "code";

export type Provider =
  | "openrouter"
  | "openai"
  | "anthropic"
  | "google"
  | "xai"
  | "custom";

export interface ApiKeyConfig {
  id: string;
  provider: Provider;
  name: string;
  key: string;
  baseUrl?: string;
  createdAt: number;
}

export interface ModelConfig {
  id: string; // e.g. "openai/gpt-4o" or "gpt-4o"
  name: string;
  provider: Provider;
  contextLength?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  mode: Mode;
  messages: Message[];
  modelId: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  defaultChatModel: string;
  defaultCodeModel: string;
  temperature: number;
  maxTokens: number;
}
