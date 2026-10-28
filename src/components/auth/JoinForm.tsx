"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApi, useI18n } from "@/i18n/client";
import { intlLocale } from "@/i18n/config";
import type { Profile } from "@/lib/types";

const COUNTRY_CODES = ["TW", "PH", "ID", "JP", "KR", "MY", "VN", "TH", "AU", "NZ", "FM", "FJ", "PG", "CN", "HK", "IN", "LK", "US", "GB"];

/**
 * DEMO sign-up. Google login is not wired yet (needs Supabase Auth + Google OAuth — see SETUP.md).
 * Profiles are saved to this browser's localStorage so the /admin screen can show them.
 */
export function JoinForm({ next, source }: { next: string; source: string }) {
  const { t, lang, path } = useI18n();
  const j = t.join;
  const router = useRouter();
  const api = useApi();
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<"login" | "form">("login");
  const [f, setF] = useState({ fullName: "", email: "", persona: "researcher", country: "TW", organization: "", privacy: false, contact: false });
  const set = (k: string, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));
  const countries = useMemo(() => {
    const dn = new Intl.DisplayNames([intlLocale(lang)], { type: "region" });
    return [...COUNTRY_CODES.map((c) => [c, dn.of(c) ?? c] as const), ["OTHER", j.otherCountry] as const];
  }, [lang, j.otherCountry]);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!f.privacy || busy) return;
    setBusy(true);
    const p: Profile = {
      id: crypto.randomUUID(), fullName: f.fullName, email: f.email, persona: f.persona as Profile["persona"], country: f.country,
      organization: f.organization || undefined, interests: [], contactConsent: f.contact, signupSource: source, createdAt: new Date().toISOString().slice(0, 10),
    };
    try {
      const list = JSON.parse(localStorage.getItem("demo_profiles") ?? "[]");
      localStorage.setItem("demo_profiles", JSON.stringify([...list, p]));
      localStorage.setItem("demo_session", JSON.stringify({ id: p.id, name: p.fullName }));
    } catch {}
    // Registering sends the welcome email from the site (BFF).
    await api("/api/join", { method: "POST", body: JSON.stringify({ fullName: f.fullName, email: f.email, privacy: f.privacy, contact: f.contact, lang, source }) }).catch(() => null);
    router.push(path(next));
  }

  if (step === "login")
    return (
      <div className="space-y-3">
        <button type="button" onClick={() => setStep("form")} className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-50">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.2-8.5 2.2-6.3 0-11.7-4.2-13.6-9.9l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>
          {j.google}
        </button>
        <p className="text-center text-xs text-slate-500">{j.demoNote}</p>
        <button type="button" onClick={() => setStep("form")} className="w-full text-sm text-tide hover:underline">{j.email}</button>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">{j.fullName}<input required value={f.fullName} onChange={(e) => set("fullName", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm">{j.emailLabel}<input required type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm">{j.persona}
          <select value={f.persona} onChange={(e) => set("persona", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
            {(Object.keys(j.personas) as (keyof typeof j.personas)[]).map((k) => <option key={k} value={k}>{j.personas[k]}</option>)}
          </select>
        </label>
        <label className="text-sm">{j.country}
          <select value={f.country} onChange={(e) => set("country", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
            {countries.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
          </select>
        </label>
        <label className="text-sm md:col-span-2">{j.org}<input value={f.organization} onChange={(e) => set("organization", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label>
      </div>
      <p className="rounded-xl bg-foam p-3 text-xs leading-relaxed text-slate-700">{j.privacyText}</p>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={f.privacy} onChange={(e) => set("privacy", e.target.checked)} className="mt-1" required />{j.privacyCheck}</label>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={f.contact} onChange={(e) => set("contact", e.target.checked)} className="mt-1" />{j.contactCheck}</label>
      <button className="btn-primary w-full" disabled={!f.privacy || busy}>{busy ? t.common.loading : j.submit}</button>
    </form>
  );
}
