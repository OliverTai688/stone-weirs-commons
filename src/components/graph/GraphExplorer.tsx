"use client";

import { useState } from "react";
import { LazyConceptGraph as ConceptGraph } from "./LazyConceptGraph";
import { crmMeta } from "@/lib/crm";
import { Link, useI18n } from "@/i18n/client";
import { pick } from "@/i18n/config";
import type { Entity, Relation } from "@/lib/types";

export function GraphExplorer({ entities, relations, nodeSlug }: { entities: Entity[]; relations: Relation[]; nodeSlug: string }) {
  const { t, lang } = useI18n();
  const g = t.graph;
  const [sel, setSel] = useState<string | null>("OB-01");
  const [codes, setCodes] = useState(false);
  const e = entities.find((x) => x.id === sel);
  const related = relations.filter((r) => r.from === sel || r.to === sel);
  const name = (id: string) => pick(entities.find((x) => x.id === id)?.label, lang) || id;
  const other = lang === "zh" ? "en" : "zh-Hant";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>{g.hint}</span>
          <label className="flex shrink-0 items-center gap-1.5">
            <input type="checkbox" checked={codes} onChange={(ev) => setCodes(ev.target.checked)} />
            {g.showCodes}
          </label>
        </div>
        <ConceptGraph
          entities={entities.map((x) => ({ id: x.id, crmClass: x.crmClass, label: pick(x.label, lang) || x.id, restricted: x.governance.geoTier === "restricted" }))}
          relations={relations.map((r) => ({ id: r.id, from: r.from, to: r.to, property: r.property, label: pick(r.label, lang) || r.property }))}
          selected={sel}
          onSelect={setSel}
          showCodes={codes}
          height="clamp(380px, 64vh, 620px)"
        />
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {Object.entries(crmMeta).map(([k, m]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded" style={{ background: m.bg, border: `2px solid ${m.color}` }} />
              {k} {t.crm[k as keyof typeof t.crm]}
            </span>
          ))}
        </div>
      </div>

      <aside className="card h-fit lg:sticky lg:top-20">
        {e ? (
          <>
            <p className="text-xs font-bold" style={{ color: crmMeta[e.crmClass].color }}>
              {e.id}・{e.crmClass} {t.crm[e.crmClass]}
            </p>
            <h2 className="mt-1 text-lg font-bold">{pick(e.label, lang)}</h2>
            <p className="text-sm text-slate-500">{e.label[other]}</p>
            <p className="mt-3 text-sm leading-relaxed">{pick(e.description, lang)}</p>
            {e.terms && (
              <div className="mt-3 rounded-xl bg-sand p-3 text-sm">
                <p className="mb-1 text-xs font-bold text-slate-600">{g.localTerms}</p>
                {e.terms.map((tm) => (
                  <p key={tm.term}>
                    <span className="text-lg font-bold">{tm.term}</span>{" "}
                    <span className="text-slate-500">{tm.romanization}・{tm.language === "hak" ? g.hakka : g.mandarin}</span>
                  </p>
                ))}
              </div>
            )}
            {related.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-600">{g.relations}</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {related.map((r) => (
                    <li key={r.id}>
                      <button type="button" className="text-left hover:underline" onClick={() => setSel(r.from === sel ? r.to : r.from)}>
                        {name(r.from)} <span className="text-tide">—{pick(r.label, lang)}→</span> {name(r.to)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-slate-100 pt-3 text-xs">
              <dt className="text-slate-500">{g.prov}</dt><dd>{e.source}</dd>
              <dt className="text-slate-500">{g.fpic}</dt><dd>{t.fpic[e.governance.fpic]}</dd>
              <dt className="text-slate-500">{g.licence}</dt><dd>{pick(e.governance.license, lang)}</dd>
              <dt className="text-slate-500">{g.geo}</dt><dd>{t.geoTier[e.governance.geoTier][0]}・{t.geoTier[e.governance.geoTier][1]}</dd>
              <dt className="text-slate-500">{g.sensitivity}</dt><dd>{e.governance.sensitivity}</dd>
              <dt className="text-slate-500">{g.reviewer}</dt><dd>{pick(e.governance.reviewerRole, lang)}</dd>
            </dl>
            <Link href={`/ask?node=${nodeSlug}&q=${encodeURIComponent(pick(e.label, lang))}`} className="btn-outline mt-4 w-full !py-2">
              {g.askThis}
            </Link>
          </>
        ) : (
          <p className="text-sm text-slate-500">{g.pickNode}</p>
        )}
      </aside>
    </div>
  );
}
