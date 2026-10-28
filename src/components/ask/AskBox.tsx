"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Citation { id: string; nodeSlug: string; label: string }
interface Result {
  answer: string;
  citations: Citation[];
  grounded: boolean;
  mode: "llm" | "demo";
  baseline?: { answer: string; error: string };
}
interface Item { q: string; r?: Result; err?: string }

const VISITOR_LIMIT = 3;

export function AskBox({ suggestions, nodeSlug = "xinwu", initialQ = "", compact = false }: { suggestions: string[]; nodeSlug?: string; initialQ?: string; compact?: boolean }) {
  const [q, setQ] = useState(initialQ);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [compare, setCompare] = useState(!compact);
  const [used, setUsed] = useState(0);

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const v = JSON.parse(localStorage.getItem("ask_quota") ?? "{}");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read quota from browser storage once
      setUsed(v.day === today ? v.n : 0);
    } catch {}
  }, []);

  const signedIn = typeof window !== "undefined" && Boolean(safeGet("demo_session"));
  const blocked = !signedIn && used >= VISITOR_LIMIT;

  async function ask(question: string) {
    if (!question.trim() || busy || blocked) return;
    setBusy(true);
    setItems((x) => [{ q: question }, ...x]);
    setQ("");
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, nodeSlugs: [nodeSlug] }) });
      const r = (await res.json()) as Result;
      setItems((x) => [{ q: question, r }, ...x.slice(1)]);
      const n = used + 1;
      setUsed(n);
      try { localStorage.setItem("ask_quota", JSON.stringify({ day: new Date().toISOString().slice(0, 10), n })); } catch {}
    } catch {
      setItems((x) => [{ q: question, err: "連線失敗，請再試一次。" }, ...x.slice(1)]);
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
          placeholder="例如：石滬故事館以前是做什麼用的？"
          className="min-w-0 flex-1 rounded-full border border-slate-300 px-5 py-3 text-base outline-none focus:border-tide focus:ring-2 focus:ring-reef/40"
          disabled={blocked}
        />
        <button className="btn-dark shrink-0" disabled={busy || blocked}>{busy ? "查找中…" : "提問"}</button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {suggestions.map((s) => (
          <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-tide hover:text-tide" disabled={blocked}>
            {s}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        {!compact && (
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
            並列顯示「未治理的 AI」回答（論文基準模型紀錄）
          </label>
        )}
        {!signedIn && <span>訪客今日已使用 {Math.min(used, VISITOR_LIMIT)}／{VISITOR_LIMIT} 題</span>}
      </div>

      {blocked && (
        <div className="mt-4 rounded-2xl bg-foam p-4 text-sm">
          今天的 3 題試用已用完。<Link href="/join?next=/ask" className="font-semibold text-tide underline">用 Google 登入，繼續提問</Link>
        </div>
      )}

      <ul className="mt-6 space-y-5">
        {items.map((it, i) => (
          <li key={i} className="space-y-3">
            <p className="font-semibold">Q：{it.q}</p>
            {it.err && <p className="text-sm text-red-600">{it.err}</p>}
            {!it.r && !it.err && <p className="text-sm text-slate-400">正在檢索經治理的紀錄…</p>}
            {it.r && (
              <div className={`grid gap-3 ${compare && it.r.baseline ? "md:grid-cols-2" : ""}`}>
                {compare && it.r.baseline && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
                    <p className="text-xs font-bold text-red-700">未治理的 AI（無檢索、無出處）</p>
                    <p className="mt-2 text-sm leading-relaxed">{it.r.baseline.answer}</p>
                    <p className="mt-2 text-xs font-semibold text-red-700">✕ {it.r.baseline.error}</p>
                  </div>
                )}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="text-xs font-bold text-emerald-700">
                    石滬・共享未來（治理檢索）{it.r.mode === "demo" && <span className="ml-1 font-normal text-slate-500">・示範引擎</span>}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{it.r.answer}</p>
                  {it.r.citations.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {it.r.citations.map((c) => (
                        <Link key={c.id} href={`/nodes/${c.nodeSlug}/graph`} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-navy ring-1 ring-emerald-200 hover:bg-foam">
                          出處：{c.id}・{c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  {!it.r.grounded && <p className="mt-2 text-xs text-slate-500">資料不足時，AI 會直接說不知道，而不是編造。</p>}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function safeGet(k: string) {
  try { return localStorage.getItem(k); } catch { return null; }
}
