import { notFound } from "next/navigation";
import { GraphExplorer } from "@/components/graph/GraphExplorer";
import { Link } from "@/i18n/client";
import { fmt, locales, pick } from "@/i18n/config";
import { getDict } from "@/i18n/server";
import { getNode, listEntities, listNodes, listRelations } from "@/server/repo";

export async function generateStaticParams() {
  const nodes = (await listNodes()).filter((n) => n.status === "active");
  return locales.flatMap((lang) => nodes.map((n) => ({ lang, slug: n.slug })));
}

export async function generateMetadata() {
  const { t } = await getDict();
  return { title: t.graph.pageTitle };
}

export default async function GraphPage({ params }: PageProps<"/[lang]/nodes/[slug]/graph">) {
  const { slug } = await params;
  const { t, lang } = await getDict();
  const node = await getNode(slug);
  if (!node || node.status !== "active") notFound();
  const [entities, relations] = await Promise.all([listEntities(slug), listRelations(slug)]);
  return (
    <div className="container-page py-8">
      <Link href={`/nodes/${slug}`} className="text-sm text-tide hover:underline">← {pick(node.name, lang)}</Link>
      <h1 className="mt-2 text-2xl font-bold">{t.graph.pageTitle}</h1>
      <p className="mt-1 max-w-3xl text-sm text-slate-600">{fmt(t.graph.pageSub, { n: entities.length })}</p>
      <div className="mt-6">
        <GraphExplorer entities={entities} relations={relations} nodeSlug={slug} />
      </div>
    </div>
  );
}
