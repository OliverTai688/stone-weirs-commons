import { notFound } from "next/navigation";
import { AskBox } from "@/components/ask/AskBox";
import { demoQuestions } from "@/data/xinwu";
import { getNode, listNodes } from "@/lib/repo";

export const metadata = { title: "展場導覽問答" };

export async function generateStaticParams() {
  return (await listNodes()).filter((n) => n.status === "active").map((n) => ({ slug: n.slug }));
}

export default async function ExhibitPage({ params }: PageProps<"/exhibit/[slug]">) {
  const { slug } = await params;
  const node = await getNode(slug);
  if (!node || node.status !== "active") notFound();
  return (
    <div className="min-h-[80vh] bg-sand/60">
      <div className="mx-auto max-w-lg px-5 py-8">
        <p className="eyebrow">展場導覽・Exhibit guide</p>
        <h1 className="mt-1 text-2xl font-bold">{node.name["zh-Hant"]}</h1>
        <p className="mt-2 text-sm text-slate-600">想知道什麼都可以問。回答只根據這個展覽的紀錄，並附上出處。</p>
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <AskBox suggestions={demoQuestions.slice(0, 3)} nodeSlug={slug} compact />
        </div>
      </div>
    </div>
  );
}
