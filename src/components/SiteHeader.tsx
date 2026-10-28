"use client";

import { LanguageSwitcher, Link, useI18n } from "@/i18n/client";

export function SiteHeader() {
  const { t } = useI18n();
  const links = [
    { href: "/nodes/xinwu", label: t.nav.node },
    { href: "/tools/interview", label: t.nav.tool1 },
    { href: "/ask", label: t.nav.tool2 },
    { href: "/governance", label: t.nav.governance },
    { href: "/settings/ai", label: t.nav.ai },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 text-white backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-wide">
          <span aria-hidden className="inline-block h-6 w-6 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#7bc4b2,#2e7d8c_60%,#1f3a5f)]" />
          <span className="whitespace-nowrap">{t.common.siteName}</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-white/80 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold hover:bg-white/10" />
          <Link href="/join" className="btn-primary !px-4 !py-1.5 whitespace-nowrap">
            {t.nav.join}
          </Link>
        </div>
      </div>
      <nav className="container-page flex gap-4 overflow-x-auto pb-2 text-xs text-white/80 lg:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
