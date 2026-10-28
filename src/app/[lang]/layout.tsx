import type { Metadata } from "next";
import { Suspense } from "react";
import "../globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { I18nProvider } from "@/i18n/client";
import { intlLocale, locales } from "@/i18n/config";
import { getDict } from "@/i18n/server";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return {
    title: { default: `${t.meta.title}｜${t.common.siteNameAlt}`, template: `%s｜${t.meta.title}` },
    description: t.meta.description,
    alternates: { languages: { en: "/en", "zh-Hant": "/zh" } },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { lang, t } = await getDict();
  return (
    <html lang={intlLocale(lang)} className="h-full">
      <body className="flex min-h-full flex-col">
        <I18nProvider lang={lang} t={t}>
          <Suspense fallback={<div className="h-14 bg-ink" />}>
            <SiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-sand/60 py-8 text-sm text-slate-600">
            <div className="container-page flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p>{t.common.siteName} {t.common.siteNameAlt} — Yu-Hsin TAI, Chen-Min LAI, Jen-Fu LEE, Yun-Fang CHANG</p>
              <p className="text-xs">{t.common.footerNote}</p>
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
