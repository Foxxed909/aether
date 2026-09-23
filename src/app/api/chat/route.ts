import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface ChatRequest {
  messages: { role: string; content: string }[];
  model: string;
  apiKey: string;
  provider: string;
  baseUrl?: string;
  mode: "chat" | "code";
}

function getBaseUrl(provider: string, customBase?: string): string {
  if (customBase) return customBase.replace(/\/$/, "");
  switch (provider) {
    case "openrouter":
      return "https://openrouter.ai/api/v1";
    case "openai":
      return "https://api.openai.com/v1";
    case "anthropic":
      return "https://api.anthropic.com/v1";
    case "google":
      return "https://generativelanguage.googleapis.com/v1beta";
    case "xai":
      return "https://api.x.ai/v1";
    default:
      return "https://openrouter.ai/api/v1";
  }
}

function normalizeModel(model: string, provider: string): string {
  // OpenRouter expects provider/model format
  if (provider === "openrouter") {
    if (model === "openrouter/auto") return "openrouter/auto";
    return model;
  }
  // For direct providers, strip provider prefix if present
  if (model.includes("/")) {
    return model.split("/").slice(1).join("/");
  }
  return model;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, model, apiKey, provider, baseUrl, mode } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const systemPrompt =
      mode === "code"
        ? "You are an expert coding assistant. Provide clear, well-structured code with explanations. Use markdown code blocks with language tags. Be concise but thorough."
        : "You are Aether, a helpful, thoughtful AI assistant. Be clear, accurate, and engaging.";

    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ];

    // Anthropic has a different API shape
    if (provider === "anthropic") {
      const anthropicMessages = finalMessages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: normalizeModel(model, provider),
          max_tokens: 4096,
          system: systemPrompt,
          messages: anthropicMessages,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { error: `Anthropic error: ${errText}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      const content =
        data.content?.[0]?.text || data.content || "No response";
      return NextResponse.json({ content });
    }

    // OpenAI-compatible (OpenRouter, OpenAI, xAI, custom)
    const endpoint = `${getBaseUrl(provider, baseUrl)}/chat/completions`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    // OpenRouter specific headers
    if (provider === "openrouter") {
      headers["HTTP-Referer"] = "https://aether.app";
      headers["X-Title"] = "Aether";
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: normalizeModel(model, provider),
        messages: finalMessages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Provider error (${res.status}): ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const content =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.text ||
      "No response received";

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
