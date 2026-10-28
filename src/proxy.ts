import { NextResponse, type NextRequest } from "next/server";
import { defaultLang, isLang, LANG_COOKIE, locales } from "@/i18n/config";

/**
 * Locale routing: every page lives under /en or /zh. English is the default;
 * a visitor who switched language before keeps their choice (cookie).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;
  const saved = request.cookies.get(LANG_COOKIE)?.value;
  const lang = isLang(saved) ? saved : defaultLang;
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API routes, Next internals and files with an extension (favicon, images…).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
