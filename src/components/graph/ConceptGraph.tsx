"use client";

import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { crmMeta, crmOrder } from "@/lib/crm";
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

/** Column layout by CIDOC-CRM class: readable without a layout engine. */
function layout(entities: GraphEntity[]) {
  const cols = crmOrder.filter((c) => entities.some((e) => e.crmClass === c));
  const pos: Record<string, { x: number; y: number }> = {};
  cols.forEach((c, ci) => {
    entities
      .filter((e) => e.crmClass === c)
      .forEach((e, ri) => {
        pos[e.id] = { x: ci * 230, y: ri * 96 + (ci % 2) * 40 };
      });
  });
  return pos;
}

export function ConceptGraph({ entities, relations, selected, onSelect, showCodes, height = 560 }: Props) {
  const pos = useMemo(() => layout(entities), [entities]);

  const nodes: Node[] = entities.map((e) => {
    const m = crmMeta[e.crmClass];
    const pending = e.confirmed === false;
    return {
      id: e.id,
      position: pos[e.id] ?? { x: 0, y: 0 },
      data: {
        label: (
          <div className="text-left">
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: m.color }}>
              {e.crmClass} {m.zh}
              {e.restricted && " 🔒"}
            </div>
            <div className="text-[13px] font-semibold leading-snug text-ink">{e.label}</div>
            {pending && <div className="mt-0.5 text-[10px] text-slate-500">AI 推測・待確認</div>}
          </div>
        ),
      },
      style: {
        width: 190,
        borderRadius: 12,
        padding: 8,
        background: m.bg,
        border: `2px ${pending ? "dashed" : "solid"} ${selected === e.id ? "#0f1e2e" : m.color}`,
        boxShadow: selected === e.id ? "0 0 0 4px rgba(224,120,90,.35)" : undefined,
      },
    };
  });

  const edges: Edge[] = relations.map((r) => ({
    id: r.id,
    source: r.from,
    target: r.to,
    label: showCodes ? `${r.property} ${r.label}` : r.label,
    labelStyle: { fontSize: 10, fill: "#334155" },
    labelBgStyle: { fill: "#fff", fillOpacity: 0.85 },
    style: { stroke: "#64748b", strokeDasharray: r.confirmed === false ? "5 4" : undefined },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
  }));

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        onNodeClick={(_, n) => onSelect?.(n.id)}
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
