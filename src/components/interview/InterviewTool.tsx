"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ConceptGraph } from "@/components/graph/ConceptGraph";
import { crmMeta } from "@/lib/crm";
import { demoScript, emptyState, facetLabels, openingQuestion, type Facet, type InterviewState, type Turn } from "@/lib/interview";

export function InterviewTool() {
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [turns, setTurns] = useState<Turn[]>([{ role: "ai", content: openingQuestion.zh }]);
  const [state, setState] = useState<InterviewState>(emptyState());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"llm" | "demo" | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const turnsRef = useRef(turns);
  useEffect(() => {
    stateRef.current = state;
    turnsRef.current = turns;
  }, [state, turns]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns]);

  async function send(text: string) {
    if (!text.trim()) return;
    setBusy(true);
    const next: Turn[] = [...turnsRef.current, { role: "user", content: text }];
    setTurns(next);
    setInput("");
    try {
      const res = await fetch("/api/interview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ turns: next, state: stateRef.current, lang }) });
      const data = (await res.json()) as { state: InterviewState; question: string; mode: "llm" | "demo" };
      setState(data.state);
      setMode(data.mode);
      setTurns([...next, { role: "ai", content: data.question }]);
    } catch {
      setTurns([...next, { role: "ai", content: lang === "zh" ? "連線失敗，請再試一次。" : "Connection failed, please retry." }]);
    } finally {
      setBusy(false);
    }
  }

  async function playDemo() {
    reset();
    setPlaying(true);
    await new Promise((r) => setTimeout(r, 300));
    for (const line of demoScript) {
      await send(line);
      await new Promise((r) => setTimeout(r, 900));
    }
    setPlaying(false);
  }

  function reset() {
    const t: Turn[] = [{ role: "ai", content: lang === "zh" ? openingQuestion.zh : openingQuestion.en }];
    setTurns(t);
    turnsRef.current = t;
    const s = emptyState();
    setState(s);
    stateRef.current = s;
    setSel(null);
  }

  const toggleConfirm = (id: string) =>
    setState((s) => ({ ...s, entities: s.entities.map((e) => (e.id === id ? { ...e, confirmed: !e.confirmed } : e)), relations: s.relations.map((r) => (r.from === id || r.to === id ? { ...r, confirmed: true } : r)) }));
  const remove = (id: string) =>
    setState((s) => ({ ...s, entities: s.entities.filter((e) => e.id !== id), relations: s.relations.filter((r) => r.from !== id && r.to !== id) }));

  function exportJsonLd() {
    const doc = {
      "@context": { crm: "http://www.cidoc-crm.org/cidoc-crm/", prov: "http://www.w3.org/ns/prov#", rdfs: "http://www.w3.org/2000/01/rdf-schema#" },
      "@graph": [
        ...state.entities.map((e) => ({ "@id": `_:${e.id}`, "@type": `crm:${e.crmClass}`, "rdfs:label": e.label, "prov:wasDerivedFrom": { "prov:value": e.sourceQuote }, confirmed: e.confirmed })),
        ...state.relations.map((r) => ({ "@id": `_:${r.from}`, [`crm:${r.property}`]: { "@id": `_:${r.to}` } })),
      ],
    };
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/ld+json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "story-concept-graph.jsonld";
    a.click();
  }

  const e = state.entities.find((x) => x.id === sel);
  const facets = Object.keys(facetLabels) as Facet[];
  const done = facets.filter((f) => state.coverage[f]).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      {/* Chat */}
      <section className="card flex h-[680px] flex-col !p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-bold">AI 半結構訪談</p>
            <p className="text-xs text-slate-500">{mode === "llm" ? "AI 模型" : mode === "demo" ? "示範引擎（尚未接上 AI 金鑰）" : "準備好了"}</p>
          </div>
          <select value={lang} onChange={(ev) => { setLang(ev.target.value as "zh" | "en"); }} className="rounded-lg border border-slate-200 px-2 py-1 text-xs" aria-label="訪談語言">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {turns.map((t, i) => (
            <div key={i} className={`flex ${t.role === "user" ? "justify-end" : ""}`}>
              <p className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${t.role === "user" ? "bg-navy text-white" : "bg-foam text-ink"}`}>{t.content}</p>
            </div>
          ))}
          {busy && <p className="text-xs text-slate-400">AI 正在整理你說的內容…</p>}
          <div ref={chatEnd} />
        </div>
        <form onSubmit={(ev) => { ev.preventDefault(); send(input); }} className="border-t border-slate-100 p-3">
          <textarea value={input} onChange={(ev) => setInput(ev.target.value)} rows={3} placeholder="用自己的話說…（之後可以直接上傳錄音）" className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-tide" disabled={busy || playing}
            onKeyDown={(ev) => { if (ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); send(input); } }} />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button type="button" onClick={playDemo} disabled={busy || playing} className="btn-outline !px-3 !py-1.5 text-xs">▶ 播放示範訪談</button>
              <button type="button" disabled title="接上 Cloudflare R2 與語音辨識後啟用" className="btn-outline !px-3 !py-1.5 text-xs opacity-50">🎙 上傳錄音</button>
            </div>
            <button className="btn-dark !px-4 !py-1.5" disabled={busy || playing || !input.trim()}>送出</button>
          </div>
        </form>
      </section>

      {/* Graph */}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {facets.map((f) => (
            <span key={f} className={`rounded-full px-2.5 py-1 text-xs font-medium ${state.coverage[f] ? "bg-tide text-white" : "bg-slate-100 text-slate-500"}`}>
              {state.coverage[f] ? "✓ " : ""}{facetLabels[f].zh}
            </span>
          ))}
          <span className="ml-auto text-xs text-slate-500">完成 {done}／{facets.length} 個面向</span>
        </div>
        {state.entities.length ? (
          <ConceptGraph
            entities={state.entities.map((x) => ({ id: x.id, crmClass: x.crmClass, label: x.label, confirmed: x.confirmed }))}
            relations={state.relations}
            selected={sel}
            onSelect={setSel}
            height={480}
          />
        ) : (
          <div className="flex h-[480px] items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-500">
            開始說故事，概念圖會在這裡即時長出來。<br />或按「播放示範訪談」看看新屋的例子。
          </div>
        )}
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="card !p-4 text-sm">
            {e ? (
              <>
                <p className="text-xs font-bold" style={{ color: crmMeta[e.crmClass].color }}>{e.crmClass} {crmMeta[e.crmClass].zh}・{e.confirmed ? "已確認" : "AI 推測，待確認"}</p>
                <p className="mt-1 font-bold">{e.label}</p>
                {e.description && e.description !== e.sourceQuote && <p className="mt-1 text-slate-600">{e.description}</p>}
                <p className="mt-2 rounded-lg bg-sand p-2 text-xs text-slate-700"><span className="font-semibold">出處（你說的話）：</span>「{e.sourceQuote}」</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => toggleConfirm(e.id)} className="btn-outline !px-3 !py-1 text-xs">{e.confirmed ? "改為待確認" : "✓ 確認"}</button>
                  <button type="button" onClick={() => { remove(e.id); setSel(null); }} className="btn-outline !px-3 !py-1 text-xs !text-red-600">刪除</button>
                </div>
              </>
            ) : (
              <p className="text-slate-500">點擊概念圖上的節點，可以看到它出自哪一句話，並確認或刪除。虛線代表 AI 推測、還沒確認。</p>
            )}
          </div>
          <div className="flex flex-row gap-2 md:flex-col">
            <button type="button" onClick={exportJsonLd} disabled={!state.entities.length} className="btn-outline !py-2 text-xs">匯出 JSON-LD</button>
            <Link href="/join?next=/tools/interview" className="btn-primary !py-2 text-xs">登入後送出審查</Link>
            <button type="button" onClick={reset} className="text-xs text-slate-500 hover:underline">重新開始</button>
          </div>
        </div>
      </section>
    </div>
  );
}
