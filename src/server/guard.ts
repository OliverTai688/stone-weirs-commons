import "server-only";

/** CSRF guard for state-changing BFF calls: the request must come from this site. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const forbidden = () => Response.json({ error: "forbidden" }, { status: 403 });
export const bad = (error: string) => Response.json({ error }, { status: 400 });
