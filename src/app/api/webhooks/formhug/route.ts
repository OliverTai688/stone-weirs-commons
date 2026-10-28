import { timingSafeEqual } from "node:crypto";
import { cleanName } from "@/server/email/welcome";
import { isEmail } from "@/server/email/limits";
import { sendWelcome } from "@/server/email/send-welcome";

/**
 * FormHug → site: called by the form's webhook on every new entry (entry_created).
 * Sends the welcome email from the site itself. FormHug does not sign webhooks, so:
 *  - only the configured form is accepted,
 *  - an optional shared key (?key=, env FORMHUG_WEBHOOK_SECRET) can be required,
 *  - per-recipient / hourly limits apply (see server/email/limits.ts).
 */
interface Payload {
  event_type?: string;
  data?: { form?: string; entry?: Record<string, unknown> };
}

function keyMatches(given: string | null) {
  const secret = process.env.FORMHUG_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!keyMatches(new URL(req.url).searchParams.get("key"))) return Response.json({ error: "forbidden" }, { status: 403 });
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  const form = process.env.FORMHUG_FORM_TOKEN || "SMbOkH";
  if (body.event_type !== "entry_created" || body.data?.form !== form || !body.data.entry) {
    return Response.json({ ignored: true });
  }
  const e = body.data.entry;
  const to = e.field_2;
  if (!isEmail(to)) return Response.json({ ignored: true, reason: "no valid email" });

  const result = await sendWelcome(
    {
      to,
      name: cleanName(e.field_1) || "there",
      lang: "en", // the FormHug form is in English
      source: "apconf6",
      interests: Array.isArray(e.field_5) ? (e.field_5 as unknown[]).map(String) : [],
      pilot: typeof e.field_8 === "string" ? e.field_8 : undefined,
    },
    `formhug:${form}:${String(e.serial_number ?? "")}`,
  );

  if (!result.ok && result.reason === "failed") return Response.json({ sent: false, reason: "failed" }, { status: 502 }); // let FormHug retry
  return Response.json({ sent: result.ok, ...(result.ok ? {} : { reason: result.reason }) });
}
