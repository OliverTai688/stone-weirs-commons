"use client";

import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, type ComponentProps } from "react";
import type { Dict } from "./dictionaries";
import { LANG_COOKIE, localePath, locales, type Lang } from "./config";

// Only the current language's dictionary is sent to the browser (passed in from the server layout).
const Ctx = createContext<{ lang: Lang; t: Dict }>(null as unknown as { lang: Lang; t: Dict });

export function I18nProvider({ lang, t, children }: { lang: Lang; t: Dict; children: React.ReactNode }) {
  return <Ctx.Provider value={{ lang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  return { ...v, path: (p: string) => localePath(v.lang, p) };
}

/** next/link that keeps the current language prefix. */
export function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const { lang } = useContext(Ctx);
  return <NextLink href={typeof href === "string" ? localePath(lang, href) : href} {...rest} />;
}

/** fetch wrapper for BFF calls: tells the server which language to answer in. */
export function useApi() {
  const { lang } = useContext(Ctx);
  return (path: string, init: RequestInit = {}) =>
    fetch(path, { ...init, headers: { "content-type": "application/json", "x-ui-lang": lang, ...(init.headers ?? {}) } });
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang } = useContext(Ctx);
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const next = locales.find((l) => l !== lang) as Lang;
  function go() {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    const rest = pathname.replace(/^\/(en|zh)(?=\/|$)/, "");
    const qs = search.toString();
    router.push(`/${next}${rest || ""}${qs ? `?${qs}` : ""}`);
  }
  return (
    <button type="button" onClick={go} className={`whitespace-nowrap ${className}`} aria-label={next === "zh" ? "切換為中文" : "Switch to English"} lang={next === "zh" ? "zh-Hant" : "en"}>
      {next === "zh" ? "中文" : "EN"}
    </button>
  );
}
