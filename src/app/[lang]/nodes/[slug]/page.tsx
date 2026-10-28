import { notFound } from "next/navigation";
import { GraphExplorer } from "@/components/graph/GraphExplorer";
import { crmMeta, crmOrder } from "@/lib/crm";
import { Link } from "@/i18n/client";
import { fmt, locales, pick } from "@/i18n/config";
import { getDict } from "@/i18n/server";
import { nodeMetrics } from "@/server/metrics";
import { getNode, listEntities, listNodes, listRelations } from "@/server/repo";

export async function generateStaticParams() {
  const nodes = await listNodes();
  return locales.flatMap((lang) => nodes.map((n) => ({ lang, slug: n.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/nodes/[slug]">) {
  const [{ slug }, { lang }] = await Promise.all([params, getDict()]);
  const node = await getNode(slug);
  return { title: node ? pick(node.name, lang) : slug };
}

export default async function NodePage({ params }: PageProps<"/[lang]/nodes/[slug]">) {
  const { slug } = await params;
  const { t, lang } = await getDict();
  const n = t.node;
  const node = await getNode(slug);
  if (!node) notFound();
  const [entities, relations, m] = await Promise.all([listEntities(slug), listRelations(slug), nodeMetrics(slug)]);
  const fpicLine = [
    m.fpic.obtained && fmt(n.fpicObtained, { n: m.fpic.obtained }),
    m.fpic.assumed && fmt(n.fpicAssumed, { n: m.fpic.assumed }),
    m.fpic.pending && fmt(n.fpicPending, { n: m.fpic.pending }),
    m.fpic.withdrawn && fmt(n.fpicWithdrawn, { n: m.fpic.withdrawn }),
  ].filter(Boolean).join("・");
  const other = lang === "zh" ? "en" : "zh-Hant";

  return (
    <div>
      <section className="bg-ink py-12 text-white">
        <div className="container-page">
          <p className="eyebrow !text-reef">{pick(node.countryName, lang)}・{node.status === "active" ? n.localNode : n.invited}</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{pick(node.name, lang)}</h1>
          <p className="text-white/70">{node.name[other]}</p>
          <p className="mt-4 max-w-2xl text-white/85">{pick(node.summary, lang)}</p>
          <div className="mt-4 flex flex-wrap gap-2">{node.tags.map((tg, i) => <span key={i} className="chip !bg-white/10 !text-white">{pick(tg, lang)}</span>)}</div>
          {node.status === "active" ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/nodes/${slug}/graph`} className="btn-primary">{n.viewGraph}</Link>
              <Link href={`/nodes/${slug}/guide`} className="btn-ghost">{n.guide}</Link>
              <Link href={`/ask?node=${slug}`} className="btn-ghost">{n.ask}</Link>
            </div>
          ) : (
            <Link href="/join?intent=node" className="btn-primary mt-6">{n.createNode}</Link>
          )}
        </div>
      </section>

      {node.status === "active" && (
        <section className="container-page py-10">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{n.dynamic}
            </span>
            {fmt(n.dynamicNote, { records: m.records, relations: m.relations })}
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              [n.mRecords, `${m.records}`, fmt(n.mRecordsSub, { approved: m.approvedPct, relations: m.relations })],
              [n.mProv, `${m.provenancePct}%`, n.mProvSub],
              [n.mLeak, `${m.restrictedExposed}`, fmt(n.mLeakSub, { n: m.restricted })],
              [n.mFpic, fpicLine || "—", n.mFpicSub],
            ].map(([k, v, d]) => (
              <div key={k} className="card">
                <p className="text-xs text-slate-500">{k}</p>
                <p className="mt-1 text-2xl font-bold text-navy">{v}</p>
                <p className="mt-0.5 text-xs text-slate-500">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {fmt(n.languages, { langs: [...new Set(m.languages.map((l) => t.langNames[l] ?? l))].join("・"), terms: m.localTerms })}
          </p>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{n.graphTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">{n.graphSub}</p>
            </div>
            <Link href={`/nodes/${slug}/graph`} className="text-sm font-semibold text-tide hover:underline">{n.fullscreen}</Link>
          </div>
          <div className="mt-4">
            <GraphExplorer entities={entities} relations={relations} nodeSlug={slug} />
          </div>

          <details className="mt-8 rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">{fmt(n.listToggle, { n: entities.length })}</summary>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {crmOrder.map((c) => {
                const list = entities.filter((e) => e.crmClass === c);
                if (!list.length) return null;
                return (
                  <div key={c}>
                    <h3 className="text-sm font-bold" style={{ color: crmMeta[c].color }}>{c} {t.crm[c]}</h3>
                    <ul className="mt-2 space-y-2">
                      {list.map((e) => (
                        <li key={e.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold">{pick(e.label, lang)}</span>
                            <span className="text-xs text-slate-400">{e.id}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-slate-600">{pick(e.description, lang)}</p>
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
