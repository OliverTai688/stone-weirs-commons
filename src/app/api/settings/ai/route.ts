import { encryptionReady } from "@/server/crypto";
import { bad, forbidden, sameOrigin } from "@/server/guard";
import { getPublicSettings, PROVIDERS, removeUserKey, setPreferred, setUserKey, updateModel, type Provider } from "@/server/ai/keystore";
import { listModels, ProviderError } from "@/server/ai/llm";
import { requireSession } from "@/server/session";

const isProvider = (p: unknown): p is Provider => PROVIDERS.includes(p as Provider);

/** BFF: the caller's own AI settings. Keys are write-only from the browser's point of view. */
export async function GET() {
  const session = await requireSession();
  return Response.json({ encryptionReady: encryptionReady(), ...(await getPublicSettings(session)) });
}

/** Save (or replace) a key. The key is validated against the provider before it is stored. */
export async function PUT(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  if (!encryptionReady()) return Response.json({ error: "伺服器尚未設定 APP_ENCRYPTION_KEY，暫時無法儲存金鑰。" }, { status: 503 });
  const { provider, apiKey, model } = (await req.json()) as { provider?: string; apiKey?: string; model?: string };
  if (!isProvider(provider)) return bad("unknown provider");
  if (!apiKey || apiKey.length < 20 || apiKey.length > 300 || /\s/.test(apiKey)) return bad("金鑰格式不正確");
  if (!model || model.length > 100) return bad("請選擇模型");
  const session = await requireSession();
  try {
    const models = await listModels(provider, apiKey);
    if (models.length && !models.some((m) => m.id === model)) return bad("這把金鑰無法使用所選的模型");
  } catch (err) {
    const status = err instanceof ProviderError ? err.status : 0;
    return bad(status === 401 || status === 403 ? "金鑰無效，供應商拒絕了這把金鑰" : "暫時無法連線到 AI 供應商，請稍後再試");
  }
  await setUserKey(session, provider, apiKey, model);
  return Response.json(await getPublicSettings(session));
}

/** Change model or preferred provider. */
export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const { provider, model, preferred } = (await req.json()) as { provider?: string; model?: string; preferred?: string };
  const session = await requireSession();
  if (isProvider(preferred)) await setPreferred(session, preferred);
  if (isProvider(provider) && model) await updateModel(session, provider, model);
  return Response.json(await getPublicSettings(session));
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const provider = new URL(req.url).searchParams.get("provider");
  if (!isProvider(provider)) return bad("unknown provider");
  const session = await requireSession();
  await removeUserKey(session, provider);
  return Response.json(await getPublicSettings(session));
}
