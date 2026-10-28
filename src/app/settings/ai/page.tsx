import { AiSettings } from "@/components/settings/AiSettings";

export const metadata = { title: "AI 設定", robots: { index: false } };

export default function AiSettingsPage() {
  return (
    <div className="container-page max-w-4xl py-10">
      <p className="eyebrow">設定</p>
      <h1 className="mt-1 text-3xl font-bold">AI 設定：使用你自己的金鑰</h1>
      <p className="mt-2 text-slate-600">
        加入 Anthropic 或 OpenAI 的 API 金鑰後，工具一的 AI 訪談與工具二的問答會改用你選的模型。沒有金鑰也可以使用示範引擎。不論用哪個模型，伺服器都會檢查每個引用是否來自經治理的紀錄。
      </p>
      <div className="mt-8"><AiSettings /></div>
    </div>
  );
}
