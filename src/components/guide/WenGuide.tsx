"use client";

/**
 * 石塭問答 (Ask Wen) — Tool 2's guided exhibit experience, ported from the team's standalone
 * prototype. Markup and behaviour are kept as in the prototype; differences:
 *  - scoped under .wen (no global styles), system fonts instead of a web-font download,
 *  - the start veil is a quick guide explaining how Tool 2 works,
 *  - the source seal links to the record on the concept map,
 *  - audio served from /audio/xinwu, everything stops when the page is left.
 */
import { useEffect, useRef } from "react";
import "./wen.css";
import { HAK, Q, T, TONES } from "./wenContent";
import { QG } from "./wenQuick";

type GuideLang = "zh" | "en" | "hak";

const markup = (lang: "zh" | "en") => {
  const g = QG[lang];
  return `
<div class="veil" id="wen-veil">
  <div>
    <h1 id="wen-qgTitle">${g.title}</h1>
    <p class="lede" id="wen-veilP">${g.lede}</p>
    <p class="who" style="margin-top:18px" id="wen-qgHow">${g.how}</p>
    <ol class="qg" id="wen-qg">${g.steps.map(([b, s], i) => `<li><span class="n">${i + 1}</span><div><b>${b}</b><span>${s}</span></div></li>`).join("")}</ol>
    <div class="langs" role="radiogroup" aria-label="語言 Language" data-group="lang">
      <button class="opt" role="radio" data-v="zh" aria-checked="true">中文</button>
      <button class="opt" role="radio" data-v="en" aria-checked="false" tabindex="-1">English</button>
      <button class="opt" role="radio" data-v="hak" aria-checked="false" tabindex="-1">客語</button>
    </div>
    <button class="go" id="wen-go">${g.go}</button>
    <p class="soundnote" id="wen-soundnote">${g.sound}</p>
  </div>
</div>
<div class="page">
  <header class="top">
    <p class="name">小塭 <small id="wen-tagline"></small></p>
    <div class="settings">
      <div role="radiogroup" aria-label="語言 Language" data-group="lang" style="display:flex">
        <button class="opt" role="radio" data-v="zh" aria-checked="true">中文</button>
        <button class="opt" role="radio" data-v="en" aria-checked="false" tabindex="-1">English</button>
        <button class="opt" role="radio" data-v="hak" aria-checked="false" tabindex="-1">客語</button>
      </div>
      <span class="sep" aria-hidden="true"></span>
      <div role="radiogroup" aria-label="客語腔調" id="wen-accGroup" style="display:flex" hidden>
        <button class="opt" role="radio" data-a="sixian" aria-checked="true">四縣</button>
        <button class="opt" role="radio" data-a="hailu" aria-checked="false" tabindex="-1">海陸</button>
      </div>
      <button class="opt" id="wen-optPin" aria-pressed="true" hidden></button>
      <button class="opt" id="wen-optBig" aria-pressed="false"></button>
      <button class="opt" id="wen-optSound" aria-pressed="true"></button>
      <button class="opt" id="wen-optHow"></button>
    </div>
  </header>
  <div class="stage">
    <button class="sprite" id="wen-sprite" aria-label="小塭">
      <svg viewBox="0 0 150 160" aria-hidden="true">
        <circle class="ripple" cx="75" cy="92" r="70" fill="none" stroke="#0e6e6a" stroke-width="2"/>
        <circle class="ripple r2" cx="75" cy="92" r="70" fill="none" stroke="#0e6e6a" stroke-width="1.5"/>
        <g id="wen-body">
          <path d="M75 30 C75 14 92 10 96 22 C99 31 88 34 85 27" fill="none" stroke="#0e6e6a" stroke-width="4" stroke-linecap="round"/>
          <circle cx="85" cy="27" r="4" fill="#0e6e6a"/>
          <path d="M18 98 C14 56 44 32 78 32 C114 32 138 58 132 100 C128 134 104 148 74 148 C42 148 21 132 18 98 Z" fill="#9aa8a6"/>
          <path d="M34 74 C40 56 56 46 72 44" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"/>
          <circle cx="112" cy="122" r="3" fill="#5d6b6b"/><circle cx="102" cy="132" r="2" fill="#5d6b6b"/><circle cx="38" cy="120" r="2.5" fill="#5d6b6b"/>
          <ellipse class="eye" cx="58" cy="88" rx="6" ry="8" fill="#1d2b2a"/><ellipse class="eye" cx="96" cy="88" rx="6" ry="8" fill="#1d2b2a"/>
          <circle cx="47" cy="104" r="6" fill="#e9a99a" opacity=".7"/><circle cx="107" cy="104" r="6" fill="#e9a99a" opacity=".7"/>
          <ellipse id="wen-mouth" cx="77" cy="108" rx="8" ry="3" fill="#1d2b2a"/>
          <path d="M20 128 Q35 122 50 128 T80 128 T110 128 T134 126" fill="none" stroke="#0e6e6a" stroke-width="3" stroke-linecap="round"/>
        </g>
      </svg>
    </button>
    <ul class="asks" id="wen-asks"></ul>
  </div>
  <section class="bottom" aria-label="字幕 Subtitles">
    <div class="subs" id="wen-subs" aria-live="polite"></div>
    <div class="ctrl" id="wen-ctrl"></div>
    <button class="mic" id="wen-mic"><span class="dot" aria-hidden="true">●</span><span class="t"><b id="wen-micB"></b><span id="wen-micS"></span></span></button>
    <p class="foot" id="wen-foot"></p>
  </section>
</div>`;
};

export function WenGuide({ siteLang, nodeSlug = "xinwu" }: { siteLang: "zh" | "en"; nodeSlug?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const root: HTMLDivElement = el;
    const $ = <E extends HTMLElement = HTMLElement>(s: string) => root.querySelector(s) as E;
    const $$ = <E extends HTMLElement = HTMLElement>(s: string) => Array.from(root.querySelectorAll(s)) as E[];
    let disposed = false;

    /* ---------- state + helpers (as in the prototype) ---------- */
    let ACC: "sixian" | "hailu" = "sixian";
    const H = () => HAK[ACC];
    const HAK_AUDIO = (part: string) => `/audio/xinwu/hak/${ACC}/${part}.mp3`;
    const ELDER_AUDIO = ["/audio/xinwu/elder/line1.mp3", "/audio/xinwu/elder/line2.mp3"];
    let L: GuideLang = siteLang;
    let sound = true, pin = true, run = 0, hakNoted = false;
    let active: { id: object; cancel: () => void } | null = null;
    let current: { kind: string; i?: number } | null = null;
    const heard = new Set<string>();
    const t = (k: string) => T[L === "hak" ? "zh" : L][k];
    const v = (o: Record<string, string>) => o[L === "hak" ? "zh" : L];
    const qg = () => QG[L === "en" ? "en" : "zh"];
    const fmt = (s: string, wrong: string, right: string) => s.replace(/\[\[(.+?)\]\]/g, wrong).replace(/\{\{(.+?)\}\}/g, right);
    const plain = (s: string) => s.replace(/\[\[|\]\]|\{\{|\}\}/g, "");
    const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
    function rubyLine(tokens: [string, string, string?][]) {
      let out = "", cur: string | null = null, buf = "";
      const flush = () => { if (buf) out += cur === "x" ? `<span class="strike">${buf}</span>` : cur === "ok" ? `<strong>${buf}</strong>` : buf; buf = ""; };
      for (const [h, p, m] of tokens) { const inner = p ? `<ruby>${esc(h)}<rt>${esc(p)}</rt></ruby>` : esc(h); if ((m || null) !== cur) { flush(); cur = m || null; } buf += inner; }
      flush(); return out;
    }

    const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
    function voice() {
      const vs = synth ? synth.getVoices() : [];
      const pref = L === "en" ? ["en-US", "en-GB", "en"] : ["zh-TW", "zh-HK", "zh-CN", "zh"];
      for (const p of pref) { const x = vs.find((z) => z.lang && z.lang.replace("_", "-").startsWith(p)); if (x) return x; }
      return null;
    }
    const talk = (on: boolean) => $("#wen-sprite").classList.toggle("talk", on);
    function perform(text: string, src?: string | null) {
      return new Promise<void>((resolve) => {
        let done = false, timer: ReturnType<typeof setTimeout> | undefined, audio: HTMLAudioElement | null = null;
        const est = Math.min(10000, 1200 + text.length * (L === "en" ? 60 : 210));
        const me = {};
        const fin = () => { if (done) return; done = true; clearTimeout(timer); talk(false); if (audio) { try { audio.pause(); } catch {} } if (active && active.id === me) active = null; resolve(); };
        active = { id: me, cancel: () => { try { synth?.cancel(); } catch {} fin(); } };
        const quiet = () => { talk(sound); timer = setTimeout(fin, est); };
        const tts = () => {
          if (!sound || !synth) { quiet(); return; }
          try {
            if (synth.speaking || synth.pending) synth.cancel();
            const vo = voice(); const u = new SpeechSynthesisUtterance(text);
            if (vo) u.voice = vo; u.lang = vo ? vo.lang : L === "en" ? "en-US" : "zh-TW"; u.rate = L === "en" ? 1 : 0.95; u.volume = 1;
            let started = false;
            u.onstart = () => { started = true; talk(true); }; u.onend = fin; u.onerror = () => { if (!started) noVoiceNote(); fin(); };
            synth.speak(u); if (synth.paused) synth.resume();
            talk(true);
            setTimeout(() => { if (!started && !done && !synth.speaking) noVoiceNote(); }, 2500);
            timer = setTimeout(fin, est + 6000);
          } catch { quiet(); }
        };
        if (!sound) { quiet(); return; }
        if (src) { audio = new Audio(src); audio.onended = fin; audio.onerror = () => { audio = null; tts(); }; talk(true); audio.play().catch(() => { if (!done && audio) { audio = null; tts(); } }); return; }
        tts();
      });
    }
    let noVoiceShown = false;
    function noVoiceNote() { if (noVoiceShown) return; noVoiceShown = true; const n = document.createElement("p"); n.className = "note"; n.textContent = t("noVoice"); $("#wen-subs").prepend(n); }
    function stop() { run++; if (active) { const a = active; active = null; a.cancel(); } talk(false); if (!disposed) renderCtrl(false); }

    function sub(cls: string, html: string) {
      const s = $("#wen-subs");
      s.querySelectorAll(".sub.now").forEach((p) => { p.classList.remove("now"); p.classList.add("old"); });
      const p = document.createElement("p"); p.className = "sub now " + cls; p.innerHTML = html;
      p.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a")) return; if (p.classList.contains("now") && active) active.cancel(); });
      s.appendChild(p); while (s.querySelectorAll(".sub").length > 3) s.querySelector(".sub")?.remove(); return p;
    }
    const clearSubs = () => { $("#wen-subs").innerHTML = ""; };
    function hakNote(ai: boolean) { if (L !== "hak" || hakNoted) return; hakNoted = true; const n = document.createElement("p"); n.className = "note"; n.textContent = t(ai ? "hakAI" : "hakNote"); $("#wen-subs").prepend(n); }

    async function line(my: number, o: { cls?: string; who?: string; zhHtml: string; speak: string; hakTokens?: [string, string, string?][]; hakAudio?: string; trans?: boolean; after?: string }) {
      const { cls = "", who = "", zhHtml, speak, hakTokens, hakAudio, trans = true, after = "" } = o;
      if (my !== run) return false;
      let html;
      if (L === "hak" && hakTokens) {
        hakNote(true);
        html = `${who ? `<span class="who">${who}（${t("acc")[ACC]}）</span>` : ""}${rubyLine(hakTokens)}${trans ? `<span class="trans">${zhHtml}</span>` : ""}`;
      } else {
        if (L === "hak") hakNote(false);
        html = `${who ? `<span class="who">${who}</span>` : ""}${zhHtml}`;
      }
      const p = sub(cls, html + after);
      await perform(speak, L === "hak" ? hakAudio : null);
      return my === run ? p : false;
    }

    /* ---------- flows ---------- */
    async function ask(i: number) {
      stop(); const my = run; const q = Q[i]; current = { kind: "q", i }; hakNoted = false;
      markAsks(i); clearSubs(); renderCtrl(true);
      if (!(await line(my, { zhHtml: t("lead"), speak: t("lead"), hakTokens: H().lead, hakAudio: HAK_AUDIO("lead"), trans: false }))) return;
      const b = await line(my, { cls: "base", who: t("baseWho"), zhHtml: fmt(v(q.base), '<span class="strike">$1</span>', "$1"), speak: plain(v(q.base)), hakTokens: H()[q.id].base, hakAudio: HAK_AUDIO(q.id + "-base") });
      if (!b) return; b.classList.add("struck");
      if (!(await line(my, { zhHtml: t("flag"), speak: t("flag"), hakTokens: H().flag, hakAudio: HAK_AUDIO("flag"), trans: false }))) return;
      const href = `/${siteLang}/nodes/${nodeSlug}/graph#${q.rec}`;
      const seal = `<a class="seal" href="${href}" aria-label="${t("src")} ${q.rec}">${t("src")}<br>${q.rec}</a>`;
      try { navigator.vibrate?.(16); } catch {}
      if (!(await line(my, { cls: "gov", who: t("govWho"), zhHtml: fmt(v(q.gov), "$1", "<strong>$1</strong>"), speak: plain(v(q.gov)), hakTokens: H()[q.id].gov, hakAudio: HAK_AUDIO(q.id + "-gov"), after: seal }))) return;
      heard.add(q.id); renderAsks(); renderCtrl(false);
      if (heard.size === 3) { await new Promise((r) => setTimeout(r, 600)); if (my === run) { sub("", `<span class="who">${t("wen")}</span>${t("allDone")}`); renderCtrl(false); } }
    }
    async function elder() {
      stop(); const my = run; current = { kind: "elder" }; hakNoted = false; clearSubs(); markAsks(-1); renderCtrl(true);
      if (!(await line(my, { zhHtml: t("elderLead"), speak: t("elderLead"), trans: false }))) return;
      for (let k = 0; k < 2; k++) {
        if (my !== run) return;
        const txt = t("elderLines")[k], tok = HAK.elder[k];
        const p = sub("elder", `<span class="who">${t("elderWho")}</span>${tok ? rubyLine(tok) + `<span class="trans">${txt}</span>` : txt}`);
        await new Promise<void>((res) => {
          const a = new Audio(ELDER_AUDIO[k]); let d = false; const me = {};
          const f = () => { if (d) return; d = true; talk(false); if (active && active.id === me) active = null; res(); };
          active = { id: me, cancel: () => { try { a.pause(); } catch {} f(); } };
          a.onended = f;
          a.onerror = () => { const n = document.createElement("span"); n.className = "trans"; n.textContent = t("elderMissing"); p.appendChild(n); setTimeout(f, 1800); };
          if (!sound) { setTimeout(f, 2200); return; }
          talk(true); a.play().catch(() => talk(false));
        });
      }
      if (my === run) renderCtrl(false);
    }
    async function results() {
      stop(); const my = run; current = { kind: "results" }; clearSubs(); markAsks(-1); renderCtrl(true);
      sub("", `${t("resLead")}<span class="big-num"><span class="r"><b>15</b>${t("resR")}</span><span class="g"><b>0</b>${t("resG")}</span></span>`);
      await perform(t("resSay")); if (my === run) renderCtrl(false);
    }
    async function full() {
      stop(); const my = run; current = { kind: "full" }; clearSubs(); markAsks(-1); renderCtrl(true);
      const p = sub("", t("fullLead"));
      p.insertAdjacentHTML("beforeend", `<ul class="list">${t("fullList").map((x: string) => `<li>${x}</li>`).join("")}</ul><span class="note" style="display:block">${t("contact")}</span><a class="link beckon" href="/${siteLang}/join?intent=pilot" style="display:inline-block">${qg().useIt}</a>`);
      await perform(t("fullLead")); if (my === run) renderCtrl(false);
    }
    function contour(val: string) {
      const y = (d: string) => 30 - (+d - 1) * 6; const ch = val.split("");
      if (ch.length === 1) { const yy = y(ch[0]); return `<svg viewBox="0 0 40 34" aria-hidden="true"><line x1="14" y1="${yy}" x2="26" y2="${yy}" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`; }
      return `<svg viewBox="0 0 40 34" aria-hidden="true"><polyline points="6,${y(ch[0])} 34,${y(ch[1])}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
    }
    const toneRow = (a: string) => `<span class="acc ${a === "hailu" ? "h" : ""}">${t("acc")[a]}</span><ol aria-label="${t("acc")[a]}">${TONES[a].map(([k, val]) => `<li style="color:${a === "hailu" ? "var(--rust)" : "var(--teal)"}">${contour(val)}<b>${val}</b>${t("tn")[k]}</li>`).join("")}</ol>`;
    async function tones() {
      stop(); const my = run; current = { kind: "tones" }; clearSubs(); markAsks(-1); renderCtrl(true);
      const p = sub("", t("toneLead"));
      p.insertAdjacentHTML("beforeend", `<span class="tones">${toneRow("sixian")}${toneRow("hailu")}</span><span class="note" style="display:block;margin-top:8px">${t("toneNote")} ${t("toneTry")}</span>`);
      await perform(t("toneSay")); if (my === run) renderCtrl(false);
    }
    function replay() { if (!current) return; const c = current; ({ q: () => ask(c.i as number), elder, results, full, tones } as Record<string, () => void>)[c.kind](); }
    function greet() { stop(); clearSubs(); current = null; markAsks(-1); sub("", `<span class="who">${t("wen")}</span>${t("hello")}`); renderCtrl(true); const my = run; perform(t("hello")).then(() => { if (my === run && !disposed) renderCtrl(false); }); }

    /* ---------- render ---------- */
    const markAsks = (i: number) => $$(".ask").forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
    function renderAsks() {
      const pressed = current && current.kind === "q" ? current.i : -1;
      $("#wen-asks").innerHTML = Q.map((q, i) => `<li style="left:${q.pos[0]}%;top:${q.pos[1]}%"><button class="ask" data-i="${i}" aria-pressed="${i === pressed}">${v(q.q)}${heard.has(q.id) ? `<span class="done" aria-label="${t("heard")}">✓</span>` : ""}</button></li>`).join("");
      $$<HTMLButtonElement>("#wen-asks .ask").forEach((b) => (b.onclick = () => ask(+(b.dataset.i as string))));
    }
    function renderCtrl(playing: boolean) {
      const m = t("more"), c = $("#wen-ctrl");
      c.innerHTML = playing
        ? `<button class="link" id="wen-cStop">${t("stop")}</button><span class="note">${t("skipHint")}</span>`
        : `${current ? `<button class="link" id="wen-cReplay">${t("replay")}</button>` : ""}${L === "hak" && current && current.kind === "q" ? `<button class="link beckon" id="wen-cAcc">${t("again").replace("{a}", t("acc")[ACC === "sixian" ? "hailu" : "sixian"])}</button>` : ""}<button class="link" data-k="elder">${m[0]}</button><button class="link" data-k="tones">${m[1]}</button><button class="link" data-k="results">${m[2]}</button><button class="link ${heard.size === 3 ? "beckon" : ""}" data-k="full">${m[3]}</button>`;
      c.querySelector("#wen-cStop")?.addEventListener("click", stop);
      c.querySelector("#wen-cReplay")?.addEventListener("click", replay);
      c.querySelector("#wen-cAcc")?.addEventListener("click", () => { setAcc(ACC === "sixian" ? "hailu" : "sixian"); ask(current?.i as number); });
      c.querySelectorAll<HTMLButtonElement>("[data-k]").forEach((b) => (b.onclick = () => ({ elder, results, full, tones } as Record<string, () => void>)[b.dataset.k as string]()));
    }
    function renderQuickGuide() {
      const g = qg();
      $("#wen-qgTitle").textContent = g.title;
      $("#wen-veilP").textContent = g.lede;
      $("#wen-qgHow").textContent = g.how;
      $("#wen-qg").innerHTML = g.steps.map(([b, s], i) => `<li><span class="n">${i + 1}</span><div><b>${b}</b><span>${s}</span></div></li>`).join("");
      $("#wen-go").textContent = g.go;
      $("#wen-soundnote").textContent = g.sound;
      $("#wen-optHow").textContent = g.howBtn;
    }
    function renderAll() {
      root.lang = L === "en" ? "en" : "zh-Hant";
      $("#wen-tagline").textContent = t("tagline");
      $("#wen-micB").textContent = t("micB"); $("#wen-micS").textContent = t("micS"); $("#wen-foot").textContent = t("foot");
      $("#wen-sprite").setAttribute("aria-label", t("wen"));
      $("#wen-optPin").hidden = L !== "hak"; $("#wen-optPin").textContent = t("pin"); $("#wen-accGroup").hidden = L !== "hak";
      $("#wen-optBig").textContent = t("big"); $("#wen-optSound").textContent = t("sound");
      $$('[data-group="lang"] [role="radio"]').forEach((b) => { const on = b.dataset.v === L; b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; });
      renderQuickGuide(); renderAsks(); renderCtrl(false);
    }

    /* radio groups with arrow-key roving focus */
    $$('[data-group="lang"]').forEach((g) => {
      const items = Array.from(g.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
      const pick = (b: HTMLButtonElement, focus?: boolean) => {
        L = b.dataset.v as GuideLang; const was = current; stop(); hakNoted = false; renderAll();
        if (focus) (g.querySelector(`[data-v="${L}"]`) as HTMLElement)?.focus();
        if (was && $("#wen-veil").classList.contains("gone")) { current = was; replay(); }
      };
      items.forEach((b, i) => {
        b.onclick = () => pick(b);
        b.onkeydown = (e) => { const d = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key]; if (!d) return; e.preventDefault(); pick(items[(i + d + items.length) % items.length], true); };
      });
    });
    function setAcc(a: "sixian" | "hailu") { ACC = a; $$("#wen-accGroup [role=radio]").forEach((b) => { const on = b.dataset.a === a; b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; }); }
    (() => {
      const items = $$<HTMLButtonElement>("#wen-accGroup [role=radio]");
      items.forEach((b, i) => {
        b.onclick = () => { setAcc(b.dataset.a as "sixian" | "hailu"); if (current && current.kind === "q") ask(current.i as number); };
        b.onkeydown = (e) => { const d = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key]; if (!d) return; e.preventDefault(); const n = items[(i + d + items.length) % items.length]; n.focus(); n.click(); };
      });
    })();
    const toggle = (id: string, get: () => boolean, set: (x: boolean) => void) => { const b = $(id); b.onclick = () => { set(!get()); b.setAttribute("aria-pressed", String(get())); }; };
    toggle("#wen-optPin", () => pin, (x) => { pin = x; if (x) delete root.dataset.nopin; else root.dataset.nopin = ""; });
    toggle("#wen-optBig", () => "big" in root.dataset, (x) => { if (x) root.dataset.big = ""; else delete root.dataset.big; try { localStorage.setItem("wen-big", x ? "1" : ""); } catch {} });
    toggle("#wen-optSound", () => sound, (x) => { sound = x; if (!x) { try { synth?.cancel(); } catch {} } });
    try { if (localStorage.getItem("wen-big")) { root.dataset.big = ""; $("#wen-optBig").setAttribute("aria-pressed", "true"); } } catch {}

    $("#wen-sprite").onclick = () => { if (!active) greet(); };
    $("#wen-mic").onclick = () => { stop(); clearSubs(); current = null; markAsks(-1); sub("", `<span class="who">${t("wen")}</span>${t("micSay")}`); renderCtrl(false); };
    $("#wen-go").onclick = () => {
      $("#wen-veil").classList.add("gone");
      root.classList.remove("qg-open");
      greet(); // spoken inside this tap, which unlocks speech on iOS and Android
      setTimeout(() => (root.querySelector(".ask") as HTMLElement | null)?.focus({ preventScroll: true }), 800);
    };
    $("#wen-optHow").onclick = () => { stop(); root.classList.add("qg-open"); $("#wen-veil").classList.remove("gone"); $("#wen-veil").scrollTop = 0; ($("#wen-go") as HTMLButtonElement).focus({ preventScroll: true }); root.scrollIntoView({ block: "start" }); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") stop(); };
    document.addEventListener("keydown", onKey);
    renderAll();

    return () => {
      disposed = true;
      run++;
      try { active?.cancel(); } catch {}
      try { synth?.cancel(); } catch {}
      document.removeEventListener("keydown", onKey);
    };
  }, [siteLang, nodeSlug]);

  return <div ref={rootRef} className="wen qg-open" dangerouslySetInnerHTML={{ __html: markup(siteLang) }} suppressHydrationWarning />;
}
