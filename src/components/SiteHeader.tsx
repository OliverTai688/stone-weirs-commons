"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher, Link, useI18n } from "@/i18n/client";
import { locales } from "@/i18n/config";

type Item = { href: string; label: string; desc: string };
type Group = { id: string; label: string; items: Item[] };

/** Path without the /en or /zh prefix and without a hash, for active-state matching. */
function stripLang(p: string) {
  const seg = p.split("/");
  if ((locales as readonly string[]).includes(seg[1])) seg.splice(1, 1);
  return seg.join("/") || "/";
}

export function SiteHeader() {
  const { t } = useI18n();
  const n = t.nav;
  const pathname = stripLang(usePathname() ?? "/");
  const [open, setOpen] = useState<string | null>(null); // desktop dropdown id
  const [mobile, setMobile] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const groups: Group[] = [
    {
      id: "xinwu",
      label: n.groupXinwu,
      items: [
        { href: "/nodes/xinwu", label: n.overview, desc: n.overviewDesc },
        { href: "/nodes/xinwu/graph", label: n.graph, desc: n.graphDesc },
        { href: "/nodes/xinwu/guide", label: n.guide, desc: n.guideDesc },
        { href: "/exhibit/xinwu", label: n.exhibit, desc: n.exhibitDesc },
      ],
    },
    {
      id: "tools",
      label: n.groupTools,
      items: [
        { href: "/tools/interview", label: n.tool1, desc: n.tool1Desc },
        { href: "/ask", label: n.tool2, desc: n.tool2Desc },
        { href: "/nodes/xinwu/guide#how-it-works", label: n.tool2Guide, desc: n.tool2GuideDesc },
      ],
    },
    {
      id: "about",
      label: n.groupAbout,
      items: [
        { href: "/governance", label: n.governance, desc: n.governanceDesc },
        { href: "/apconf", label: n.apconf, desc: n.apconfDesc },
        { href: "/settings/ai", label: n.ai, desc: n.aiDesc },
      ],
    },
  ];

  const isActive = (href: string) => stripLang(href.split("#")[0]) === pathname;
  const groupActive = (g: Group) => g.items.some((i) => isActive(i.href));

  // Close menus on navigation, outside click and Escape.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reset menus when the route changes
  useEffect(() => { setOpen(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMobile(false); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  const close = () => { setOpen(null); setMobile(false); };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 text-white backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-bold tracking-wide" onClick={close}>
          <span aria-hidden className="inline-block h-6 w-6 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#7bc4b2,#2e7d8c_60%,#1f3a5f)]" />
          <span className="truncate whitespace-nowrap">{t.common.siteName}</span>
        </Link>

        {/* Desktop: three grouped dropdowns */}
        <nav ref={navRef} aria-label="Main" className="hidden items-center gap-1 text-sm lg:flex">
          {groups.map((g) => {
            const expanded = open === g.id;
            return (
              <div key={g.id} className="relative" onMouseEnter={() => setOpen(g.id)} onMouseLeave={() => setOpen((o) => (o === g.id ? null : o))}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`nav-${g.id}`}
                  onClick={() => setOpen(expanded ? null : g.id)}
                  className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white ${groupActive(g) ? "text-white" : "text-white/80"}`}
                >
                  {g.label}
                  {groupActive(g) && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-reef" />}
                  <svg aria-hidden viewBox="0 0 12 12" className={`h-3 w-3 transition ${expanded ? "rotate-180" : ""}`}><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
                </button>
                {/* pt-2 keeps the hover area continuous between button and panel */}
                <div id={`nav-${g.id}`} hidden={!expanded} className="absolute left-0 top-full w-80 pt-2">
                  <ul className="rounded-2xl bg-white p-2 text-slate-800 shadow-xl ring-1 ring-black/5">
                    {g.items.map((i) => (
                      <li key={i.href}>
                        <Link
                          href={i.href}
                          onClick={close}
                          aria-current={isActive(i.href) ? "page" : undefined}
                          className={`block rounded-xl px-3 py-2.5 hover:bg-foam ${isActive(i.href) ? "bg-foam" : ""}`}
                        >
                          <span className="block text-sm font-semibold text-navy">{i.label}</span>
                          <span className="mt-0.5 block text-xs text-slate-500">{i.desc}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold hover:bg-white/10" />
          <Link href="/join" onClick={close} className="btn-primary !px-4 !py-1.5 whitespace-nowrap">
            <span className="sm:hidden">{n.joinShort}</span>
            <span className="hidden sm:inline">{n.join}</span>
          </Link>
          <button
            type="button"
            aria-expanded={mobile}
            aria-controls="nav-mobile"
            onClick={() => setMobile((m) => !m)}
            className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold hover:bg-white/10 lg:hidden"
          >
            {mobile ? n.close : n.menu}
          </button>
        </div>
      </div>

      {/* Mobile / tablet: full grouped menu */}
      <nav id="nav-mobile" aria-label="Main" hidden={!mobile} className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-white/10 bg-ink lg:hidden">
        <div className="container-page grid gap-6 py-5 sm:grid-cols-3">
          {groups.map((g) => (
            <div key={g.id}>
              <p className="text-xs font-bold uppercase tracking-widest text-reef">{g.label}</p>
              <ul className="mt-2 space-y-1">
                {g.items.map((i) => (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      onClick={close}
                      aria-current={isActive(i.href) ? "page" : undefined}
                      className={`block rounded-xl px-3 py-2 ${isActive(i.href) ? "bg-white/10" : "hover:bg-white/5"}`}
                    >
                      <span className="block text-sm font-semibold">{i.label}</span>
                      <span className="block text-xs text-white/60">{i.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </header>
  );
}
