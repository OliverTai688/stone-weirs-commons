import { Suspense } from "react";
import { JoinForm } from "@/components/auth/JoinForm";

export const metadata = { title: "加入網絡" };

export default function JoinPage(props: PageProps<"/join">) {
  return (
    <Suspense fallback={<div className="container-page py-12 text-slate-400">載入中…</div>}>
      <JoinInner {...props} />
    </Suspense>
  );
}

async function JoinInner({ searchParams }: PageProps<"/join">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/tools/interview";
  const source = typeof sp.utm_source === "string" ? sp.utm_source : "direct";
  return (
    <div className="container-page grid max-w-5xl gap-10 py-12 md:grid-cols-2">
      <div>
        <p className="eyebrow">30 秒加入</p>
        <h1 className="mt-1 text-3xl font-bold">加入亞太石滬研究網絡</h1>
        <ul className="mt-6 space-y-3 text-slate-700">
          <li>🌏　建立你的在地節點，讓你的海岸出現在地球上</li>
          <li>🗣　用說的留下故事，AI 幫你生成 CIDOC-CRM 概念圖</li>
          <li>🔎　不限次數使用可信的 AI 問答與跨節點交流</li>
          <li>🏛　為你的展館申請 AI 導覽試用</li>
        </ul>
        <p className="mt-6 text-sm text-slate-500">這是一個 pilot：我們邀請的是共創夥伴，不只是使用者。</p>
      </div>
      <div className="card !p-6"><JoinForm next={next} source={source} /></div>
    </div>
  );
}
