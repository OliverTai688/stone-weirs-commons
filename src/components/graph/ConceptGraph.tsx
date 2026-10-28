"use client";

import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { crmMeta, crmOrder } from "@/lib/crm";
import { useI18n } from "@/i18n/client";
import type { CrmClass } from "@/lib/types";

export interface GraphEntity {
  id: string;
  crmClass: CrmClass;
  label: string;
  confirmed?: boolean;
  restricted?: boolean;
}
export interface GraphRelation {
  id: string;
  from: string;
  to: string;
  label: string;
  property: string;
  confirmed?: boolean;
}

interface Props {
  entities: GraphEntity[];
  relations: GraphRelation[];
  selected?: string | null;
  onSelect?: (id: string) => void;
  showCodes?: boolean;
  height?: number | string;
}

const NODE_W = 190;
const COL_W = 215;
const ROW_H = 84;
const MAX_ROWS = 3; // a class block wraps into sub-columns after this many rows
const GROUP_GAP_X = 60;
const GROUP_GAP_Y = 70;
const HEADER_H = 34;

/**
 * Grouped layout: one block per CIDOC-CRM class, blocks flow left→right and wrap,
 * so the graph stays close to the viewport's aspect ratio and labels stay legible.
 */
function layout(entities: GraphEntity[], maxRowWidth: number) {
  const pos: Record<string, { x: number; y: number }> = {};
  const headers: { cls: CrmClass; x: number; y: number }[] = [];
  let x = 0;
  let y = 0;
  let rowH = 0;
  for (const c of crmOrder) {
    const items = entities.filter((e) => e.crmClass === c);
    if (!items.length) continue;
    const subCols = Math.ceil(items.length / MAX_ROWS);
    const rows = Math.min(items.length, MAX_ROWS);
    const w = subCols * COL_W;
    const h = HEADER_H + rows * ROW_H;
    if (x > 0 && x + w > maxRowWidth) {
      x = 0;
      y += rowH + GROUP_GAP_Y;
      rowH = 0;
    }
    headers.push({ cls: c, x, y });
    items.forEach((e, i) => {
      pos[e.id] = { x: x + Math.floor(i / MAX_ROWS) * COL_W, y: y + HEADER_H + (i % MAX_ROWS) * ROW_H };
    });
    x += w + GROUP_GAP_X;
    rowH = Math.max(rowH, h);
  }
  return { pos, headers };
}

export function ConceptGraph({ entities, relations, selected, onSelect, showCodes, height = 560 }: Props) {
  const { t } = useI18n();
  const { pos, headers } = useMemo(() => layout(entities, 1150), [entities]);

  const headerNodes: Node[] = headers.map((h) => ({
    id: `hdr-${h.cls}`,
    position: { x: h.x, y: h.y },
    data: { label: <span>{h.cls} {t.crm[h.cls]}</span> },
    draggable: false,
    selectable: false,
    connectable: false,
    style: { width: "auto", border: "none", background: "transparent", boxShadow: "none", padding: 0, fontSize: 13, fontWeight: 700, color: crmMeta[h.cls].color, pointerEvents: "none" as const },
  }));

  const entityNodes: Node[] = entities.map((e) => {
    const m = crmMeta[e.crmClass];
    const pending = e.confirmed === false;
    return {
      id: e.id,
      position: pos[e.id] ?? { x: 0, y: 0 },
      data: {
        label: (
          <div className="text-left">
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: m.color }}>
              {e.crmClass} {t.crm[e.crmClass]}
              {e.restricted && " 🔒"}
            </div>
            <div className="text-[13px] font-semibold leading-snug text-ink">{e.label}</div>
            {pending && <div className="mt-0.5 text-[10px] text-slate-500">{t.graph.pending}</div>}
          </div>
        ),
      },
      style: {
        width: NODE_W,
        borderRadius: 12,
        padding: 8,
        background: m.bg,
        border: `2px ${pending ? "dashed" : "solid"} ${selected === e.id ? "#0f1e2e" : m.color}`,
        boxShadow: selected === e.id ? "0 0 0 4px rgba(224,120,90,.35)" : undefined,
      },
    };
  });

  const nodes = [...headerNodes, ...entityNodes];

  // Only the selected node's relations carry labels; the rest stay as quiet lines.
  const edges: Edge[] = relations.map((r) => {
    const active = !selected || r.from === selected || r.to === selected;
    const labelled = Boolean(selected) && active;
    const color = labelled ? "#e0785a" : active ? "#64748b" : "#cbd5e1";
    return {
      id: r.id,
      source: r.from,
      target: r.to,
      label: labelled ? (showCodes ? `${r.property} ${r.label}` : r.label) : undefined,
      labelStyle: { fontSize: 11, fill: "#0f1e2e", fontWeight: 600 },
      labelBgStyle: { fill: "#fff", fillOpacity: 0.92 },
      zIndex: labelled ? 10 : 0,
      style: { stroke: color, strokeWidth: labelled ? 2 : 1, strokeDasharray: r.confirmed === false ? "5 4" : undefined },
      markerEnd: { type: MarkerType.ArrowClosed, color },
    };
  });

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        onNodeClick={(_, n) => !n.id.startsWith("hdr-") && onSelect?.(n.id)}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
      >
        <Background gap={24} color="#e2e8f0" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
