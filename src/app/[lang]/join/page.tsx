import { Suspense } from "react";
import { JoinForm } from "@/components/auth/JoinForm";
import { getDict } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getDict();
  return { title: t.nav.join };
}

export default async function JoinPage(props: PageProps<"/[lang]/join">) {
  const { t } = await getDict();
  const j = t.join;
  return (
    <div className="container-page grid max-w-5xl gap-10 py-12 md:grid-cols-2">
      <div>
        <p className="eyebrow">{j.eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold">{j.title}</h1>
        <ul className="mt-6 space-y-3 text-slate-700">
          {j.perks.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <p className="mt-6 text-sm text-slate-500">{j.note}</p>
      </div>
      <div className="card !p-6">
        <Suspense fallback={<p className="text-slate-400">{t.common.loading}</p>}>
          <JoinInner {...props} />
        </Suspense>
      </div>
    </div>
  );
}

async function JoinInner({ searchParams }: PageProps<"/[lang]/join">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/welcome";
  const source = typeof sp.utm_source === "string" ? sp.utm_source : "direct";
  return <JoinForm next={next} source={source} />;
}
