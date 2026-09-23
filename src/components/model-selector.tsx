"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const POPULAR_MODELS = [
  { id: "openrouter/auto", name: "OpenRouter Auto" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
  { id: "xai/grok-3-beta", name: "Grok 3 Beta" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek Chat" },
  { id: "mistralai/mistral-large", name: "Mistral Large" },
];

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [customId, setCustomId] = useState("");
  const [search, setSearch] = useState("");

  const filtered = POPULAR_MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase())
  );

  const displayName =
    POPULAR_MODELS.find((m) => m.id === value)?.name || value || "Select model";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="max-w-[220px] justify-between gap-2">
          <span className="truncate text-xs">{displayName}</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Model</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Search models or paste Model ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {filtered.map((m) => (
              <button
                key={m.id}
                className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent ${
                  value === m.id ? "bg-accent" : ""
                }`}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
              >
                <div className="font-medium">{m.name}</div>
                <div className="text-muted-foreground text-xs font-mono">{m.id}</div>
              </button>
            ))}
          </div>
          <div className="border-t pt-3">
            <p className="text-muted-foreground mb-2 text-xs">Or paste any Model ID (OpenRouter style)</p>
            <div className="flex gap-2">
              <Input
                placeholder="provider/model-name"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (customId.trim()) {
                    onChange(customId.trim());
                    setOpen(false);
                    setCustomId("");
                  }
                }}
              >
                Use
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
