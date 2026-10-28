import { notFound } from "next/navigation";
import { Cite } from "@/components/Cite";
import { QrCode } from "@/components/QrCode";
import { WenGuide } from "@/components/guide/WenGuide";
import { QG } from "@/components/guide/wenQuick";
import { Link } from "@/i18n/client";
import { fmt, locales, pick } from "@/i18n/config";
import { getDict } from "@/i18n/server";
import { getNode, listEntities, listNodes } from "@/server/repo";

export async function generateStaticParams() {
  const nodes = (await listNodes()).filter((n) => n.status === "active");
  return locales.flatMap((lang) => nodes.map((n) => ({ lang, slug: n.slug })));
}

export async function generateMetadata() {
  const { t } = await getDict();
  return { title: t.node.guide };
}

const CHAPTERS: { zh: string; en: string; ids: string[] }[] = [
  { zh: "海邊的客家人", en: "Hakka of the coast", ids: ["X-AC-COMMUNITY", "X-NE-IDENTITY", "X-PL-XINWU"] },
  { zh: "石塭與流水來", en: "Shi-wen and the rising tide", ids: ["OB-01", "NE-01", "X-NE-TIDE"] },
  { zh: "慢慢長大的藻礁", en: "The slow-growing reef", ids: ["OB-02"] },
  { zh: "餐桌上的海：鹹醢飯", en: "The sea at the table: xianhaifan", ids: ["OB-04"] },
  { zh: "誰來守護石滬", en: "Who keeps the weirs", ids: ["X-AC-PATROL", "X-EV-GOV", "X-AC-ASSOC"] },
  { zh: "故事館的前身", en: "Before the Story Hall", ids: ["X-EV-REUSE", "PL-03"] },
];

export default async function GuidePage({ params }: PageProps<"/[lang]/nodes/[slug]/guide">) {
  const { slug } = await params;
  const { t, lang } = await getDict();
  const g = t.guide;
  const q = QG[lang];
  const node = await getNode(slug);
  if (!node || node.status !== "active") notFound();
  const entities = await listEntities(slug);
  const get = (id: string) => entities.find((e) => e.id === id);
  const other = lang === "zh" ? "en" : "zh";

  return (
    <>
      {/* Tool 2 in action: the 石塭問答 guide, opening with a quick guide */}
      <WenGuide siteLang={lang} nodeSlug={slug} />

      <section id="how-it-works" className="scroll-mt-20 border-y border-slate-200 bg-white py-12">
        <div className="container-page">
          <p className="eyebrow">{g.eyebrow}</p>
          <h2 className="mt-1 text-2xl font-bold">{q.how}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {q.steps.map(([title, body], i) => (
              <li key={title} className="card">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                <h3 className="mt-3 font-bold">{title}</h3>
                {/* step text contains small inline illustrations (strike / seal) from our own content */}
                <p className="mt-1 text-sm leading-relaxed text-slate-600 [&_.eg-seal]:mx-0.5 [&_.eg-seal]:inline-grid [&_.eg-seal]:h-6 [&_.eg-seal]:w-6 [&_.eg-seal]:-rotate-12 [&_.eg-seal]:place-items-center [&_.eg-seal]:rounded-full [&_.eg-seal]:border-2 [&_.eg-seal]:border-tide [&_.eg-seal]:align-middle [&_.eg-seal]:text-[9px] [&_.eg-seal]:font-bold [&_.eg-seal]:text-tide [&_.eg-strike]:text-coral [&_.eg-strike]:line-through" dangerouslySetInnerHTML={{ __html: body }} />
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/exhibit/${slug}`} className="btn-dark !py-2">{g.preview}</Link>
            <Link href="/join?intent=pilot" className="btn-outline !py-2">{q.useIt}</Link>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
        <article>
          <Link href={`/nodes/${slug}`} className="text-sm text-tide hover:underline">← {pick(node.name, lang)}</Link>
          <h2 className="mt-3 text-2xl font-bold">{fmt(g.title, { node: pick(node.name, lang) })}</h2>
          <p className="mt-2 text-sm text-slate-600">{g.sub}</p>
          <div className="mt-8 space-y-10">
            {CHAPTERS.map((ch, i) => (
              <section key={ch.en}>
                <h3 className="text-xl font-bold text-navy">{fmt(g.chapter, { n: i + 1 })}　{ch[lang]}</h3>
                <p className="text-xs text-slate-500">{ch[other]}</p>
                <div className="mt-3 space-y-2 leading-relaxed">
                  {ch.ids.map((id) => {
                    const e = get(id);
                    return e ? (
                      <p key={id}>
                        {pick(e.description, lang)}
                        <Cite id={id} node={slug} label={pick(e.label, lang)} lang={lang} />
                      </p>
                    ) : null;
                  })}
                </div>
              </section>
            ))}
          </div>
        </article>
        <aside className="card h-fit text-center lg:sticky lg:top-20">
          <p className="eyebrow">{g.qrEyebrow}</p>
          <p className="mt-1 text-sm text-slate-600">{g.qrSub}</p>
          <div className="mx-auto mt-4 w-44"><QrCode path={`/${lang}/exhibit/${slug}`} /></div>
          <Link href={`/exhibit/${slug}`} className="btn-outline mt-4 !py-2">{g.preview}</Link>
        </aside>
      </div>
    </>
  );
}
