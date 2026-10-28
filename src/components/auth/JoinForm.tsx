"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Profile } from "@/lib/types";

const COUNTRIES = [
  ["TW", "台灣"], ["JP", "日本"], ["KR", "韓國"], ["PH", "菲律賓"], ["ID", "印尼"], ["MY", "馬來西亞"], ["VN", "越南"], ["TH", "泰國"],
  ["AU", "澳洲"], ["NZ", "紐西蘭"], ["FM", "密克羅尼西亞"], ["FJ", "斐濟"], ["CN", "中國"], ["HK", "香港"], ["IN", "印度"], ["LK", "斯里蘭卡"], ["US", "美國"], ["GB", "英國"], ["OTHER", "其他"],
];

/**
 * DEMO sign-up. Google login is not wired yet (needs Supabase Auth + Google OAuth — see SETUP.md).
 * Profiles are saved to this browser's localStorage so the /admin screen can show them.
 */
export function JoinForm({ next, source }: { next: string; source: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "form">("login");
  const [f, setF] = useState({ fullName: "", email: "", persona: "researcher", country: "TW", organization: "", privacy: false, contact: false });
  const set = (k: string, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!f.privacy) return;
    const p: Profile = {
      id: crypto.randomUUID(), fullName: f.fullName, email: f.email, persona: f.persona as Profile["persona"], country: f.country,
      organization: f.organization || undefined, interests: [], contactConsent: f.contact, signupSource: source, createdAt: new Date().toISOString().slice(0, 10),
    };
    try {
      const list = JSON.parse(localStorage.getItem("demo_profiles") ?? "[]");
      localStorage.setItem("demo_profiles", JSON.stringify([...list, p]));
      localStorage.setItem("demo_session", JSON.stringify({ id: p.id, name: p.fullName }));
    } catch {}
    router.push(next);
  }

  if (step === "login")
    return (
      <div className="space-y-3">
        <button type="button" onClick={() => setStep("form")} className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-50">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.2-8.5 2.2-6.3 0-11.7-4.2-13.6-9.9l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>
          用 Google 帳號繼續
        </button>
        <p className="text-center text-xs text-slate-500">示範模式：Google 登入尚未接上，點擊後改為手動填寫。</p>
        <button type="button" onClick={() => setStep("form")} className="w-full text-sm text-tide hover:underline">無法使用 Google？改用 Email</button>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">姓名<input required value={f.fullName} onChange={(e) => set("fullName", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm">Email<input required type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm">身分
          <select value={f.persona} onChange={(e) => set("persona", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
            <option value="researcher">研究者</option><option value="museum">博物館／遺產管理人員</option><option value="community">社區成員／知識持有者</option><option value="student">學生</option><option value="other">其他</option>
          </select>
        </label>
        <label className="text-sm">國家或地區
          <select value={f.country} onChange={(e) => set("country", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
            {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
          </select>
        </label>
        <label className="text-sm md:col-span-2">機構／單位（選填）<input value={f.organization} onChange={(e) => set("organization", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label>
      </div>
      <p className="rounded-xl bg-foam p-3 text-xs leading-relaxed text-slate-700">
        「石滬・共享未來」研究團隊會使用你的姓名與 Email，提供帳號登入、平台通知與研究交流服務。資料只有研究團隊可以存取，不會出售或提供給第三方。你可以隨時修改資料、取消聯絡偏好或刪除帳號。
      </p>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={f.privacy} onChange={(e) => set("privacy", e.target.checked)} className="mt-1" required />我已閱讀並同意隱私權政策與使用條款（必填）</label>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={f.contact} onChange={(e) => set("contact", e.target.checked)} className="mt-1" />我願意收到研究合作邀請、活動與工作坊通知（選填，可隨時取消）</label>
      <button className="btn-primary w-full" disabled={!f.privacy}>完成加入</button>
    </form>
  );
}
