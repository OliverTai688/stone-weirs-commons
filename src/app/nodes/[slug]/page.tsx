import Link from "next/link";
import { notFound } from "next/navigation";
import { crmMeta, crmOrder } from "@/lib/crm";
import { nodeMetrics } from "@/server/metrics";
import { GraphExplorer } from "@/components/graph/GraphExplorer";
import { getNode, listEntities, listNodes, listRelations } from "@/server/repo";

export async function generateStaticParams() {
  return (await listNodes()).map((n) => ({ slug: n.slug }));
}

export default async function NodePage({ params }: PageProps<"/nodes/[slug]">) {
  const { slug } = await params;
  const node = await getNode(slug);
  if (!node) notFound();
  const [entities, relations, m] = await Promise.all([listEntities(slug), listRelations(slug), nodeMetrics(slug)]);
  const fpicLine = [m.fpic.obtained && `已取得 ${m.fpic.obtained}`, m.fpic.assumed && `推定 ${m.fpic.assumed}`, m.fpic.pending && `待取得 ${m.fpic.pending}`, m.fpic.withdrawn && `已撤回 ${m.fpic.withdrawn}`].filter(Boolean).join("・");

  return (
    <div>
      <section className="bg-ink py-12 text-white">
        <div className="container-page">
          <p className="eyebrow !text-reef">{node.countryName["zh-Hant"]}・{node.status === "active" ? "在地節點" : "邀請中"}</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{node.name["zh-Hant"]}</h1>
          <p className="text-white/70">{node.name.en}</p>
          <p className="mt-4 max-w-2xl text-white/85">{node.summary["zh-Hant"]}</p>
          <div className="mt-4 flex flex-wrap gap-2">{node.tags.map((t) => <span key={t} className="chip !bg-white/10 !text-white">{t}</span>)}</div>
          {node.status === "active" ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/nodes/${slug}/graph`} className="btn-primary">查看概念圖</Link>
              <Link href={`/nodes/${slug}/guide`} className="btn-ghost">導覽敘事</Link>
              <Link href={`/ask?node=${slug}`} className="btn-ghost">試問 AI</Link>
            </div>
          ) : (
            <Link href="/join?intent=node" className="btn-primary mt-6">我想建立這個節點</Link>
          )}
        </div>
      </section>

      {node.status === "active" && (
        <section className="container-page py-10">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />動態指標
            </span>
            依本節點目前的 {m.records} 筆紀錄、{m.relations} 條關係即時計算；紀錄新增、審核或撤回時會自動更新，不是固定數字。
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["治理紀錄", `${m.records}`, `已審核 ${m.approvedPct}%・${m.relations} 條關係`],
              ["出處覆蓋", `${m.provenancePct}%`, "具 PROV-O 出處的紀錄比例"],
              ["限制級位置外洩", `${m.restrictedExposed}`, `${m.restricted} 筆限制級紀錄，皆未進入 AI 索引`],
              ["FPIC 同意狀態", fpicLine || "—", "「推定」代表來源為已出版、具名的報導"],
            ].map(([k, v, d]) => (
              <div key={k} className="card">
                <p className="text-xs text-slate-500">{k}</p>
                <p className="mt-1 text-2xl font-bold text-navy">{v}</p>
                <p className="mt-0.5 text-xs text-slate-500">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            語言：{m.languages.join("・")}・在地詞彙 {m.localTerms} 個（保留原文）
          </p>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">紀錄一覽：CIDOC-CRM 概念圖</h2>
              <p className="mt-1 text-sm text-slate-600">每一筆紀錄都是圖上的一個節點，連線是它們之間的關係。點擊節點可以看到出處、治理資訊與相關紀錄。</p>
            </div>
            <Link href={`/nodes/${slug}/graph`} className="text-sm font-semibold text-tide hover:underline">全螢幕檢視 →</Link>
          </div>
          <div className="mt-4">
            <GraphExplorer entities={entities} relations={relations} nodeSlug={slug} />
          </div>

          <details className="mt-8 rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">以清單檢視全部 {entities.length} 筆紀錄</summary>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
            {crmOrder.map((c) => {
              const list = entities.filter((e) => e.crmClass === c);
              if (!list.length) return null;
              return (
                <div key={c}>
                  <h3 className="text-sm font-bold" style={{ color: crmMeta[c].color }}>{c} {crmMeta[c].zh}</h3>
                  <ul className="mt-2 space-y-2">
                    {list.map((e) => (
                      <li key={e.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{e.label["zh-Hant"]}</span>
                          <span className="text-xs text-slate-400">{e.id}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-slate-600">{e.description["zh-Hant"]}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          </details>
        </section>
      )}
    </div>
  );
}
