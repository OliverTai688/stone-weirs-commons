import type { I18nText } from "@/lib/types";

export const locales = ["en", "zh"] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = "en";
export const LANG_COOKIE = "NEXT_LOCALE";

export const isLang = (v: unknown): v is Lang => locales.includes(v as Lang);

/** Key used for multilingual content fields. */
export const dataKey = (lang: Lang) => (lang === "zh" ? "zh-Hant" : "en");

/** Pick the best text for a language, falling back to the other one. */
export function pick(text: I18nText | undefined, lang: Lang): string {
  if (!text) return "";
  return text[dataKey(lang)] ?? text["zh-Hant"] ?? text.en ?? Object.values(text)[0] ?? "";
}

/** Prefix an app path with the language segment. Leaves external and API paths alone. */
export function localePath(lang: Lang, path: string): string {
  if (!path.startsWith("/") || path.startsWith("/api") || path.startsWith("//")) return path;
  if (locales.some((l) => path === `/${l}` || path.startsWith(`/${l}/`) || path.startsWith(`/${l}?`))) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** Simple "{name}" interpolation for dictionary strings. */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export const intlLocale = (lang: Lang) => (lang === "zh" ? "zh-Hant" : "en");

/** Language for Route Handlers (root params are not available there): header set by the client. */
export function langFromRequest(req: Request): Lang {
  const h = req.headers.get("x-ui-lang");
  return isLang(h) ? h : "en";
}
