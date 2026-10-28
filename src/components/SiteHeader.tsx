import Link from "next/link";

const links = [
  { href: "/nodes/xinwu", label: "新屋節點" },
  { href: "/tools/interview", label: "工具一：故事轉概念圖" },
  { href: "/ask", label: "工具二：問 AI" },
  { href: "/governance", label: "資料治理" },
  { href: "/settings/ai", label: "AI 設定" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 text-white backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-wide">
          <span aria-hidden className="inline-block h-6 w-6 rounded-full bg-[radial-gradient(circle_at_30%_30%,#7bc4b2,#2e7d8c_60%,#1f3a5f)]" />
          <span>石滬・共享未來</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-white/80 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/join" className="btn-primary !px-4 !py-1.5">
          加入網絡
        </Link>
      </div>
      <nav className="container-page flex gap-4 overflow-x-auto pb-2 text-xs text-white/80 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
