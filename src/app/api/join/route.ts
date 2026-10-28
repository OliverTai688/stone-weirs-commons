import { isLang } from "@/i18n/config";
import { cleanName } from "@/server/email/welcome";
import { isEmail } from "@/server/email/limits";
import { sendWelcome } from "@/server/email/send-welcome";
import { bad, forbidden, sameOrigin } from "@/server/guard";

/**
 * BFF: site sign-up. Filling the form = registered; a welcome email is sent right away.
 * DEMO: the profile itself is still kept in the browser (see JoinForm); with Supabase it is
 * written to `profiles` + `consents` here, after the Google session is verified.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const b = (await req.json().catch(() => ({}))) as { fullName?: string; email?: string; privacy?: boolean; contact?: boolean; lang?: string; source?: string };
  if (!b.privacy) return bad("privacy consent required");
  if (!isEmail(b.email)) return bad("invalid email");
  const name = cleanName(b.fullName);
  if (!name) return bad("name required");
  // TODO(supabase): upsert profiles + consents (privacy_policy, contact_followup) for the signed-in user.
  const result = await sendWelcome({
    to: b.email,
    name,
    lang: isLang(b.lang) ? b.lang : "en",
    source: b.source === "apconf6" || b.source === "apconf2026" ? "apconf6" : "site",
  });
  return Response.json({ registered: true, emailed: result.ok, ...(result.ok ? {} : { reason: result.reason }) });
}
