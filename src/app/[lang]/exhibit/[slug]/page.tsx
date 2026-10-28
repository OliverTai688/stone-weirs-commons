import { notFound } from "next/navigation";
import { AskBox } from "@/components/ask/AskBox";
import { demoQuestions } from "@/data/xinwu";
import { dataKey, locales, pick } from "@/i18n/config";
import { getDict } from "@/i18n/server";
import { getNode, listNodes } from "@/server/repo";

export async function generateStaticParams() {
  const nodes = (await listNodes()).filter((n) => n.status === "active");
  return locales.flatMap((lang) => nodes.map((n) => ({ lang, slug: n.slug })));
}

export async function generateMetadata() {
  const { t } = await getDict();
  return { title: t.ask.exhibitEyebrow };
}

export default async function ExhibitPage({ params }: PageProps<"/[lang]/exhibit/[slug]">) {
  const { slug } = await params;
  const { t, lang } = await getDict();
  const node = await getNode(slug);
  if (!node || node.status !== "active") notFound();
  return (
    <div className="min-h-[80vh] bg-sand/60">
      <div className="mx-auto max-w-lg px-5 py-8">
        <p className="eyebrow">{t.ask.exhibitEyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold">{pick(node.name, lang)}</h1>
        <p className="mt-2 text-sm text-slate-600">{t.ask.exhibitSub}</p>
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <AskBox suggestions={demoQuestions[dataKey(lang)].slice(0, 3)} nodeSlug={slug} compact />
        </div>
      </div>
    </div>
  );
}
