import { HomeGlobe } from "@/components/globe/HomeGlobe";
import { Link } from "@/i18n/client";
import { getDict } from "@/i18n/server";
import { listNodeLinks, listNodes, stats } from "@/server/repo";

export default async function Home() {
  const [{ t }, nodes, links, s] = await Promise.all([getDict(), listNodes(), listNodeLinks(), stats()]);
  const h = t.home;
  return (
    <>
      <HomeGlobe nodes={nodes} links={links} stats={s} />

      <section className="container-page py-16">
        <p className="eyebrow">{h.toolsEyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">{h.toolsTitle}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link href="/tools/interview" className="card group transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="eyebrow">{h.tool1Eyebrow}</p>
            <h3 className="mt-1 text-xl font-bold">{h.tool1Title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{h.tool1Body}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-tide group-hover:underline">{h.tool1Cta}</span>
          </Link>
          <Link href="/ask" className="card group transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="eyebrow">{h.tool2Eyebrow}</p>
            <h3 className="mt-1 text-xl font-bold">{h.tool2Title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{h.tool2Body}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-tide group-hover:underline">{h.tool2Cta}</span>
          </Link>
        </div>
      </section>

      <section className="bg-sand/60 py-16">
        <div className="container-page grid gap-8 md:grid-cols-3">
          {h.claims.map(([title, d]) => (
            <div key={title}>
              <h3 className="text-lg font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16 text-center">
        <h2 className="text-2xl font-bold">{h.closingTitle}</h2>
        <p className="mt-2 text-slate-600">{h.closingSub}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/join" className="btn-primary">{h.closingJoin}</Link>
          <Link href="/apconf" className="btn-outline">{h.closingApconf}</Link>
        </div>
      </section>
    </>
  );
}
