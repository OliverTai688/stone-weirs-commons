import Link from "next/link";
import { notFound } from "next/navigation";
import { crmMeta, crmOrder } from "@/lib/crm";
import { getNode, listEntities, listNodes } from "@/server/repo";

export async function generateStaticParams() {
  return (await listNodes()).map((n) => ({ slug: n.slug }));
}

export default async function NodePage({ params }: PageProps<"/nodes/[slug]">) {
  const { slug } = await params;
  const node = await getNode(slug);
  if (!node) notFound();
  const entities = await listEntities(slug);

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
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["治理紀錄", `${entities.length}`, "示範子集；正式版 35 筆"],
              ["出處覆蓋", "100%", "每筆都有 PROV-O"],
              ["地理隱私事件", "0", "限制級座標不公開"],
              ["主要語言", "客語・華語・英語", "詞彙保留原文"],
            ].map(([k, v, d]) => (
              <div key={k} className="card">
                <p className="text-xs text-slate-500">{k}</p>
                <p className="mt-1 text-2xl font-bold text-navy">{v}</p>
                <p className="text-xs text-slate-500">{d}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-xl font-bold">紀錄一覽</h2>
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
        </section>
      )}
    </div>
  );
}
