import { Link } from "@/i18n/client";
import { getDict } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getDict();
  return { title: t.welcome.eyebrow, robots: { index: false } };
}

/** Landing page after the APCONF6 sign-up form (FormHug redirects here). */
export default async function WelcomePage() {
  const { t } = await getDict();
  const w = t.welcome;
  return (
    <div>
      <section className="bg-ink py-14 text-white">
        <div className="container-page max-w-4xl">
          <p className="eyebrow !text-reef">{w.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{w.title}</h1>
          <p className="mt-3 max-w-2xl text-white/85">{w.sub}</p>
        </div>
      </section>

      <section className="container-page max-w-4xl py-10">
        <h2 className="text-xl font-bold">{w.startTitle}</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {w.steps.map(([title, body, href, cta], i) => (
            <li key={href} className="card flex flex-col">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{body}</p>
              <Link href={href} className="mt-4 text-sm font-semibold text-tide hover:underline">{cta}</Link>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-xl font-bold">{w.nextTitle}</h2>
        <ol className="mt-4 space-y-3 border-l-2 border-reef pl-5">
          {w.next.map(([when, what]) => (
            <li key={when}>
              <p className="text-sm font-bold text-navy">{when}</p>
              <p className="text-sm text-slate-600">{what}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-2xl bg-sand p-5">
          <h2 className="font-bold">{w.keyTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{w.keyBody}</p>
          <Link href="/settings/ai" className="btn-outline mt-3 !py-2">{w.keyCta}</Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">{w.contact}</p>
      </section>
    </div>
  );
}
