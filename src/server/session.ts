import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

/**
 * Who is calling the BFF.
 *
 * DEMO: an anonymous per-browser id in an httpOnly cookie, so every visitor is
 * already an isolated "user" (own AI keys, own drafts).
 * NEXT: replace with the Supabase session (auth.getUser()) — the shape stays the same,
 * so callers do not change. tenantIds will come from node_members.
 */
export interface Session {
  userId: string;
  kind: "anonymous" | "member";
  role: "visitor" | "member" | "admin";
  tenantIds: string[]; // node slugs this user belongs to
}

const UID = "swc_uid";

/** Read-only: safe in Server Components. */
export async function getSession(): Promise<Session | null> {
  const id = (await cookies()).get(UID)?.value;
  return id ? { userId: id, kind: "anonymous", role: "visitor", tenantIds: [] } : null;
}

/** Creates the anonymous id if needed. Only call from Route Handlers / Server Actions. */
export async function requireSession(): Promise<Session> {
  const jar = await cookies();
  let id = jar.get(UID)?.value;
  if (!id) {
    id = randomUUID();
    jar.set(UID, id, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return { userId: id, kind: "anonymous", role: "visitor", tenantIds: [] };
}

/** Tenant guard for BFF handlers: a user may only act inside nodes they belong to. */
export function assertTenant(session: Session, nodeSlug: string) {
  if (session.role === "admin" || session.tenantIds.includes(nodeSlug)) return;
  throw new Response("forbidden", { status: 403 });
}
