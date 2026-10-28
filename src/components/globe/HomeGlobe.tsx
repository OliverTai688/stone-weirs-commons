"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { LocalNode, NodeLink } from "@/lib/types";

const GlobeView = dynamic(() => import("./GlobeView"), {
  ssr: false,
  loading: () => <GlobeFallbackArt />,
});

function GlobeFallbackArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="aspect-square w-[min(80vw,640px)] rounded-full bg-[radial-gradient(circle_at_35%_30%,#1f4d6b,#0d2a44_55%,#06182a)] shadow-[0_0_120px_rgba(123,196,178,0.35)]" />
    </div>
  );
}

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

interface Props {
  nodes: LocalNode[];
  links: NodeLink[];
  stats: { countries: number; activeNodes: number; invitedNodes: number; records: number };
}

export function HomeGlobe({ nodes, links, stats }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<"3d" | "list" | "pending">("pending");
  const node = nodes.find((n) => n.slug === selected);

  useEffect(() => {
    const low = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !supportsWebGL();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability check must run in the browser
    setMode(low ? "list" : "3d");
  }, []);

  return (
    <section className="relative h-[calc(100svh-3.5rem)] min-h-[560px] overflow-hidden bg-[radial-gradient(ellipse_at_center,#0f2f4a_0%,#0f1e2e_55%,#08121c_100%)] text-white">
      {mode === "3d" ? <GlobeView nodes={nodes} links={links} selected={selected} onSelect={setSelected} /> : <GlobeFallbackArt />}

      {/* Legibility scrim behind the hero copy */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-full bg-gradient-to-r from-ink/85 via-ink/30 to-transparent md:w-2/3" />
      {/* Hero copy */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="container-page pt-8 md:pt-12">
          <p className="eyebrow !text-reef">Stone Weirs, Shared Futures・Pilot</p>
          <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight md:text-5xl">把你的海岸放上地圖</h1>
          <p className="mt-3 max-w-lg text-sm text-white/80 md:text-base">
            說出你的故事，AI 幫你留下完整的脈絡。<br className="hidden md:block" />
            Tell your story — AI keeps the context: sourced, consented, community-held.
          </p>
          <div className="pointer-events-auto mt-5 flex flex-wrap gap-3">
            <Link href="/join" className="btn-primary">加入亞太石滬研究網絡</Link>
            <Link href="/nodes/xinwu" className="btn-ghost">先看看新屋石滬</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-5 left-0 z-10 w-full">
        <div className="container-page flex flex-wrap items-end justify-between gap-4">
          <dl className="flex gap-6 rounded-2xl bg-white/5 px-5 py-3 text-xs backdrop-blur">
            <div><dt className="text-white/60">國家／地區</dt><dd className="text-xl font-bold">{stats.countries}</dd></div>
            <div><dt className="text-white/60">在地節點</dt><dd className="text-xl font-bold">{stats.activeNodes}<span className="ml-1 text-xs font-normal text-white/60">＋{stats.invitedNodes} 邀請中</span></dd></div>
            <div><dt className="text-white/60">治理紀錄</dt><dd className="text-xl font-bold">{stats.records}</dd></div>
          </dl>
          <button type="button" onClick={() => setMode(mode === "list" ? "3d" : "list")} className="rounded-full bg-white/10 px-4 py-2 text-xs hover:bg-white/20">
            {mode === "list" ? "切換 3D 地球" : "以清單檢視"}
          </button>
        </div>
      </div>

      {/* List view (accessibility / low-end fallback) */}
      {mode === "list" && (
        <div className="absolute inset-x-0 top-1/2 z-20 -translate-y-1/3">
          <ul className="container-page grid gap-3 md:grid-cols-3">
            {nodes.map((n) => (
              <li key={n.slug}>
                <button type="button" onClick={() => setSelected(n.slug)} className="w-full rounded-xl bg-white/10 p-4 text-left backdrop-blur hover:bg-white/20">
                  <p className="font-semibold">{n.name["zh-Hant"]}</p>
                  <p className="text-xs text-white/70">{n.countryName["zh-Hant"]}・{n.status === "active" ? "已建立" : "邀請中"}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Node card */}
      {node && (
        <aside className="absolute right-4 top-24 z-30 w-[min(92vw,360px)] rounded-2xl bg-white p-5 text-ink shadow-2xl md:right-8 md:top-28">
          <button type="button" onClick={() => setSelected(null)} className="absolute right-3 top-3 text-slate-400 hover:text-ink" aria-label="關閉">✕</button>
          <p className="eyebrow">{node.countryName["zh-Hant"]}・{node.status === "active" ? "在地節點" : "邀請中"}</p>
          <h2 className="mt-1 text-xl font-bold">{node.name["zh-Hant"]}</h2>
          <p className="text-sm text-slate-500">{node.name.en}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{node.summary["zh-Hant"]}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{node.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
          {node.status === "active" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/nodes/${node.slug}/graph`} className="btn-dark !py-2">查看概念圖</Link>
              <Link href={`/ask?node=${node.slug}`} className="btn-outline !py-2">試問 AI</Link>
            </div>
          ) : (
            <div className="mt-4">
              <Link href="/join?intent=node" className="btn-primary !py-2">我想建立這個節點</Link>
              <p className="mt-2 text-xs text-slate-500">地點僅顯示到地區層級。這裡目前沒有任何紀錄。</p>
            </div>
          )}
        </aside>
      )}
    </section>
  );
}
