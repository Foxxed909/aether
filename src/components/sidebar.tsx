"use client";

import { MessageSquare, Code2, Plus, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Conversation, Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  mode,
  onModeChange,
  conversations,
  activeId,
  onSelect,
  onNew,
  onOpenSettings,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();

  const filtered = conversations.filter((c) => c.mode === mode);

  return (
    <aside className="bg-card flex h-full w-64 flex-col border-r">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
          A
        </div>
        <span className="font-semibold tracking-tight">Aether</span>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-1 p-3">
        <Button
          variant={mode === "chat" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => onModeChange("chat")}
        >
          <MessageSquare className="size-4" />
          Chat
        </Button>
        <Button
          variant={mode === "code" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => onModeChange("code")}
        >
          <Code2 className="size-4" />
          Code
        </Button>
      </div>

      <Separator />

      {/* New Chat */}
      <div className="p-3">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={onNew}>
          <Plus className="size-4" />
          New {mode === "chat" ? "Chat" : "Session"}
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {filtered.length === 0 && (
            <p className="text-muted-foreground px-2 py-4 text-center text-xs">
              No conversations yet
            </p>
          )}
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                activeId === c.id && "bg-accent"
              )}
            >
              <div className="truncate font-medium">{c.title || "Untitled"}</div>
              <div className="text-muted-foreground text-xs">
                {new Date(c.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-3 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onOpenSettings}
        >
          <Settings className="size-4" />
          Settings & Keys
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {theme === "dark" ? "Light" : "Dark"} mode
        </Button>
      </div>
    </aside>
  );
}
