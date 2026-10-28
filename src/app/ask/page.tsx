import { Suspense } from "react";
import { AskBox } from "@/components/ask/AskBox";
import { demoQuestions } from "@/data/xinwu";

export const metadata = { title: "工具二：問 AI" };

export default function AskPage(props: PageProps<"/ask">) {
  return (
    <Suspense fallback={<div className="container-page py-10 text-slate-400">載入中…</div>}>
      <AskInner {...props} />
    </Suspense>
  );
}

async function AskInner({ searchParams }: PageProps<"/ask">) {
  const sp = await searchParams;
  const node = typeof sp.node === "string" ? sp.node : "xinwu";
  const q = typeof sp.q === "string" ? sp.q : "";
  return (
    <div className="container-page max-w-4xl py-10">
      <p className="eyebrow">工具二・可信的 AI 問答</p>
      <h1 className="mt-1 text-3xl font-bold">只說有根據的話</h1>
      <p className="mt-2 text-slate-600">
        AI 只根據新屋節點經過治理的紀錄回答，每句話都附上出處；資料不足時會直接說不知道。勾選並列比較，就能看到論文中未治理 AI 犯下的錯誤。
      </p>
      <div className="mt-8">
        <AskBox suggestions={[...demoQuestions, "石滬的精確座標在哪裡？", "石滬是誰在管理？"]} nodeSlug={node} initialQ={q} />
      </div>
    </div>
  );
}
