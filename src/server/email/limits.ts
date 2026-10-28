import "server-only";

/**
 * Abuse guard for outgoing welcome mail. The sign-up form is public, so anyone could enter
 * someone else's address; these limits stop the site being used to flood an inbox.
 *
 * DEMO: in-memory per server instance (resets on cold start).
 * NEXT: an `email_log` table in Supabase with a unique (recipient, kind) constraint.
 */
const PER_RECIPIENT_MS = 24 * 60 * 60 * 1000;
const HOURLY_CAP = Number(process.env.EMAIL_HOURLY_CAP || 60);

const lastSent = new Map<string, number>();
const recent: number[] = [];
const seenKeys = new Set<string>();

export function checkAndReserve(recipient: string, dedupeKey?: string): { ok: true } | { ok: false; reason: "duplicate" | "recipient_limit" | "hourly_cap" } {
  const now = Date.now();
  if (dedupeKey && seenKeys.has(dedupeKey)) return { ok: false, reason: "duplicate" };
  const key = recipient.trim().toLowerCase();
  const last = lastSent.get(key);
  if (last && now - last < PER_RECIPIENT_MS) return { ok: false, reason: "recipient_limit" };
  while (recent.length && now - recent[0] > 60 * 60 * 1000) recent.shift();
  if (recent.length >= HOURLY_CAP) return { ok: false, reason: "hourly_cap" };
  lastSent.set(key, now);
  recent.push(now);
  if (dedupeKey) seenKeys.add(dedupeKey);
  return { ok: true };
}

/** Undo a reservation when sending failed, so a retry can go through. */
export function release(recipient: string, dedupeKey?: string) {
  lastSent.delete(recipient.trim().toLowerCase());
  recent.pop();
  if (dedupeKey) seenKeys.delete(dedupeKey);
}

export const isEmail = (s: unknown): s is string => typeof s === "string" && s.length <= 254 && /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]{2,}$/.test(s);
