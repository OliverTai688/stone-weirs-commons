import "server-only";
import { getUserKey, type Provider } from "./keystore";
import type { Session } from "../session";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export interface AiClient {
  provider: Provider;
  model: string;
  source: "user" | "platform";
  chat(system: string, messages: ChatMessage[], maxTokens?: number): Promise<string>;
}

/** Public description of the engine that answered — shown in the UI. */
export type EngineInfo = { kind: "demo" } | { kind: "llm"; provider: Provider; model: string; source: "user" | "platform" };
export const engineOf = (ai: AiClient | null): EngineInfo => (ai ? { kind: "llm", provider: ai.provider, model: ai.model, source: ai.source } : { kind: "demo" });

const TIMEOUT_MS = 45_000;
// Overridable for gateways / proxies (and local testing). Server env only.
const ANTHROPIC_BASE = () => process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
const OPENAI_BASE = () => process.env.OPENAI_BASE_URL || "https://api.openai.com";

async function post(url: string, headers: Record<string, string>, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new ProviderError(res.status, (await res.text()).slice(0, 300));
  return res.json();
}

export class ProviderError extends Error {
  constructor(public status: number, detail: string) {
    super(`provider ${status}: ${detail}`);
  }
}

export function makeClient(provider: Provider, key: string, model: string, source: "user" | "platform"): AiClient {
  return {
    provider,
    model,
    source,
    async chat(system, messages, maxTokens = 1200) {
      if (provider === "anthropic") {
        const data = (await post(`${ANTHROPIC_BASE()}/v1/messages`, { "x-api-key": key, "anthropic-version": "2023-06-01" }, { model, max_tokens: maxTokens, system, messages })) as {
          content: { type: string; text?: string }[];
        };
        return data.content.filter((c) => c.type === "text").map((c) => c.text).join("");
      }
      const data = (await post(`${OPENAI_BASE()}/v1/chat/completions`, { authorization: `Bearer ${key}` }, {
        model,
        max_completion_tokens: maxTokens,
        messages: [{ role: "system", content: system }, ...messages],
      })) as { choices: { message: { content: string | null } }[] };
      return data.choices[0]?.message.content ?? "";
    },
  };
}

/**
 * Resolution order: the caller's own key (BYOK) → platform key (optional env) → null (demo engine).
 * Keys never leave the server.
 */
export async function resolveAi(session: Session | null): Promise<AiClient | null> {
  const own = await getUserKey(session);
  if (own) return makeClient(own.provider, own.key, own.model, "user");
  if (process.env.ANTHROPIC_API_KEY) return makeClient("anthropic", process.env.ANTHROPIC_API_KEY, process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", "platform");
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL) return makeClient("openai", process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL, "platform");
  return null;
}

/** Validates a key by listing models; returns chat-capable model ids. */
export async function listModels(provider: Provider, key: string): Promise<{ id: string; label: string }[]> {
  if (provider === "anthropic") {
    const res = await fetch(`${ANTHROPIC_BASE()}/v1/models?limit=100`, { headers: { "x-api-key": key, "anthropic-version": "2023-06-01" }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new ProviderError(res.status, (await res.text()).slice(0, 200));
    const data = (await res.json()) as { data: { id: string; display_name?: string }[] };
    return data.data.map((m) => ({ id: m.id, label: m.display_name ?? m.id }));
  }
  const res = await fetch(`${OPENAI_BASE()}/v1/models`, { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new ProviderError(res.status, (await res.text()).slice(0, 200));
  const data = (await res.json()) as { data: { id: string; created?: number }[] };
  const NOT_CHAT = /(embed|whisper|tts|audio|realtime|transcribe|dall-e|image|moderation|search|babbage|davinci|computer-use)/i;
  return data.data
    .filter((m) => /^(gpt|o\d|chatgpt)/i.test(m.id) && !NOT_CHAT.test(m.id))
    .sort((a, b) => (b.created ?? 0) - (a.created ?? 0))
    .map((m) => ({ id: m.id, label: m.id }));
}

export function extractJson<T>(text: string): T | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as T;
  } catch {
    return null;
  }
}
