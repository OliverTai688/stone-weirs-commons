import "server-only";
import type { Lang } from "@/i18n/config";
import type { Mail } from "./transport";

/** Choice labels on the FormHug form (field_5 / field_8). Only these exact labels personalise the mail. */
export const FORM_CHOICES = {
  tool1: "Tool 1 — turn a local story into a CIDOC-CRM concept map through an AI interview",
  outreach: "Tool 2 — outreach: museum, exhibition and community guiding",
  exchange: "Tool 2 — cross-disciplinary research exchange that keeps context, not just schema fields",
  governance: "The governance layer (FAIR / CARE / FPIC) rather than the tools",
  pilotYes: "Yes, I would like to test it",
  pilotMaybe: "Maybe — tell me more first",
};

export interface WelcomeInput {
  to: string;
  name: string;
  lang: Lang;
  source: "apconf6" | "site";
  interests?: string[];
  pilot?: string;
}

const site = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://stone-weirs-commons.vercel.app").replace(/\/$/, "");

/** Names come from a public form: keep them short and plain so the mail can't carry links or markup. */
export function cleanName(raw: unknown): string {
  const s = String(raw ?? "")
    .replace(/https?:\/\/\S+|www\.\S+/gi, "")
    .replace(/[<>{}[\]\\/@:]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  return s;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildWelcome(i: WelcomeInput): Mail {
  const base = site();
  const L = i.lang;
  const first = i.name.split(" ")[0] || i.name;
  const has = (label: string) => (i.interests ?? []).includes(label);

  const steps = [
    { key: "ask", path: `/${L}/ask` },
    { key: "tool1", path: `/${L}/tools/interview` },
    { key: "map", path: `/${L}/nodes/xinwu` },
  ];
  // Put the demo interview first for people who came for Tool 1.
  if (has(FORM_CHOICES.tool1)) steps.unshift(steps.splice(1, 1)[0]);

  const T =
    L === "zh"
      ? {
          subject: "歡迎加入「石滬・共享未來」pilot：如何開始使用",
          hello: `${first} 你好：`,
          thanks: i.source === "apconf6" ? "謝謝你在 APCONF6 報名成為「石滬・共享未來」的共創夥伴。" : "謝謝你加入「石滬・共享未來」，成為共創夥伴。",
          interest: has(FORM_CHOICES.tool1) ? "你提到對工具一（用 AI 訪談把在地故事變成概念圖）有興趣，所以我把最相關的連結放在第一個。" : has(FORM_CHOICES.outreach) || has(FORM_CHOICES.exchange) ? "你提到對工具二（導覽推廣與跨研究交流）有興趣，下面第一個連結最相關。" : has(FORM_CHOICES.governance) ? "你提到對治理層（FAIR / CARE / FPIC）有興趣，網站的「資料治理」頁有完整說明。" : "",
          tryNow: "現在就可以試用兩個工具，不需要帳號（大約 5 分鐘）：",
          step: {
            ask: ["問 AI 新屋石滬的事", "每個回答都引用經治理的紀錄，也能和論文中未治理 AI 的回答並列比較"],
            tool1: ["播放示範訪談（工具一）", "看一段故事如何變成 CIDOC-CRM 概念圖"],
            map: ["瀏覽新屋概念圖", "每筆紀錄的出處、同意狀態與地理隱私都看得到"],
          } as Record<string, [string, string]>,
          nextTitle: "接下來：",
          next: ["2026 年 10 月 30 日：在 APCONF6 展示第一版。", "APCONF6 之後：pilot 正式開始，你可以用 Google 登入、建立自己的在地節點，帶一則故事或一批收藏來試。"],
          pilot: i.pilot === FORM_CHOICES.pilotYes ? "你表示想參加測試，會議結束後我會再聯絡你安排 pilot。" : i.pilot === FORM_CHOICES.pilotMaybe ? "想多了解的話，直接回覆這封信問我就好。" : "",
          rough: "這是 TRL-3 階段的 pilot，難免有粗糙的地方，歡迎直接回信告訴我們你想改什麼。",
          sign: ["Yu-Hsin TAI", "代表 Chen-Min LAI、Jen-Fu LEE、Yun-Fang CHANG", "石滬・共享未來 Stone Weirs, Shared Futures"],
        }
      : {
          subject: "Welcome to the Stone Weirs, Shared Futures pilot — how to get started",
          hello: `Dear ${first},`,
          thanks: i.source === "apconf6" ? "Thank you for signing up at APCONF6 as a co-creator for Stone Weirs, Shared Futures." : "Thank you for joining Stone Weirs, Shared Futures as a co-creator.",
          interest: has(FORM_CHOICES.tool1) ? "You mentioned an interest in Tool 1 — turning a local story into a concept map through an AI interview — so I've put that link first." : has(FORM_CHOICES.outreach) || has(FORM_CHOICES.exchange) ? "You mentioned an interest in Tool 2 — guiding and research exchange — so the first link below is the most relevant." : has(FORM_CHOICES.governance) ? "You mentioned the governance layer (FAIR / CARE / FPIC); the site's Data governance page explains how we apply it." : "",
          tryNow: "You can try both tools today, no account needed (about 5 minutes):",
          step: {
            ask: ["Ask the AI about the Xinwu stone weirs", "every answer cites a governed record, and you can compare it with the ungoverned answers from our paper"],
            tool1: ["Play the demo interview (Tool 1)", "watch a short story become a CIDOC-CRM concept map"],
            map: ["Explore the Xinwu concept map", "sources, consent status and geo-privacy for every record"],
          } as Record<string, [string, string]>,
          nextTitle: "What happens next:",
          next: ["30 October 2026 — we demonstrate the first version at APCONF6.", "After APCONF6 — the pilot round opens: you will be able to sign in with Google, create your own local node, and bring one story or collection."],
          pilot: i.pilot === FORM_CHOICES.pilotYes ? "Since you'd like to test it, I'll get in touch about a pilot slot after the conference." : i.pilot === FORM_CHOICES.pilotMaybe ? "Happy to tell you more — just reply to this email with any questions." : "",
          rough: "The site is a pilot at TRL-3, so expect rough edges — and please tell us what you would change. Simply reply to this email.",
          sign: ["Yu-Hsin TAI", "on behalf of Chen-Min LAI, Jen-Fu LEE and Yun-Fang CHANG", "Stone Weirs, Shared Futures"],
        };

  const text = [
    T.hello,
    "",
    T.thanks,
    ...(T.interest ? ["", T.interest] : []),
    "",
    T.tryNow,
    "",
    ...steps.flatMap((s, n) => [`${n + 1}. ${T.step[s.key][0]} — ${T.step[s.key][1]}${L === "zh" ? "：" : ":"}`, `${base}${s.path}`]),
    "",
    T.nextTitle,
    ...T.next.map((x) => `- ${x}`),
    ...(T.pilot ? ["", T.pilot] : []),
    "",
    T.rough,
    "",
    L === "zh" ? "祝好，" : "Warm regards,",
    ...T.sign,
    base,
  ].join("\n");

  const p = (s: string) => `<p style="margin:0 0 14px">${esc(s)}</p>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f6f1e7;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,'Noto Sans TC',sans-serif;color:#0f1e2e;line-height:1.55">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
<div style="background:#0f1e2e;color:#ffffff;padding:20px 24px"><div style="font-size:12px;letter-spacing:.16em;color:#7bc4b2;font-weight:700">STONE WEIRS, SHARED FUTURES · PILOT</div><div style="font-size:20px;font-weight:700;margin-top:6px">${esc(L === "zh" ? "歡迎加入 pilot" : "Welcome to the pilot round")}</div></div>
<div style="padding:24px">
${p(T.hello)}${p(T.thanks)}${T.interest ? p(T.interest) : ""}${p(T.tryNow)}
<ol style="padding-left:20px;margin:0 0 16px">${steps
    .map((s) => `<li style="margin-bottom:10px"><a href="${base}${s.path}" style="color:#2e7d8c;font-weight:700">${esc(T.step[s.key][0])}</a><br><span style="color:#475569">${esc(T.step[s.key][1])}</span></li>`)
    .join("")}</ol>
<p style="margin:0 0 6px;font-weight:700">${esc(T.nextTitle)}</p>
<ul style="padding-left:20px;margin:0 0 16px;color:#334155">${T.next.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
${T.pilot ? p(T.pilot) : ""}<p style="margin:0 0 18px;color:#475569">${esc(T.rough)}</p>
<p style="margin:0">${esc(L === "zh" ? "祝好，" : "Warm regards,")}<br>${T.sign.map(esc).join("<br>")}</p>
<p style="margin:18px 0 0"><a href="${base}/${L}" style="display:inline-block;background:#e0785a;color:#ffffff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px">${esc(L === "zh" ? "前往網站" : "Open the site")}</a></p>
</div></div>
<p style="max-width:560px;margin:12px auto 0;font-size:11px;color:#64748b;text-align:center">${esc(L === "zh" ? "你會收到這封信，是因為有人用這個 Email 報名了 pilot。如果不是你，請忽略這封信。" : "You're receiving this because this address was used to sign up for the pilot. If that wasn't you, you can ignore this email.")}</p>
</body></html>`;

  return { to: i.to, subject: T.subject, text, html, replyTo: process.env.EMAIL_REPLY_TO || process.env.GMAIL_USER || undefined };
}
