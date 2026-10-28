import "server-only";
import nodemailer from "nodemailer";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}
export type SendResult = { ok: true; id?: string } | { ok: false; reason: "not_configured" | "failed"; detail?: string };

/**
 * Email transport, chosen by env (server only):
 *  - Gmail SMTP: GMAIL_USER + GMAIL_APP_PASSWORD (a Google "App password"; works without a custom domain,
 *    mail is sent from that Gmail address and appears in its Sent folder).
 *  - Resend:     RESEND_API_KEY + EMAIL_FROM (needs a verified domain to email anyone but yourself).
 *  - SMTP_URL:   any SMTP server, e.g. smtp://user:pass@host:587 (also used for local testing).
 */
export function emailProvider(): "gmail" | "resend" | "smtp" | null {
  if (process.env.SMTP_URL) return "smtp";
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) return "gmail";
  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) return "resend";
  return null;
}

const fromName = () => process.env.EMAIL_FROM_NAME || "Stone Weirs, Shared Futures";

export async function sendMail(m: Mail): Promise<SendResult> {
  const provider = emailProvider();
  if (!provider) return { ok: false, reason: "not_configured" };
  try {
    if (provider === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({ from: `${fromName()} <${process.env.EMAIL_FROM}>`, to: [m.to], subject: m.subject, text: m.text, html: m.html, reply_to: m.replyTo }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) return { ok: false, reason: "failed", detail: `resend ${res.status}` };
      const data = (await res.json()) as { id?: string };
      return { ok: true, id: data.id };
    }
    const transporter =
      provider === "smtp"
        ? nodemailer.createTransport(process.env.SMTP_URL as string)
        : nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
    const from = provider === "gmail" ? `${fromName()} <${process.env.GMAIL_USER}>` : `${fromName()} <${process.env.EMAIL_FROM || "no-reply@localhost"}>`;
    const info = await transporter.sendMail({ from, to: m.to, subject: m.subject, text: m.text, html: m.html, replyTo: m.replyTo });
    return { ok: true, id: info.messageId };
  } catch (err) {
    // Never log credentials; the error message from nodemailer does not include them.
    return { ok: false, reason: "failed", detail: (err as Error).message.slice(0, 200) };
  }
}
