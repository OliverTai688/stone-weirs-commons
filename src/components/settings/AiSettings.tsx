"use client";

import { useEffect, useState } from "react";

type Provider = "anthropic" | "openai";
interface Settings {
  encryptionReady?: boolean;
  preferred: Provider | null;
  providers: Partial<Record<Provider, { last4: string; model: string; addedAt: string }>>;
}

const META: Record<Provider, { name: string; prefix: string; console: string; hint: string }> = {
  anthropic: { name: "Anthropic（Claude）", prefix: "sk-ant-", console: "https://console.anthropic.com/settings/keys", hint: "sk-ant-..." },
  openai: { name: "OpenAI（GPT）", prefix: "sk-", console: "https://platform.openai.com/api-keys", hint: "sk-..." },
};

async function api(path: string, method: string, body?: unknown) {
  const res = await fetch(path, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "發生錯誤");
  return data;
}

export function AiSettings() {
  const [s, setS] = useState<Settings | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/settings/ai", "GET").then(setS).catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="text-sm text-red-600">{err}</p>;
  if (!s) return <p className="text-sm text-slate-400">載入中…</p>;

  const configured = (Object.keys(s.providers) as Provider[]).filter((p) => s.providers[p]);

  return (
    <div className="space-y-6">
      {s.encryptionReady === false && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          伺服器尚未設定加密金鑰（APP_ENCRYPTION_KEY），目前無法儲存 API 金鑰。請管理員先完成設定。
        </div>
      )}

      <div className="card">
        <p className="text-sm font-bold">目前使用的 AI</p>
        {configured.length ? (
          <div className="mt-3 flex flex-wrap gap-3">
            {configured.map((p) => (
              <label key={p} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm ${s.preferred === p ? "border-tide bg-foam" : "border-slate-200"}`}>
                <input type="radio" name="preferred" checked={s.preferred === p} onChange={async () => setS({ ...s, ...(await api("/api/settings/ai", "PATCH", { preferred: p })) })} />
                {META[p].name}・{s.providers[p]?.model}
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">還沒有加入金鑰。工具一的訪談與工具二的問答會使用不呼叫外部 AI 的示範引擎。</p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {(["anthropic", "openai"] as Provider[]).map((p) => (
          <ProviderCard key={p} provider={p} current={s.providers[p]} disabled={s.encryptionReady === false} onChange={(n) => setS({ ...s, ...n })} />
        ))}
      </div>

      <div className="rounded-2xl bg-sand p-5 text-sm leading-relaxed text-slate-700">
        <p className="font-bold text-ink">你的金鑰如何被保護</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>金鑰用 AES-256-GCM 加密後才儲存，只有伺服器能解密；網頁上只會顯示最後 4 碼。</li>
          <li>所有 AI 呼叫都由我們的伺服器代為發出（BFF），金鑰不會傳到瀏覽器，也不會寫進任何紀錄。</li>
          <li>只有你自己的工具使用你的金鑰，費用由你的 AI 帳戶計算。建議在供應商後台為這把金鑰設定用量上限。</li>
          <li>你可以隨時刪除金鑰；刪除後立即失效。</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">示範階段：金鑰以加密方式綁定在這個瀏覽器。接上會員系統後，會改存到你的帳號，換裝置也能使用。</p>
      </div>
    </div>
  );
}

function ProviderCard({ provider, current, disabled, onChange }: { provider: Provider; current?: { last4: string; model: string; addedAt: string }; disabled: boolean; onChange: (s: Settings) => void }) {
  const m = META[provider];
  const [editing, setEditing] = useState(!current);
  const [key, setKey] = useState("");
  const [models, setModels] = useState<{ id: string; label: string }[]>([]);
  const [model, setModel] = useState(current?.model ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function loadModels(useStored = false) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await api("/api/settings/ai/models", "POST", { provider, apiKey: useStored ? undefined : key.trim() });
      setModels(r.models);
      if (!r.models.length) setMsg({ ok: false, text: "這把金鑰目前沒有可用的對話模型。" });
      else {
        setModel((cur) => (r.models.some((x: { id: string }) => x.id === cur) ? cur : r.models[0].id));
        setMsg({ ok: true, text: `金鑰有效，找到 ${r.models.length} 個模型。` });
      }
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await api("/api/settings/ai", "PUT", { provider, apiKey: key.trim(), model });
      onChange(r);
      setKey("");
      setModels([]);
      setEditing(false);
      setMsg({ ok: true, text: "已儲存。" });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function saveModel(next: string) {
    setModel(next);
    onChange(await api("/api/settings/ai", "PATCH", { provider, model: next }));
    setMsg({ ok: true, text: "模型已更新。" });
  }

  async function remove() {
    onChange(await api(`/api/settings/ai?provider=${provider}`, "DELETE"));
    setEditing(true);
    setModels([]);
    setModel("");
    setMsg({ ok: true, text: "金鑰已刪除。" });
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{m.name}</h2>
        {current ? <span className="chip !bg-emerald-50 !text-emerald-700">已連結 •••• {current.last4}</span> : <span className="chip">未設定</span>}
      </div>

      {current && !editing ? (
        <div className="mt-4 space-y-3 text-sm">
          <label className="block">模型
            {models.length ? (
              <select value={model} onChange={(e) => saveModel(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
                {models.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
              </select>
            ) : (
              <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <span>{current.model}</span>
                <button type="button" onClick={() => loadModels(true)} className="text-xs text-tide hover:underline" disabled={busy}>{busy ? "載入中…" : "更換模型"}</button>
              </div>
            )}
          </label>
          <p className="text-xs text-slate-500">加入日期 {current.addedAt}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className="btn-outline !px-3 !py-1.5 text-xs">更換金鑰</button>
            <button type="button" onClick={remove} className="btn-outline !px-3 !py-1.5 text-xs !text-red-600">刪除金鑰</button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3 text-sm">
          <label className="block">API 金鑰
            <input type="password" autoComplete="off" spellCheck={false} value={key} onChange={(e) => { setKey(e.target.value); setModels([]); }} placeholder={m.hint} disabled={disabled} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono" />
          </label>
          {key && !key.trim().startsWith(m.prefix) && <p className="text-xs text-amber-700">{m.name} 的金鑰通常以「{m.prefix}」開頭，請確認是否貼錯。</p>}
          <p className="text-xs text-slate-500">到 <a href={m.console} target="_blank" rel="noreferrer" className="text-tide underline">{m.name} 後台</a> 建立金鑰。</p>
          {!models.length ? (
            <button type="button" onClick={() => loadModels()} disabled={busy || disabled || key.trim().length < 20} className="btn-dark w-full !py-2">{busy ? "驗證中…" : "驗證金鑰並載入模型"}</button>
          ) : (
            <>
              <label className="block">模型
                <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
                  {models.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                </select>
              </label>
              <button type="button" onClick={save} disabled={busy || !model} className="btn-primary w-full !py-2">{busy ? "儲存中…" : "儲存"}</button>
            </>
          )}
          {current && <button type="button" onClick={() => { setEditing(false); setKey(""); setModels([]); }} className="w-full text-xs text-slate-500 hover:underline">取消</button>}
        </div>
      )}
      {msg && <p className={`mt-3 text-xs ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}
