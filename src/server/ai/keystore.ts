import "server-only";
import { cookies } from "next/headers";
import { decrypt, encrypt, last4 } from "../crypto";
import type { Session } from "../session";

export type Provider = "anthropic" | "openai";
export const PROVIDERS: Provider[] = ["anthropic", "openai"];

interface StoredKey {
  key: string;
  model: string;
  addedAt: string;
}
interface StoredSettings {
  owner: string; // userId — a settings blob is only honoured for its owner
  preferred: Provider | null;
  providers: Partial<Record<Provider, StoredKey>>;
}

/** What the browser is allowed to see: never the key itself. */
export interface PublicAiSettings {
  preferred: Provider | null;
  providers: Partial<Record<Provider, { last4: string; model: string; addedAt: string }>>;
}

/**
 * Per-user API key storage.
 *
 * DEMO: one AES-256-GCM encrypted, httpOnly cookie per browser (no database needed).
 * NEXT: `user_ai_keys` table (see supabase/schema.sql), read only by the BFF with the
 * service role. Same interface, so routes do not change.
 */
const COOKIE = "swc_ai";

async function load(session: Session): Promise<StoredSettings> {
  const raw = (await cookies()).get(COOKIE)?.value;
  const empty: StoredSettings = { owner: session.userId, preferred: null, providers: {} };
  if (!raw) return empty;
  const json = decrypt(raw);
  if (!json) return empty;
  try {
    const s = JSON.parse(json) as StoredSettings;
    return s.owner === session.userId ? s : empty;
  } catch {
    return empty;
  }
}

async function save(s: StoredSettings) {
  (await cookies()).set(COOKIE, encrypt(JSON.stringify(s)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function getPublicSettings(session: Session | null): Promise<PublicAiSettings> {
  if (!session) return { preferred: null, providers: {} };
  const s = await load(session);
  const providers: PublicAiSettings["providers"] = {};
  for (const p of PROVIDERS) {
    const k = s.providers[p];
    if (k) providers[p] = { last4: last4(k.key), model: k.model, addedAt: k.addedAt };
  }
  return { preferred: s.preferred, providers };
}

export async function getUserKey(session: Session | null, provider?: Provider): Promise<{ provider: Provider; key: string; model: string } | null> {
  if (!session) return null;
  const s = await load(session);
  const order = provider ? [provider] : ([s.preferred, ...PROVIDERS].filter(Boolean) as Provider[]);
  for (const p of order) {
    const k = s.providers[p];
    if (k) return { provider: p, key: k.key, model: k.model };
  }
  return null;
}

export async function setUserKey(session: Session, provider: Provider, key: string, model: string) {
  const s = await load(session);
  s.providers[provider] = { key, model, addedAt: new Date().toISOString().slice(0, 10) };
  if (!s.preferred) s.preferred = provider;
  await save(s);
}

export async function updateModel(session: Session, provider: Provider, model: string) {
  const s = await load(session);
  const k = s.providers[provider];
  if (k) {
    k.model = model;
    await save(s);
  }
}

export async function setPreferred(session: Session, provider: Provider) {
  const s = await load(session);
  if (s.providers[provider]) {
    s.preferred = provider;
    await save(s);
  }
}

export async function removeUserKey(session: Session, provider: Provider) {
  const s = await load(session);
  delete s.providers[provider];
  if (s.preferred === provider) s.preferred = (PROVIDERS.find((p) => s.providers[p]) ?? null) as Provider | null;
  await save(s);
}
