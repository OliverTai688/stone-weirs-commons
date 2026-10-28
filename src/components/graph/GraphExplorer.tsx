"use client";

import Link from "next/link";
import { useState } from "react";
import { ConceptGraph } from "./ConceptGraph";
import { crmMeta, fpicMeta, geoTierMeta } from "@/lib/crm";
import type { Entity, Relation } from "@/lib/types";

export function GraphExplorer({ entities, relations, nodeSlug }: { entities: Entity[]; relations: Relation[]; nodeSlug: string }) {
  const [sel, setSel] = useState<string | null>("OB-01");
  const [codes, setCodes] = useState(false);
  const e = entities.find((x) => x.id === sel);
  const related = relations.filter((r) => r.from === sel || r.to === sel);
  const name = (id: string) => entities.find((x) => x.id === id)?.label["zh-Hant"] ?? id;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>點擊節點查看出處與治理資訊。拖曳可移動畫面，滾輪可縮放。</span>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={codes} onChange={(ev) => setCodes(ev.target.checked)} />
            顯示 CIDOC-CRM 代碼
          </label>
        </div>
        <ConceptGraph
          entities={entities.map((x) => ({ id: x.id, crmClass: x.crmClass, label: x.label["zh-Hant"] ?? x.id, restricted: x.governance.geoTier === "restricted" }))}
          relations={relations.map((r) => ({ id: r.id, from: r.from, to: r.to, property: r.property, label: r.label["zh-Hant"] ?? r.property }))}
          selected={sel}
          onSelect={setSel}
          showCodes={codes}
          height={620}
        />
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {Object.entries(crmMeta).map(([k, m]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded" style={{ background: m.bg, border: `2px solid ${m.color}` }} />
              {k} {m.zh}
            </span>
          ))}
        </div>
      </div>

      <aside className="card h-fit lg:sticky lg:top-20">
        {e ? (
          <>
            <p className="text-xs font-bold" style={{ color: crmMeta[e.crmClass].color }}>
              {e.id}・{e.crmClass} {crmMeta[e.crmClass].zh}
            </p>
            <h2 className="mt-1 text-lg font-bold">{e.label["zh-Hant"]}</h2>
            <p className="text-sm text-slate-500">{e.label.en}</p>
            <p className="mt-3 text-sm leading-relaxed">{e.description["zh-Hant"]}</p>
            {e.terms && (
              <div className="mt-3 rounded-xl bg-sand p-3 text-sm">
                <p className="mb-1 text-xs font-bold text-slate-600">在地詞彙（保留原文）</p>
                {e.terms.map((t) => (
                  <p key={t.term}>
                    <span className="text-lg font-bold">{t.term}</span> <span className="text-slate-500">{t.romanization}・{t.language === "hak" ? "客語" : "華語"}</span>
                    {t.gloss && <span className="text-slate-500">・{t.gloss}</span>}
                  </p>
                ))}
              </div>
            )}
            {related.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-600">關係</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {related.map((r) => (
                    <li key={r.id}>
                      <button type="button" className="text-left hover:underline" onClick={() => setSel(r.from === sel ? r.to : r.from)}>
                        {name(r.from)} <span className="text-tide">—{r.label["zh-Hant"]}→</span> {name(r.to)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-slate-100 pt-3 text-xs">
              <dt className="text-slate-500">出處 PROV-O</dt><dd>{e.source}</dd>
              <dt className="text-slate-500">FPIC</dt><dd>{fpicMeta[e.governance.fpic]}</dd>
              <dt className="text-slate-500">授權</dt><dd>{e.governance.license}</dd>
              <dt className="text-slate-500">地理隱私</dt><dd>{geoTierMeta[e.governance.geoTier].zh}・{geoTierMeta[e.governance.geoTier].desc}</dd>
              <dt className="text-slate-500">敏感度</dt><dd>{e.governance.sensitivity}</dd>
              <dt className="text-slate-500">審查者</dt><dd>{e.governance.reviewerRole}</dd>
            </dl>
            <Link href={`/ask?node=${nodeSlug}&q=${encodeURIComponent(e.label["zh-Hant"] ?? "")}`} className="btn-outline mt-4 w-full !py-2">
              就這筆紀錄問 AI
            </Link>
          </>
        ) : (
          <p className="text-sm text-slate-500">點擊左側的節點。</p>
        )}
      </aside>
    </div>
  );
}
