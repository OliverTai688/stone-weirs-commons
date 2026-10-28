import Link from "next/link";
import { notFound } from "next/navigation";
import { GraphExplorer } from "@/components/graph/GraphExplorer";
import { getNode, listEntities, listNodes, listRelations } from "@/lib/repo";

export const metadata = { title: "概念圖" };

export async function generateStaticParams() {
  return (await listNodes()).filter((n) => n.status === "active").map((n) => ({ slug: n.slug }));
}

export default async function GraphPage({ params }: PageProps<"/nodes/[slug]/graph">) {
  const { slug } = await params;
  const node = await getNode(slug);
  if (!node || node.status !== "active") notFound();
  const [entities, relations] = await Promise.all([listEntities(slug), listRelations(slug)]);
  return (
    <div className="container-page py-8">
      <Link href={`/nodes/${slug}`} className="text-sm text-tide hover:underline">← {node.name["zh-Hant"]}</Link>
      <h1 className="mt-2 text-2xl font-bold">CIDOC-CRM 概念圖</h1>
      <p className="mt-1 max-w-3xl text-sm text-slate-600">
        同一則故事，不再只是一排欄位，而是人物、地點、事件、器物與敘事之間的關係網。這是示範子集（{entities.length} 筆），正式的 35 筆治理紀錄匯入後會自動更新。
      </p>
      <div className="mt-6">
        <GraphExplorer entities={entities} relations={relations} nodeSlug={slug} />
      </div>
    </div>
  );
}
