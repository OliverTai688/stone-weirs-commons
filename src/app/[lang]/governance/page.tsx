import { getDict } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getDict();
  return { title: t.nav.governance };
}

export default async function GovernancePage() {
  const { t } = await getDict();
  const g = t.governance;
  return (
    <div className="container-page max-w-3xl py-12">
      <p className="eyebrow">{g.eyebrow}</p>
      <h1 className="mt-1 text-3xl font-bold">{g.title}</h1>
      <p className="mt-3 text-slate-600">{g.sub}</p>
      <dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200">
        {g.rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-4 md:grid-cols-[180px_1fr]">
            <dt className="font-bold text-navy">{k}</dt>
            <dd className="text-sm text-slate-700">{v}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-10 text-xl font-bold">{g.personalTitle}</h2>
      <p className="mt-2 text-sm text-slate-700">{g.personal}</p>
    </div>
  );
}
