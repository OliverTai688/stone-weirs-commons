import { QrCode } from "@/components/QrCode";
import { Link } from "@/i18n/client";
import { getDict } from "@/i18n/server";

export const metadata = { title: "APCONF 2026" };

export default async function ApconfPage() {
  const { t, lang } = await getDict();
  const a = t.apconf;
  return (
    <div>
      <section className="bg-ink py-14 text-white">
        <div className="container-page grid items-center gap-10 md:grid-cols-[1fr_240px]">
          <div>
            <p className="eyebrow !text-reef">{a.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Stone Weirs, Shared Futures</h1>
            <p className="mt-2 text-white/80">Governance-First AI Question Answering and Guided Narratives for Maritime Heritage</p>
            <p className="mt-1 text-sm text-white/60">Yu-Hsin TAI, Chen-Min LAI, Jen-Fu LEE, Yun-Fang CHANG</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/join?utm_source=apconf2026" className="btn-primary">{a.cta}</Link>
              <Link href="/ask" className="btn-ghost">{a.ask}</Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-3"><QrCode path={`/${lang}/join?utm_source=apconf2026`} /></div>
        </div>
      </section>
      <section className="container-page grid gap-5 py-12 md:grid-cols-3">
        {a.stats.map(([v, k, d]) => (
          <div key={k} className="card">
            <p className="text-3xl font-bold text-coral">{v}</p>
            <p className="mt-1 font-semibold">{k}</p>
            <p className="mt-1 text-sm text-slate-600">{d}</p>
          </div>
        ))}
      </section>
      <section className="container-page pb-14 text-sm text-slate-600">
        <p>{a.note}</p>
      </section>
    </div>
  );
}
