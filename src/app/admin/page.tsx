import { AdminContacts } from "@/components/auth/AdminContacts";
import { listProfiles } from "@/server/repo";

export const metadata = { title: "後台：研究者名單", robots: { index: false } };

export default async function AdminPage() {
  const seed = await listProfiles();
  return (
    <div className="container-page py-10">
      <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        示範模式：目前沒有登入保護，名單是假資料加上你在這個瀏覽器填過的加入表單。接上 Supabase 與 Google 登入後，這頁只有管理員能看，資料改從資料庫讀取。
      </div>
      <p className="eyebrow">後台</p>
      <h1 className="mt-1 text-3xl font-bold">研究者聯絡名單</h1>
      <p className="mt-2 text-sm text-slate-600">預設只顯示並匯出同意接收後續聯絡的人；未同意者的 Email 會遮罩。</p>
      <div className="mt-6"><AdminContacts seed={seed} /></div>
    </div>
  );
}
