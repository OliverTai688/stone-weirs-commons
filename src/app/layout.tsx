import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: { default: "石滬・共享未來｜Stone Weirs, Shared Futures", template: "%s｜石滬・共享未來" },
  description: "亞太海洋文化遺產交流平台：把你的故事說出來，AI 幫你留下完整的脈絡。Tell your story — AI keeps the context.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className="h-full">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-sand/60 py-8 text-sm text-slate-600">
          <div className="container-page flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>石滬・共享未來 Stone Weirs, Shared Futures — Yu-Hsin TAI, Chen-Min LAI, Jen-Fu LEE, Yun-Fang CHANG</p>
            <p className="text-xs">Pilot・示範版本：資料暫存於程式碼，尚未連接資料庫</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
