"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ApiKeyConfig, Provider } from "@/lib/types";
import { getApiKeys, saveApiKeys } from "@/lib/storage";

const PROVIDERS: { value: Provider; label: string; placeholder: string }[] = [
  { value: "openrouter", label: "OpenRouter", placeholder: "sk-or-v1-..." },
  { value: "openai", label: "OpenAI", placeholder: "sk-..." },
  { value: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
  { value: "google", label: "Google (Gemini)", placeholder: "AIza..." },
  { value: "xai", label: "xAI (Grok)", placeholder: "xai-..." },
  { value: "custom", label: "Custom (OpenAI-compatible)", placeholder: "sk-..." },
];

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyConfig[]>([]);
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<Provider>("openrouter");
  const [name, setName] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setKeys(getApiKeys());
  }, []);

  const handleAdd = () => {
    if (!keyValue.trim()) return;
    const newKey: ApiKeyConfig = {
      id: crypto.randomUUID(),
      provider,
      name: name.trim() || PROVIDERS.find((p) => p.value === provider)?.label || provider,
      key: keyValue.trim(),
      baseUrl: provider === "custom" ? baseUrl.trim() || undefined : undefined,
      createdAt: Date.now(),
    };
    const updated = [...keys, newKey];
    setKeys(updated);
    saveApiKeys(updated);
    setName("");
    setKeyValue("");
    setBaseUrl("");
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = keys.filter((k) => k.id !== id);
    setKeys(updated);
    saveApiKeys(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">API Keys</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="size-4" />
              Add Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add API Key</DialogTitle>
              <DialogDescription>
                Keys are stored locally in your browser (encrypted storage coming soon).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Provider</Label>
                <select
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as Provider)}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Display Name (optional)</Label>
                <Input
                  placeholder="My OpenRouter Key"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder={PROVIDERS.find((p) => p.value === provider)?.placeholder}
                    value={keyValue}
                    onChange={(e) => setKeyValue(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {provider === "custom" && (
                <div className="grid gap-2">
                  <Label>Base URL</Label>
                  <Input
                    placeholder="https://api.example.com/v1"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} disabled={!keyValue.trim()}>
                Save Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {keys.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No API keys yet. Add an OpenRouter key to get started with hundreds of models.
        </p>
      ) : (
        <ul className="space-y-2">
          {keys.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <Key className="size-4 text-muted-foreground" />
                <span className="font-medium">{k.name}</span>
                <span className="text-muted-foreground text-xs uppercase">{k.provider}</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-destructive"
                onClick={() => handleDelete(k.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
