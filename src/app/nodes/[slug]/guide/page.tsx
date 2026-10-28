import Link from "next/link";
import { notFound } from "next/navigation";
import { Cite } from "@/components/Cite";
import { QrCode } from "@/components/QrCode";
import { getNode, listEntities, listNodes } from "@/lib/repo";

export const metadata = { title: "導覽敘事" };

const CHAPTERS: { title: string; en: string; ids: string[] }[] = [
  { title: "第一章　海邊的客家人", en: "Hakka of the coast", ids: ["X-AC-COMMUNITY", "X-NE-IDENTITY", "X-PL-XINWU"] },
  { title: "第二章　石塭與流水來", en: "Shi-wen and the rising tide", ids: ["OB-01", "NE-01", "X-NE-TIDE"] },
  { title: "第三章　慢慢長大的藻礁", en: "The slow-growing reef", ids: ["OB-02"] },
  { title: "第四章　餐桌上的海：鹹醢飯", en: "The sea at the table", ids: ["OB-04"] },
  { title: "第五章　誰來守護石滬", en: "Who keeps the weirs", ids: ["X-AC-PATROL", "X-EV-GOV", "X-AC-ASSOC"] },
  { title: "第六章　故事館的前身", en: "Before the Story Hall", ids: ["X-EV-REUSE", "PL-03"] },
];

export async function generateStaticParams() {
  return (await listNodes()).filter((n) => n.status === "active").map((n) => ({ slug: n.slug }));
}

export default async function GuidePage({ params }: PageProps<"/nodes/[slug]/guide">) {
  const { slug } = await params;
  const node = await getNode(slug);
  if (!node || node.status !== "active") notFound();
  const entities = await listEntities(slug);
  const get = (id: string) => entities.find((e) => e.id === id);

  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
      <article>
        <Link href={`/nodes/${slug}`} className="text-sm text-tide hover:underline">← {node.name["zh-Hant"]}</Link>
        <p className="eyebrow mt-4">工具二・導覽敘事</p>
        <h1 className="mt-1 text-3xl font-bold">{node.name["zh-Hant"]}：六段導覽</h1>
        <p className="mt-2 text-sm text-slate-600">
          由概念圖自動組成章節，每段文字都附上出處。正式發布前，節點管理者可以修改文字、調整順序並加入語音。
        </p>
        <div className="mt-8 space-y-10">
          {CHAPTERS.map((ch) => (
            <section key={ch.title}>
              <h2 className="text-xl font-bold text-navy">{ch.title}</h2>
              <p className="text-xs text-slate-500">{ch.en}</p>
              <div className="mt-3 space-y-2 leading-relaxed">
                {ch.ids.map((id) => {
                  const e = get(id);
                  return e ? (
                    <p key={id}>
                      {e.description["zh-Hant"]}
                      <Cite id={id} node={slug} label={e.label["zh-Hant"]} />
                    </p>
                  ) : null;
                })}
              </div>
            </section>
          ))}
        </div>
      </article>
      <aside className="card h-fit text-center lg:sticky lg:top-20">
        <p className="eyebrow">展場 QR</p>
        <p className="mt-1 text-sm text-slate-600">觀眾掃描後，可以在手機上針對本節點提問。</p>
        <div className="mx-auto mt-4 w-44"><QrCode path={`/exhibit/${slug}`} /></div>
        <Link href={`/exhibit/${slug}`} className="btn-outline mt-4 !py-2">預覽展場頁</Link>
      </aside>
    </div>
  );
}
