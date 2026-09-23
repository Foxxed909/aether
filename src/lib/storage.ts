import type { ApiKeyConfig, Conversation, AppSettings } from "./types";

const KEYS = {
  apiKeys: "aether_api_keys",
  conversations: "aether_conversations",
  settings: "aether_settings",
  activeConversation: "aether_active_conversation",
} as const;

export function getApiKeys(): ApiKeyConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.apiKeys);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveApiKeys(keys: ApiKeyConfig[]) {
  localStorage.setItem(KEYS.apiKeys, JSON.stringify(keys));
}

export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.conversations);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  localStorage.setItem(KEYS.conversations, JSON.stringify(conversations));
}

export function getSettings(): AppSettings {
  if (typeof window === "undefined") {
    return {
      theme: "system",
      defaultChatModel: "openrouter/auto",
      defaultCodeModel: "anthropic/claude-3.5-sonnet",
      temperature: 0.7,
      maxTokens: 4096,
    };
  }
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    theme: "system",
    defaultChatModel: "openrouter/auto",
    defaultCodeModel: "anthropic/claude-3.5-sonnet",
    temperature: 0.7,
    maxTokens: 4096,
  };
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function getActiveConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYS.activeConversation);
}

export function setActiveConversationId(id: string | null) {
  if (id) localStorage.setItem(KEYS.activeConversation, id);
  else localStorage.removeItem(KEYS.activeConversation);
}
