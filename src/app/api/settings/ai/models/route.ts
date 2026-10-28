import { bad, forbidden, sameOrigin } from "@/server/guard";
import { getUserKey, PROVIDERS, type Provider } from "@/server/ai/keystore";
import { listModels, ProviderError } from "@/server/ai/llm";
import { requireSession } from "@/server/session";
import { langFromRequest } from "@/i18n/config";
import { msg } from "@/server/messages";

/** BFF: validate a key (new or stored) and list the models it can use. Never echoes the key. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const { provider, apiKey } = (await req.json()) as { provider?: Provider; apiKey?: string };
  if (!provider || !PROVIDERS.includes(provider)) return bad("unknown provider");
  const m = msg(langFromRequest(req));
  const session = await requireSession();
  const key = apiKey || (await getUserKey(session, provider))?.key;
  if (!key) return bad(m.enterKey);
  try {
    return Response.json({ models: await listModels(provider, key) });
  } catch (err) {
    const status = err instanceof ProviderError ? err.status : 0;
    return bad(status === 401 || status === 403 ? m.rejected : m.unreachable);
  }
}
