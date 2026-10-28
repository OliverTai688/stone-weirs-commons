import Link from "next/link";
import { QrCode } from "@/components/QrCode";

export const metadata = { title: "APCONF 2026" };

export default function ApconfPage() {
  return (
    <div>
      <section className="bg-ink py-14 text-white">
        <div className="container-page grid items-center gap-10 md:grid-cols-[1fr_240px]">
          <div>
            <p className="eyebrow !text-reef">APCONF・Asia-Pacific Regional Conference on Underwater Cultural Heritage</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Stone Weirs, Shared Futures</h1>
            <p className="mt-2 text-white/80">Governance-First AI Question Answering and Guided Narratives for Maritime Heritage</p>
            <p className="mt-1 text-sm text-white/60">Yu-Hsin TAI, Chen-Min LAI, Jen-Fu LEE, Yun-Fang CHANG</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/join?utm_source=apconf2026" className="btn-primary">30 秒加入，會後持續交流</Link>
              <Link href="/ask" className="btn-ghost">試問 AI</Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-3"><QrCode path="/join?utm_source=apconf2026" /></div>
        </div>
      </section>
      <section className="container-page grid gap-5 py-12 md:grid-cols-3">
        {[
          ["62.5% → 0%", "幻覺率", "24 題 QA 標準題組，治理檢索 vs. 未治理生成"],
          ["100%", "出處與引用正確率", "每個回答都能追溯到具出處與同意狀態的紀錄"],
          ["6／6", "客語詞彙精確度", "石塭、流水來等在地詞彙完整保留"],
        ].map(([v, k, d]) => (
          <div key={k} className="card">
            <p className="text-3xl font-bold text-coral">{v}</p>
            <p className="mt-1 font-semibold">{k}</p>
            <p className="mt-1 text-sm text-slate-600">{d}</p>
          </div>
        ))}
      </section>
      <section className="container-page pb-14 text-sm text-slate-600">
        <p>TRL-3 pilot：單一已出版敘事、單一評分者、24 題。使用者研究與多節點擴充是下一步，也是我們邀請你加入的原因。</p>
      </section>
    </div>
  );
}
