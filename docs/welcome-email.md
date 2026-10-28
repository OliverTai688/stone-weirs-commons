# APCONF6 pilot — welcome email template

Sent automatically **by the site** (`src/server/email/welcome.ts`) for every sign-up:
FormHug form (formhug.ai/f/SMbOkH) → webhook → `/api/webhooks/formhug`, and the site's own Join → `/api/join`.
The code is the source of truth; this file describes the content. See SETUP.md step 0 for the Gmail app password.

- **To:** the respondent's email (field_2)
- **Subject:** Welcome to the Stone Weirs, Shared Futures pilot — how to get started

---

Dear {first name},

Thank you for signing up at APCONF6 as a co-creator for Stone Weirs, Shared Futures.

{One sentence chosen from the fixed options they ticked in field_5 (Tool 1 / Tool 2 / governance). Free-text answers are never copied into the email, so the public form can't be used to send arbitrary text.}

You can try both tools today, no account needed (about 5 minutes):

1. Ask the AI about the Xinwu stone weirs — every answer cites a governed record, and you can compare it with the ungoverned answers from our paper:
   https://stone-weirs-commons.vercel.app/en/ask
2. Play the demo interview (Tool 1) — watch a short story become a CIDOC-CRM concept map:
   https://stone-weirs-commons.vercel.app/en/tools/interview
3. Explore the Xinwu concept map — sources, consent status and geo-privacy for every record:
   https://stone-weirs-commons.vercel.app/en/nodes/xinwu

What happens next:
- 30 October 2026 — we demonstrate the first version at APCONF6.
- After APCONF6 — the pilot round opens: you will be able to sign in with Google, create your own local node, and bring one story or collection.

{If field_8 = "Yes, I would like to test it": "Since you'd like to test it, I'll get in touch about a pilot slot after the conference."
 If field_8 = "Maybe — tell me more first": "Happy to tell you more — just reply to this email with any questions."
 Otherwise omit.}

The site is a pilot at TRL-3, so expect rough edges — and please tell us what you would change. Simply reply to this email.

Warm regards,
Yu-Hsin TAI
on behalf of Chen-Min LAI, Jen-Fu LEE and Yun-Fang CHANG
Stone Weirs, Shared Futures · https://stone-weirs-commons.vercel.app

---

Rules for the draft:
- Write in English (the form is in English). Keep it under ~220 words.
- Never invent details about the person, their institution or their collection; personalise only from their form answers.
- Do not mention a session time or room for the 30 October demo unless Yu-Hsin has added it here.
