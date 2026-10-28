import { bad, forbidden, sameOrigin } from "@/server/guard";
import { getUserKey, PROVIDERS, type Provider } from "@/server/ai/keystore";
import { listModels, ProviderError } from "@/server/ai/llm";
import { requireSession } from "@/server/session";

/** BFF: validate a key (new or stored) and list the models it can use. Never echoes the key. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const { provider, apiKey } = (await req.json()) as { provider?: Provider; apiKey?: string };
  if (!provider || !PROVIDERS.includes(provider)) return bad("unknown provider");
  const session = await requireSession();
  const key = apiKey || (await getUserKey(session, provider))?.key;
  if (!key) return bad("請先輸入金鑰");
  try {
    return Response.json({ models: await listModels(provider, key) });
  } catch (err) {
    const status = err instanceof ProviderError ? err.status : 0;
    return bad(status === 401 || status === 403 ? "金鑰無效，供應商拒絕了這把金鑰" : "暫時無法連線到 AI 供應商，請稍後再試");
  }
}
