import "server-only";
import { checkAndReserve, release } from "./limits";
import { sendMail, type SendResult } from "./transport";
import { buildWelcome, type WelcomeInput } from "./welcome";

export type WelcomeOutcome = SendResult | { ok: false; reason: "duplicate" | "recipient_limit" | "hourly_cap" };

/** One entry point for every welcome email the site sends (FormHug webhook, site sign-up). */
export async function sendWelcome(input: WelcomeInput, dedupeKey?: string): Promise<WelcomeOutcome> {
  const gate = checkAndReserve(input.to, dedupeKey);
  if (!gate.ok) return gate;
  const res = await sendMail(buildWelcome(input));
  if (!res.ok) release(input.to, dedupeKey);
  // Log the outcome without personal data.
  console.info(`[welcome-email] source=${input.source} lang=${input.lang} result=${res.ok ? "sent" : res.reason}`);
  return res;
}
