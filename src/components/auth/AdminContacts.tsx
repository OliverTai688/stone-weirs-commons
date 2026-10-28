"use client";

import { useEffect, useMemo, useState } from "react";
import type { Profile } from "@/lib/types";

const personaZh: Record<Profile["persona"], string> = { researcher: "研究者", museum: "博物館／管理", community: "社區", student: "學生", other: "其他" };

export function AdminContacts({ seed }: { seed: Profile[] }) {
  const [local, setLocal] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [onlyConsent, setOnlyConsent] = useState(true);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- demo data lives in browser storage
      setLocal(JSON.parse(localStorage.getItem("demo_profiles") ?? "[]"));
    } catch {}
  }, []);

  const all = useMemo(() => [...local, ...seed], [local, seed]);
  const rows = all.filter((p) => (!onlyConsent || p.contactConsent) && (!country || p.country === country) && (!q || `${p.fullName}${p.email}${p.organization ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  const countries = [...new Set(all.map((p) => p.country))];

  function exportCsv() {
    const head = ["姓名", "Email", "身分", "國家", "機構", "同意聯絡", "來源", "註冊日期"];
    const lines = rows.map((p) => [p.fullName, p.email, personaZh[p.persona], p.country, p.organization ?? "", p.contactConsent ? "是" : "否", p.signupSource, p.createdAt].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob(["﻿" + [head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    // TODO(supabase): write an audit_logs row for every export.
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["會員總數", all.length],
          ["同意聯絡", all.filter((p) => p.contactConsent).length],
          ["國家／地區", countries.length],
          ["來自 APCONF", all.filter((p) => p.signupSource === "apconf2026").length],
        ].map(([k, v]) => (
          <div key={k} className="card"><p className="text-xs text-slate-500">{k}</p><p className="mt-1 text-2xl font-bold text-navy">{v}</p></div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋姓名、Email、機構" className="rounded-full border border-slate-300 px-4 py-2 text-sm" />
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-full border border-slate-300 px-3 py-2 text-sm">
          <option value="">所有國家</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={onlyConsent} onChange={(e) => setOnlyConsent(e.target.checked)} />只顯示同意聯絡者</label>
        <button type="button" onClick={exportCsv} className="btn-dark ml-auto !py-2">匯出 CSV（{rows.length}）</button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-navy text-white">
            <tr>{["姓名", "Email", "身分", "國家", "機構", "同意聯絡", "來源", "註冊日期", "標籤"].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.id} className={i % 2 ? "bg-slate-50" : ""}>
                <td className="px-3 py-2 font-medium">{p.fullName}</td>
                <td className="px-3 py-2">{p.contactConsent ? p.email : p.email.replace(/^(.).*(@.*)$/, "$1•••$2")}</td>
                <td className="px-3 py-2">{personaZh[p.persona]}</td>
                <td className="px-3 py-2">{p.country}</td>
                <td className="px-3 py-2">{p.organization ?? "—"}</td>
                <td className="px-3 py-2">{p.contactConsent ? <span className="text-emerald-700">● 是</span> : <span className="text-slate-400">○ 否</span>}</td>
                <td className="px-3 py-2">{p.signupSource}</td>
                <td className="px-3 py-2">{p.createdAt}</td>
                <td className="px-3 py-2">{(p.tags ?? []).map((t) => <span key={t} className="chip mr-1">{t}</span>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
