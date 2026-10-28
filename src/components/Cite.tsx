import Link from "next/link";

export function Cite({ id, node = "xinwu", label }: { id: string; node?: string; label?: string }) {
  return (
    <Link
      href={`/nodes/${node}/graph#${id}`}
      title={label}
      className="mx-0.5 inline-flex items-center rounded-md bg-foam px-1.5 py-0.5 align-baseline text-[11px] font-semibold text-navy hover:bg-reef/40"
    >
      {node === "xinwu" ? "新屋" : node}・{id}
    </Link>
  );
}
