"use client";

import { useEffect, useState } from "react";
import { useApi, useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";

type Provider = "anthropic" | "openai";
interface Settings {
  encryptionReady?: boolean;
  preferred: Provider | null;
  providers: Partial<Record<Provider, { last4: string; model: string; addedAt: string }>>;
}

const META: Record<Provider, { name: string; prefix: string; console: string; hint: string }> = {
  anthropic: { name: "Anthropic (Claude)", prefix: "sk-ant-", console: "https://console.anthropic.com/settings/keys", hint: "sk-ant-..." },
  openai: { name: "OpenAI (GPT)", prefix: "sk-", console: "https://platform.openai.com/api-keys", hint: "sk-..." },
};

function useJsonApi() {
  const api = useApi();
  const { t } = useI18n();
  return async (path: string, method: string, body?: unknown) => {
    const res = await api(path, { method, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? t.ai.error);
    return data;
  };
}

export function AiSettings() {
  const { t } = useI18n();
  const ai = t.ai;
  const call = useJsonApi();
  const [s, setS] = useState<Settings | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    call("/api/settings/ai", "GET").then(setS).catch((e) => setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, []);

  if (err) return <p className="text-sm text-red-600">{err}</p>;
  if (!s) return <p className="text-sm text-slate-400">{t.common.loading}</p>;

  const configured = (Object.keys(s.providers) as Provider[]).filter((p) => s.providers[p]);

  return (
    <div className="space-y-6">
      {s.encryptionReady === false && <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{ai.noEncryption}</div>}

      <div className="card">
        <p className="text-sm font-bold">{ai.current}</p>
        {configured.length ? (
          <div className="mt-3 flex flex-wrap gap-3">
            {configured.map((p) => (
              <label key={p} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm ${s.preferred === p ? "border-tide bg-foam" : "border-slate-200"}`}>
                <input type="radio" name="preferred" checked={s.preferred === p} onChange={async () => setS({ ...s, ...(await call("/api/settings/ai", "PATCH", { preferred: p })) })} />
                {META[p].name}・{s.providers[p]?.model}
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">{ai.none}</p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {(["anthropic", "openai"] as Provider[]).map((p) => (
          <ProviderCard key={p} provider={p} current={s.providers[p]} disabled={s.encryptionReady === false} onChange={(n) => setS({ ...s, ...n })} />
        ))}
      </div>

      <div className="rounded-2xl bg-sand p-5 text-sm leading-relaxed text-slate-700">
        <p className="font-bold text-ink">{ai.protectTitle}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">{ai.protect.map((x) => <li key={x}>{x}</li>)}</ul>
        <p className="mt-3 text-xs text-slate-500">{ai.protectNote}</p>
      </div>
    </div>
  );
}

function ProviderCard({ provider, current, disabled, onChange }: { provider: Provider; current?: { last4: string; model: string; addedAt: string }; disabled: boolean; onChange: (s: Settings) => void }) {
  const { t } = useI18n();
  const ai = t.ai;
  const call = useJsonApi();
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
      const r = await call("/api/settings/ai/models", "POST", { provider, apiKey: useStored ? undefined : key.trim() });
      setModels(r.models);
      if (!r.models.length) setMsg({ ok: false, text: ai.noModels });
      else {
        setModel((cur) => (r.models.some((x: { id: string }) => x.id === cur) ? cur : r.models[0].id));
        setMsg({ ok: true, text: fmt(ai.validOk, { n: r.models.length }) });
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
      onChange(await call("/api/settings/ai", "PUT", { provider, apiKey: key.trim(), model }));
      setKey("");
      setModels([]);
      setEditing(false);
      setMsg({ ok: true, text: ai.saved });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function saveModel(next: string) {
    setModel(next);
    onChange(await call("/api/settings/ai", "PATCH", { provider, model: next }));
    setMsg({ ok: true, text: ai.modelUpdated });
  }

  async function remove() {
    onChange(await call(`/api/settings/ai?provider=${provider}`, "DELETE"));
    setEditing(true);
    setModels([]);
    setModel("");
    setMsg({ ok: true, text: ai.deleted });
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{m.name}</h2>
        {current ? <span className="chip !bg-emerald-50 !text-emerald-700">{fmt(ai.linked, { last4: current.last4 })}</span> : <span className="chip">{ai.notSet}</span>}
      </div>

      {current && !editing ? (
        <div className="mt-4 space-y-3 text-sm">
          <label className="block">{ai.model}
            {models.length ? (
              <select value={model} onChange={(e) => saveModel(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
                {models.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
              </select>
            ) : (
              <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <span>{current.model}</span>
                <button type="button" onClick={() => loadModels(true)} className="text-xs text-tide hover:underline" disabled={busy}>{busy ? t.common.loading : ai.changeModel}</button>
              </div>
            )}
          </label>
          <p className="text-xs text-slate-500">{fmt(ai.added, { date: current.addedAt })}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className="btn-outline !px-3 !py-1.5 text-xs">{ai.replaceKey}</button>
            <button type="button" onClick={remove} className="btn-outline !px-3 !py-1.5 text-xs !text-red-600">{ai.deleteKey}</button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3 text-sm">
          <label className="block">{ai.apiKey}
            <input type="password" autoComplete="off" spellCheck={false} value={key} onChange={(e) => { setKey(e.target.value); setModels([]); }} placeholder={m.hint} disabled={disabled} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono" />
          </label>
          {key && !key.trim().startsWith(m.prefix) && <p className="text-xs text-amber-700">{fmt(ai.prefixWarn, { name: m.name, prefix: m.prefix })}</p>}
          <p className="text-xs text-slate-500">
            <a href={m.console} target="_blank" rel="noreferrer" className="text-tide underline">{fmt(ai.console, { name: m.name })}</a>
          </p>
          {!models.length ? (
            <button type="button" onClick={() => loadModels()} disabled={busy || disabled || key.trim().length < 20} className="btn-dark w-full !py-2">{busy ? ai.validating : ai.validate}</button>
          ) : (
            <>
              <label className="block">{ai.model}
                <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
                  {models.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                </select>
              </label>
              <button type="button" onClick={save} disabled={busy || !model} className="btn-primary w-full !py-2">{busy ? ai.saving : ai.save}</button>
            </>
          )}
          {current && <button type="button" onClick={() => { setEditing(false); setKey(""); setModels([]); }} className="w-full text-xs text-slate-500 hover:underline">{ai.cancel}</button>}
        </div>
      )}
      {msg && <p className={`mt-3 text-xs ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}
