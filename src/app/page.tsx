"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat-area";
import { ApiKeyManager } from "@/components/api-key-manager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Conversation, Message, Mode } from "@/lib/types";
import {
  getConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
  getApiKeys,
  getSettings,
} from "@/lib/storage";

export default function Home() {
  const [mode, setMode] = useState<Mode>("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const convs = getConversations();
    setConversations(convs);
    const active = getActiveConversationId();
    if (active && convs.some((c) => c.id === active)) {
      setActiveId(active);
      const found = convs.find((c) => c.id === active);
      if (found) setMode(found.mode);
    }
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const updateConversations = useCallback((updated: Conversation[]) => {
    setConversations(updated);
    saveConversations(updated);
  }, []);

  const createNewConversation = useCallback(() => {
    const settings = getSettings();
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: "New conversation",
      mode,
      messages: [],
      modelId: mode === "chat" ? settings.defaultChatModel : settings.defaultCodeModel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newConv, ...conversations];
    updateConversations(updated);
    setActiveId(newConv.id);
    setActiveConversationId(newConv.id);
  }, [mode, conversations, updateConversations]);

  const handleSelect = (id: string) => {
    setActiveId(id);
    setActiveConversationId(id);
    const found = conversations.find((c) => c.id === id);
    if (found) setMode(found.mode);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    // Switch to a conversation of that mode or create new
    const existing = conversations.find((c) => c.mode === newMode);
    if (existing) {
      setActiveId(existing.id);
      setActiveConversationId(existing.id);
    } else {
      setActiveId(null);
      setActiveConversationId(null);
    }
  };

  const handleModelChange = (modelId: string) => {
    if (!activeConversation) return;
    const updated = conversations.map((c) =>
      c.id === activeId ? { ...c, modelId, updatedAt: Date.now() } : c
    );
    updateConversations(updated);
  };

  const handleSend = async (content: string) => {
    let conv = activeConversation;

    // Create conversation if none active
    if (!conv) {
      const settings = getSettings();
      conv = {
        id: crypto.randomUUID(),
        title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
        mode,
        messages: [],
        modelId: mode === "chat" ? settings.defaultChatModel : settings.defaultCodeModel,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setActiveId(conv.id);
      setActiveConversationId(conv.id);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: Date.now(),
    };

    const updatedMessages = [...conv.messages, userMessage];
    let updatedConv: Conversation = {
      ...conv,
      messages: updatedMessages,
      title: conv.messages.length === 0 ? content.slice(0, 40) + (content.length > 40 ? "..." : "") : conv.title,
      updatedAt: Date.now(),
    };

    const newList = [
      updatedConv,
      ...conversations.filter((c) => c.id !== conv!.id),
    ];
    updateConversations(newList);

    // Call the API
    setIsLoading(true);
    try {
      const keys = getApiKeys();
      if (keys.length === 0) {
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "⚠️ No API key found. Please add an OpenRouter (or other) API key in Settings.",
          createdAt: Date.now(),
        };
        updatedConv = {
          ...updatedConv,
          messages: [...updatedMessages, errorMsg],
          updatedAt: Date.now(),
        };
        updateConversations([
          updatedConv,
          ...conversations.filter((c) => c.id !== conv!.id),
        ]);
        setIsLoading(false);
        return;
      }

      // Prefer OpenRouter key, otherwise first available
      const openRouterKey = keys.find((k) => k.provider === "openrouter");
      const keyToUse = openRouterKey || keys[0];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: updatedConv.modelId,
          apiKey: keyToUse.key,
          provider: keyToUse.provider,
          baseUrl: keyToUse.baseUrl,
          mode,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Request failed");
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content || "No response received.",
        createdAt: Date.now(),
      };

      updatedConv = {
        ...updatedConv,
        messages: [...updatedMessages, assistantMessage],
        updatedAt: Date.now(),
      };
      updateConversations([
        updatedConv,
        ...conversations.filter((c) => c.id !== conv!.id),
      ]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⚠️ Error: ${err.message || "Something went wrong"}`,
        createdAt: Date.now(),
      };
      updatedConv = {
        ...updatedConv,
        messages: [...updatedMessages, errorMsg],
        updatedAt: Date.now(),
      };
      updateConversations([
        updatedConv,
        ...conversations.filter((c) => c.id !== conv!.id),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading Aether...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        mode={mode}
        onModeChange={handleModeChange}
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={createNewConversation}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 overflow-hidden">
        <ChatArea
          mode={mode}
          messages={activeConversation?.messages || []}
          modelId={activeConversation?.modelId || "openrouter/auto"}
          onModelChange={handleModelChange}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </main>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Settings & API Keys</DialogTitle>
          </DialogHeader>
          <ApiKeyManager />
        </DialogContent>
      </Dialog>
    </div>
  );
}
