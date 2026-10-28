import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * AES-256-GCM envelope for secrets at rest (user API keys).
 * The key comes from APP_ENCRYPTION_KEY (server env only). Rotating it invalidates stored secrets.
 */
function key(): Buffer | null {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw || raw.length < 32) return null;
  return createHash("sha256").update(raw).digest();
}

export const encryptionReady = () => key() !== null;

export function encrypt(plain: string): string {
  const k = key();
  if (!k) throw new Error("APP_ENCRYPTION_KEY is not configured");
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", k, iv);
  const body = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return ["v1", iv.toString("base64url"), c.getAuthTag().toString("base64url"), body.toString("base64url")].join(".");
}

export function decrypt(token: string): string | null {
  const k = key();
  if (!k) return null;
  try {
    const [v, iv, tag, body] = token.split(".");
    if (v !== "v1") return null;
    const d = createDecipheriv("aes-256-gcm", k, Buffer.from(iv, "base64url"));
    d.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([d.update(Buffer.from(body, "base64url")), d.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export const last4 = (s: string) => s.slice(-4);
