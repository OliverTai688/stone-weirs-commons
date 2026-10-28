import { Suspense } from "react";
import { AskBox } from "@/components/ask/AskBox";
import { demoQuestions } from "@/data/xinwu";
import { dataKey } from "@/i18n/config";
import { getDict } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getDict();
  return { title: t.nav.tool2 };
}

export default async function AskPage(props: PageProps<"/[lang]/ask">) {
  const { t, lang } = await getDict();
  return (
    <div className="container-page max-w-4xl py-10">
      <p className="eyebrow">{t.ask.eyebrow}</p>
      <h1 className="mt-1 text-3xl font-bold">{t.ask.title}</h1>
      <p className="mt-2 text-slate-600">{t.ask.sub}</p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-slate-400">{t.common.loading}</p>}>
          <AskInner {...props} suggestions={demoQuestions[dataKey(lang)]} />
        </Suspense>
      </div>
    </div>
  );
}

async function AskInner({ searchParams, suggestions }: PageProps<"/[lang]/ask"> & { suggestions: string[] }) {
  const sp = await searchParams;
  const node = typeof sp.node === "string" ? sp.node : "xinwu";
  const q = typeof sp.q === "string" ? sp.q : "";
  return <AskBox suggestions={suggestions} nodeSlug={node} initialQ={q} />;
}
