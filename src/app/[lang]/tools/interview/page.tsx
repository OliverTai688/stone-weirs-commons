import { InterviewTool } from "@/components/interview/InterviewTool";
import { getDict } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getDict();
  return { title: t.nav.tool1 };
}

export default async function InterviewPage() {
  const { t } = await getDict();
  return (
    <div className="container-page py-8">
      <p className="eyebrow">{t.interview.eyebrow}</p>
      <h1 className="mt-1 text-3xl font-bold">{t.interview.title}</h1>
      <p className="mt-2 max-w-3xl text-slate-600">{t.interview.sub}</p>
      <div className="mt-6"><InterviewTool /></div>
    </div>
  );
}
