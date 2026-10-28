import Link from "next/link";
import { HomeGlobe } from "@/components/globe/HomeGlobe";
import { listNodeLinks, listNodes, stats } from "@/lib/repo";

export default async function Home() {
  const [nodes, links, s] = await Promise.all([listNodes(), listNodeLinks(), stats()]);
  return (
    <>
      <HomeGlobe nodes={nodes} links={links} stats={s} />

      <section className="container-page py-16">
        <p className="eyebrow">兩個工具・Two tools</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">從在地故事，到可以互通的知識</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link href="/tools/interview" className="card group transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="eyebrow">工具一</p>
            <h3 className="mt-1 text-xl font-bold">用說的，留下你的故事</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              貼上文字或念一段故事，AI 用半結構訪談一題一題追問，同時把人物、地點、事件、器物之間的關係，畫成 CIDOC-CRM 概念圖。每個節點都連回你說的那句話。
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-tide group-hover:underline">開始訪談 →</span>
          </Link>
          <Link href="/ask" className="card group transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="eyebrow">工具二</p>
            <h3 className="mt-1 text-xl font-bold">可信的 AI 導覽與跨研究交流</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              AI 只根據經過治理的紀錄回答，每句話都附上出處。可以用在博物館與社區展場的導覽，也能讓不同領域的研究者交流時保留脈絡。
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-tide group-hover:underline">試問 AI →</span>
          </Link>
        </div>
      </section>

      <section className="bg-sand/60 py-16">
        <div className="container-page grid gap-8 md:grid-cols-3">
          {[
            ["保留脈絡，而不是只剩欄位", "CIDOC-CRM 記錄的是事物「之間」：從哪來、往哪去、被誰使用、長出什麼文化。"],
            ["治理先於生成", "每筆紀錄都有出處、授權與同意狀態。在新屋的試驗中，AI 幻覺率從 62.5% 降到 0%。"],
            ["由下而上，從在地開始", "每個社區先建立自己的節點、自己治理；只要概念一致，AI 就能把各地連起來。"],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="text-lg font-bold text-navy">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16 text-center">
        <h2 className="text-2xl font-bold">石滬的故事還在繼續，下一個點，可能就是你的海岸。</h2>
        <p className="mt-2 text-slate-600">The story continues — the next point on the map could be your shore.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/join" className="btn-primary">30 秒加入</Link>
          <Link href="/apconf" className="btn-outline">APCONF 發表資訊</Link>
        </div>
      </section>
    </>
  );
}
