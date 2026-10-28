import "server-only";
import { listEntities, listIndexableEntities, listRelations, getNode } from "./repo";
import type { FpicStatus } from "@/lib/types";

export interface NodeMetrics {
  records: number;
  relations: number;
  byClass: Record<string, number>;
  provenancePct: number; // share of records with a PROV-O source
  approvedPct: number;
  fpic: Record<FpicStatus, number>;
  restricted: number; // records in the restricted geo tier
  restrictedExposed: number; // restricted records that leaked into the AI index (must be 0)
  localTerms: number;
  languages: string[]; // language codes
}

/** Indicators computed from the node's current records — they change as records change. */
export async function nodeMetrics(slug: string): Promise<NodeMetrics> {
  const [node, entities, relations, indexed] = await Promise.all([getNode(slug), listEntities(slug), listRelations(slug), listIndexableEntities([slug])]);
  const n = entities.length || 1;
  const fpic: Record<FpicStatus, number> = { obtained: 0, assumed: 0, pending: 0, withdrawn: 0 };
  const byClass: Record<string, number> = {};
  const langs = new Set<string>(node?.languages ?? []);
  let terms = 0;
  for (const e of entities) {
    fpic[e.governance.fpic]++;
    byClass[e.crmClass] = (byClass[e.crmClass] ?? 0) + 1;
    for (const t of e.terms ?? []) {
      terms++;
      langs.add(t.language);
    }
  }
  const restrictedIds = new Set(entities.filter((e) => e.governance.geoTier === "restricted").map((e) => e.id));
  return {
    records: entities.length,
    relations: relations.length,
    byClass,
    provenancePct: Math.round((entities.filter((e) => e.source?.trim()).length / n) * 100),
    approvedPct: Math.round((entities.filter((e) => e.governance.status === "approved").length / n) * 100),
    fpic,
    restricted: restrictedIds.size,
    restrictedExposed: indexed.filter((e) => restrictedIds.has(e.id)).length,
    localTerms: terms,
    languages: [...langs],
  };
}
