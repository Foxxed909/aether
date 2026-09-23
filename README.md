# Aether – Unified AI Workspace

A modern, multi-mode AI application with **Chat** and **Code** modes, full OpenRouter support, and secure API key management.

## Features (v1)

- **Chat Mode** – Fast daily conversation with streaming
- **Code Mode** – Dedicated coding workspace with syntax highlighting
- **API Key Management** – Support for OpenRouter + OpenAI, Anthropic, Google, xAI, and any OpenAI-compatible endpoint
- **Model IDs** – Searchable model list + custom Model ID pasting
- Local-first with optional cloud sync (coming soon)
- Dark / Light theme
- Clean hybrid UI (minimalist + dense)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- AI SDK (Vercel AI SDK)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

No server-side keys required. Users add their own API keys in the app (stored encrypted in localStorage for now).

## Roadmap

- Work mode + deep plugins (GitHub, Vercel, Gmail, Google Drive)
- Fully autonomous Agent mode
- Cloud sync (Supabase)
- Desktop app (Tauri)

---

Built for personal use. Star the repo if you like it!
