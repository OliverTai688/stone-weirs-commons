export const metadata = { title: "資料治理" };

const rows = [
  ["FAIR", "可找到、可存取、可互通、可重用：每筆紀錄都有標準化的中繼資料。"],
  ["CARE", "集體利益、控制權、責任與倫理：社群對自己的知識有主導權。"],
  ["FPIC", "自由、事先、知情同意：每筆紀錄記錄同意狀態（已取得／推定／待取得／已撤回）。"],
  ["地理隱私三級", "公開（行政區）、概略（村鎮）、限制（精確座標，永不公開）。"],
  ["PROV-O 溯源", "每筆紀錄都能追溯：誰提供、如何產生、源自哪份資料。"],
];

export default function GovernancePage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <p className="eyebrow">治理先於生成</p>
      <h1 className="mt-1 text-3xl font-bold">我們如何對待你的資料</h1>
      <p className="mt-3 text-slate-600">AI 只能使用經過治理、審核通過、且不是限制級位置的紀錄。每個在地節點自己決定審查規則與授權，平台不編輯節點內容。</p>
      <dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-4 md:grid-cols-[160px_1fr]">
            <dt className="font-bold text-navy">{k}</dt>
            <dd className="text-sm text-slate-700">{v}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-10 text-xl font-bold">你的個人資料</h2>
      <p className="mt-2 text-sm text-slate-700">我們只收集姓名、Email、身分與國家，用於登入、通知與研究交流。「同意註冊」與「同意接收後續聯絡」分開勾選。你可以隨時修改、取消聯絡或刪除帳號。完整隱私權政策將於正式上線前經所屬單位確認後公布。</p>
    </div>
  );
}
