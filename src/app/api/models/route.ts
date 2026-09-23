import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Optional: fetch models from OpenRouter when user has a key
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({
      models: [
        { id: "openrouter/auto", name: "OpenRouter Auto" },
        { id: "openai/gpt-4o", name: "GPT-4o" },
        { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
        { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
        { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
        { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
        { id: "xai/grok-3-beta", name: "Grok 3 Beta" },
        { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
        { id: "deepseek/deepseek-chat", name: "DeepSeek Chat" },
      ],
    });
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch models");
    }

    const data = await res.json();
    const models = (data.data || []).map((m: any) => ({
      id: m.id,
      name: m.name || m.id,
      contextLength: m.context_length,
    }));

    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [] });
  }
}
