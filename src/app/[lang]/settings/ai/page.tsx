import { AiSettings } from "@/components/settings/AiSettings";
import { getDict } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getDict();
  return { title: t.nav.ai, robots: { index: false } };
}

export default async function AiSettingsPage() {
  const { t } = await getDict();
  return (
    <div className="container-page max-w-4xl py-10">
      <p className="eyebrow">{t.ai.eyebrow}</p>
      <h1 className="mt-1 text-3xl font-bold">{t.ai.title}</h1>
      <p className="mt-2 text-slate-600">{t.ai.sub}</p>
      <div className="mt-8"><AiSettings /></div>
    </div>
  );
}
