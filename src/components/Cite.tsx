import { Link } from "@/i18n/client";
import type { Lang } from "@/i18n/config";

export function Cite({ id, node = "xinwu", label, lang }: { id: string; node?: string; label?: string; lang: Lang }) {
  const nodeName = node === "xinwu" ? (lang === "zh" ? "新屋" : "Xinwu") : node;
  return (
    <Link
      href={`/nodes/${node}/graph#${id}`}
      title={label}
      className="mx-0.5 inline-flex items-center rounded-md bg-foam px-1.5 py-0.5 align-baseline text-[11px] font-semibold text-navy hover:bg-reef/40"
    >
      {nodeName}・{id}
    </Link>
  );
}
