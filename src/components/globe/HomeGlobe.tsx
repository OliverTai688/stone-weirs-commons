"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Link, useI18n } from "@/i18n/client";
import { fmt, pick } from "@/i18n/config";
import type { LocalNode, NodeLink } from "@/lib/types";

const GlobeView = dynamic(() => import("./GlobeView"), { ssr: false });

/** Static picture of the globe: paints instantly and stays until the 3D globe is ready. */
function GlobePoster({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 top-[34%] flex items-center justify-center transition-opacity duration-700 md:inset-y-0 md:left-[28%] md:top-0 ${hidden ? "opacity-0" : "opacity-100"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny pre-sized webp, no optimisation needed */}
      <img src="/globe-poster.webp" alt="" width={814} height={794} fetchPriority="high" decoding="async" className="h-auto w-[min(108vw,72vh)] max-w-none md:w-[min(56vw,84vh)]" />
    </div>
  );
}

/** Load the 3D globe (≈560 KB) only when the device and connection can take it. */
function shouldAutoload3d() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (c?.saveData || /(^|-)2g|3g/.test(c?.effectiveType ?? "")) return false;
  const small = window.innerWidth < 768;
  return !small || (navigator.hardwareConcurrency ?? 4) >= 6;
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
  const { t, lang } = useI18n();
  const h = t.home;
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<"3d" | "list" | "poster">("poster");
  const [ready, setReady] = useState(false);
  const node = nodes.find((n) => n.slug === selected);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !supportsWebGL() || !shouldAutoload3d()) return;
    // Wait until the page is idle so the 3D bundle never competes with the first paint.
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const start = () => setMode((m) => (m === "poster" ? "3d" : m));
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 2500 });
      return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const t = setTimeout(start, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative h-[calc(100svh-3.5rem)] min-h-[560px] overflow-hidden bg-[radial-gradient(ellipse_at_center,#0f2f4a_0%,#0f1e2e_55%,#08121c_100%)] text-white">
      {mode === "3d" && <GlobeView nodes={nodes} links={links} selected={selected} onSelect={setSelected} lang={lang} onReady={() => setReady(true)} />}
      {mode !== "list" && <GlobePoster hidden={mode === "3d" && ready} />}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-full bg-gradient-to-r from-ink/85 via-ink/30 to-transparent md:w-2/3" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="container-page pt-8 md:pt-12">
          <p className="eyebrow !text-reef">{h.eyebrow}</p>
          <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight md:text-5xl">{h.title}</h1>
          <p className="mt-3 max-w-lg text-sm text-white/80 md:text-base">
            {h.sub1}
            <br className="hidden md:block" /> {h.sub2}
          </p>
          <div className="pointer-events-auto mt-5 flex flex-wrap gap-3">
            <Link href="/join" className="btn-primary">{h.ctaJoin}</Link>
            <Link href="/nodes/xinwu" className="btn-ghost">{h.ctaExplore}</Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-0 z-10 w-full">
        <div className="container-page flex flex-wrap items-end justify-between gap-4">
          <dl className="flex gap-4 whitespace-nowrap rounded-2xl bg-white/5 px-4 py-2.5 text-[11px] backdrop-blur md:gap-6 md:px-5 md:py-3 md:text-xs">
            <div><dt className="text-white/60">{h.statCountries}</dt><dd className="text-lg font-bold md:text-xl">{stats.countries}</dd></div>
            <div><dt className="text-white/60">{h.statNodes}</dt><dd className="text-lg font-bold md:text-xl">{stats.activeNodes}<span className="ml-1 text-[11px] font-normal text-white/60">{fmt(h.invitedCount, { n: stats.invitedNodes })}</span></dd></div>
            <div><dt className="text-white/60">{h.statRecords}</dt><dd className="text-lg font-bold md:text-xl">{stats.records}</dd></div>
          </dl>
          <button
            type="button"
            onClick={() => setMode(mode === "3d" ? "list" : "3d")}
            className={`rounded-full px-4 py-2 text-xs backdrop-blur ${mode === "poster" ? "bg-white/20 font-semibold hover:bg-white/30" : "bg-white/10 hover:bg-white/20"}`}
          >
            {mode === "poster" ? h.load3d : mode === "list" ? h.to3d : h.toList}
          </button>
        </div>
      </div>

      {mode === "list" && (
        <div className="absolute inset-x-0 top-1/2 z-20 -translate-y-1/3">
          <ul className="container-page grid gap-3 md:grid-cols-4">
            {nodes.map((n) => (
              <li key={n.slug}>
                <button type="button" onClick={() => setSelected(n.slug)} className="w-full rounded-xl bg-white/10 p-4 text-left backdrop-blur hover:bg-white/20">
                  <p className="font-semibold">{pick(n.name, lang)}</p>
                  <p className="text-xs text-white/70">{pick(n.countryName, lang)}・{n.status === "active" ? h.active : h.invited}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {node && (
        <aside className="absolute right-4 top-24 z-30 w-[min(92vw,360px)] rounded-2xl bg-white p-5 text-ink shadow-2xl md:right-8 md:top-28">
          <button type="button" onClick={() => setSelected(null)} className="absolute right-3 top-3 text-slate-400 hover:text-ink" aria-label={t.common.close}>✕</button>
          <p className="eyebrow">{pick(node.countryName, lang)}・{node.status === "active" ? h.localNode : h.invited}</p>
          <h2 className="mt-1 text-xl font-bold">{pick(node.name, lang)}</h2>
          <p className="text-sm text-slate-500">{lang === "zh" ? node.name.en : node.name["zh-Hant"]}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{pick(node.summary, lang)}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{node.tags.map((tg, i) => <span key={i} className="chip">{pick(tg, lang)}</span>)}</div>
          {node.status === "active" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/nodes/${node.slug}/graph`} className="btn-dark !py-2">{h.viewGraph}</Link>
              <Link href={`/ask?node=${node.slug}`} className="btn-outline !py-2">{h.tryAsk}</Link>
            </div>
          ) : (
            <div className="mt-4">
              <Link href="/join?intent=node" className="btn-primary !py-2">{h.createNode}</Link>
              <p className="mt-2 text-xs text-slate-500">{h.invitedNote}</p>
            </div>
          )}
        </aside>
      )}
    </section>
  );
}
