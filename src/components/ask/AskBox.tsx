"use client";

import { useEffect, useState } from "react";
import { Link, useApi, useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import type { Dict } from "@/i18n/dictionaries";

interface Citation { id: string; nodeSlug: string; label: string }
export type Engine = { kind: "demo" } | { kind: "llm"; provider: string; model: string; source: "user" | "platform" };
interface Result {
  answer: string;
  citations: Citation[];
  grounded: boolean;
  mode: "llm" | "demo";
  engine?: Engine;
  aiError?: string;
  baseline?: { answer: string; error: string };
}
interface Item { q: string; r?: Result; err?: string }

const VISITOR_LIMIT = 3;

export function engineLabel(e: Engine | undefined | null, t: Dict) {
  if (!e || e.kind === "demo") return t.ask.engineDemo;
  const name = e.provider === "anthropic" ? "Anthropic" : "OpenAI";
  return `${name} ${e.model}${e.source === "user" ? t.ask.engineYours : t.ask.enginePlatform}`;
}

function safeGet(k: string) {
  try { return localStorage.getItem(k); } catch { return null; }
}

export function AskBox({ suggestions, nodeSlug = "xinwu", initialQ = "", compact = false }: { suggestions: string[]; nodeSlug?: string; initialQ?: string; compact?: boolean }) {
  const { t, lang } = useI18n();
  const a = t.ask;
  const api = useApi();
  const [q, setQ] = useState(initialQ);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [compare, setCompare] = useState(!compact);
  const [used, setUsed] = useState(0);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const v = JSON.parse(localStorage.getItem("ask_quota") ?? "{}");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read quota from browser storage once
      setUsed(v.day === today ? v.n : 0);
      setSignedIn(Boolean(safeGet("demo_session")));
    } catch {}
  }, []);

  // Demo (suggested) questions are unlimited; only custom questions count toward the visitor quota.
  const blocked = !signedIn && used >= VISITOR_LIMIT;
  const norm = (s: string) => s.trim().replace(/[?？\s]+$/u, "").toLowerCase();
  const isDemo = (question: string) => suggestions.some((s) => norm(s) === norm(question));

  async function ask(question: string) {
    const demo = isDemo(question);
    if (!question.trim() || busy || (blocked && !demo)) return;
    setBusy(true);
    setItems((x) => [{ q: question }, ...x]);
    setQ("");
    try {
      const res = await api("/api/ask", { method: "POST", body: JSON.stringify({ question, nodeSlugs: [nodeSlug] }) });
      const r = (await res.json()) as Result;
      setItems((x) => [{ q: question, r }, ...x.slice(1)]);
      if (!demo) {
        const n = used + 1;
        setUsed(n);
        try { localStorage.setItem("ask_quota", JSON.stringify({ day: new Date().toISOString().slice(0, 10), n })); } catch {}
      }
    } catch {
      setItems((x) => [{ q: question, err: a.failed }, ...x.slice(1)]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={a.placeholder}
          className="min-w-0 flex-1 rounded-full border border-slate-300 px-5 py-3 text-base outline-none focus:border-tide focus:ring-2 focus:ring-reef/40"
          disabled={blocked}
        />
        <button className="btn-dark shrink-0" disabled={busy || (blocked && !isDemo(q))}>{busy ? a.busy : a.submit}</button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {suggestions.map((s) => (
          <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-tide hover:text-tide" disabled={busy}>
            {s}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        {!compact && (
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
            {a.compare}
          </label>
        )}
        {!signedIn && <span>{fmt(a.quota, { used: Math.min(used, VISITOR_LIMIT), limit: VISITOR_LIMIT })}</span>}
      </div>

      {blocked && (
        <div className="mt-4 rounded-2xl bg-foam p-4 text-sm">
          {a.quotaDone} <Link href="/join?next=/ask" className="font-semibold text-tide underline">{a.quotaLogin}</Link>
        </div>
      )}

      <ul className="mt-6 space-y-5">
        {items.map((it, i) => (
          <li key={i} className="space-y-3">
            <p className="font-semibold">{lang === "zh" ? "Q：" : "Q: "}{it.q}</p>
            {it.err && <p className="text-sm text-red-600">{it.err}</p>}
            {!it.r && !it.err && <p className="text-sm text-slate-400">{a.retrieving}</p>}
            {it.r && (
              <div className={`grid gap-3 ${compare && it.r.baseline ? "md:grid-cols-2" : ""}`}>
                {compare && it.r.baseline && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
                    <p className="text-xs font-bold text-red-700">{a.ungoverned}</p>
                    <p className="mt-2 text-sm leading-relaxed">{it.r.baseline.answer}</p>
                    <p className="mt-2 text-xs font-semibold text-red-700">✕ {it.r.baseline.error}</p>
                  </div>
                )}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="text-xs font-bold text-emerald-700">
                    {a.governed}<span className="ml-1 font-normal text-slate-500">・{engineLabel(it.r.engine, t)}</span>
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{it.r.answer}</p>
                  {it.r.citations.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {it.r.citations.map((c) => (
                        <Link key={c.id} href={`/nodes/${c.nodeSlug}/graph`} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-navy ring-1 ring-emerald-200 hover:bg-foam">
                          {a.source}: {c.id}・{c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  {it.r.aiError && <p className="mt-2 text-xs text-amber-700">{it.r.aiError}</p>}
                  {!it.r.grounded && <p className="mt-2 text-xs text-slate-500">{a.notGrounded}</p>}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
