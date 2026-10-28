import { AdminContacts } from "@/components/auth/AdminContacts";
import { getDict } from "@/i18n/server";
import { listProfiles } from "@/server/repo";

export async function generateMetadata() {
  const { t } = await getDict();
  return { title: t.admin.title, robots: { index: false } };
}

export default async function AdminPage() {
  const [{ t }, seed] = await Promise.all([getDict(), listProfiles()]);
  return (
    <div className="container-page py-10">
      <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{t.admin.banner}</div>
      <p className="eyebrow">{t.admin.eyebrow}</p>
      <h1 className="mt-1 text-3xl font-bold">{t.admin.title}</h1>
      <p className="mt-2 text-sm text-slate-600">{t.admin.sub}</p>
      <div className="mt-6"><AdminContacts seed={seed} /></div>
    </div>
  );
}
